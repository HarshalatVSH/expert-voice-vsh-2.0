/* eslint-disable  */
import { AnalyticEvent, CdnUrlBase, MessageType, NotificationType, UrlBase } from "./constants";
import { getAuthCookie, getCacheable, getNotificationType, isAuthCookie, isAuthenticated, toAbsoluteUrl, removeFromCache } from "./helper";

const ACTIVE_ICONS = {
  16: "assets/images/icon16.png",
  48: "assets/images/icon48.png",
  128: "assets/images/icon128.png",
};

const INACTIVE_ICONS = {
  16: "assets/images/icon16_gray.png",
  48: "assets/images/icon48_gray.png",
  128: "assets/images/icon128_gray.png",
};

const loadUser = () =>
  getCacheable(
    "user",
    async () => {
      // Quick check of the auth cookie to see if the user is even logged in
      const authed = await isAuthenticated();
      if (authed) {
        // Load the user's details
        const res = await fetch(`${UrlBase}/xapi/user/ext/1.0/users/me`);
        if (res.ok) {
          const data = await res.json();
          return {
            avatar: data.avatar,
            firstName: data.firstName,
            lastName: data.lastName,
            userId: data.userId,
            uuid: data.uuid,
          };
        }

        return null;
      }

      return null;
    },
    { ttl: 86400000 }
  ); // 1 day

const loadContext = async (params = {}) => {
  try {
    const res = await fetch(`${UrlBase}/xapi/browser-support/pub/1.0/search`, {
      method: "POST",
      body: JSON.stringify({
        ...params,
        maxResults: 1,
      }),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    // const data = await res.json();
    const data = {
      brands: [
        {
          orgId: 139576,
          text: "Klymit",
          score: 111325.0625,
          exactMatch: true,
          orgKey: "klymit",
          url: "/brand/klymit",
          accessType: "UNKNOWN",
          avatarUrl: "/xapi/xds/ext/gimg/ee9afa6cfb1f4683/1692691833/brandAvatar.png",
          active: true,
          discount: -1,
        },
      ],
      products: [
        {
          orgId: 139576,
          text: "Static V Sleeping Pad",
          score: 1.0,
          exactMatch: true,
          productCode: "Static-V",
          imageUrl: "https://cdn.expertvoice.com/io/client/mfg/klymit/images/product/src/sc.400.400.bf/Klymit_StaticV_Front_Deep_StuffSack_v1.jpg",
          pdpUrl: "/product/klymit-static-v-sleeping-pad/139576?p=Static-V",
          price: 0.0,
          msrp: 0.0,
          bestPrice: 0.0,
          discountPct: 0.0,
          reviewStars: 4.53,
          reviewRating: 8.92,
          reviewCount: 324,
          inStock: false,
          currencyCode: "N/A",
          accessConfirmed: false,
        },
      ],
    };
    let [brand] = data.brands || [];
    let [product] = data.products || [];
    if (brand) {
      brand = {
        accessType: brand.accessType,
        active: brand.active,
        avatar: toAbsoluteUrl(brand.avatarUrl, CdnUrlBase),
        discount: brand.discount,
        exactMatch: brand.exactMatch,
        name: brand.text,
        orgId: brand.orgId,
        orgKey: brand.orgKey,
        rewarded: brand.accessType === "REWARDED",
        score: brand.score,
        targeted: brand.accessType !== "UNKNOWN",
        url: toAbsoluteUrl(brand.url),
      };
    }
    if (product && brand?.orgId === product.orgId) {
      product = {
        accessConfirmed: product.accessConfirmed,
        bestPrice: product.bestPrice,
        currencyCode: product.currencyCode,
        discountPct: product.discountPct,
        exactMatch: product.exactMatch,
        imageUrl: product.imageUrl,
        inStock: product.inStock,
        msrp: product.msrp,
        name: product.text,
        orgId: product.orgId,
        pdpUrl: toAbsoluteUrl(product.pdpUrl),
        price: product.price,
        productCode: product.productCode,
        reviewCount: product.reviewCount,
        reviewRating: product.reviewRating,
        reviewStars: product.reviewStars,
        score: product.score,
      };
    } else {
      product = undefined;
    }
    return {
      brand,
      page: params,
      product,
    };
  } catch (ex) {
    // ignore
  }

  return null;
};

const sendEvent = (action, data = {}) => {
  fetch(`${UrlBase}/xapi/ac/pub/1.0/event`, {
    method: "POST",
    body: JSON.stringify({
      action,
      appName: "ev-shop-plugin",
      data: {
        version: browser.runtime.getManifest().version,
        ...data,
      },
      mfgId: data?.mfgId || data?.orgId || undefined,
      url: data?.url || undefined,
      version: 1,
    }),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const syncBadge = (tabId, context, user) => {
  if (context) {
    const notif = getNotificationType(context, user);
    if (context?.brand?.active && notif) {
      // We got a high-confidence match, update the icon to be 'active'.
      browser.browserAction.setIcon({ tabId, path: ACTIVE_ICONS });
      browser.browserAction.setBadgeText({ tabId, text: "1" });
      browser.browserAction.setBadgeBackgroundColor({
        tabId,
        color: notif === NotificationType.ACTIVE ? "#52B382" : "#E3E3E3",
      });
    } else {
      // Keep the extension icon in the 'inactive' state.
      browser.browserAction.setIcon({ tabId, path: INACTIVE_ICONS });
      browser.browserAction.setBadgeText({ tabId, text: "" });
    }
  } else {
    browser.browserAction.setIcon({ tabId, path: INACTIVE_ICONS });
    browser.browserAction.setBadgeText({ tabId, text: "" });
  }
};

const syncContext = (tabId, context, user) => {
  console.log(user, "usersync");
  browser.tabs.sendMessage(tabId, { type: MessageType.DATA, context, user });
};

const triggerSync = async (tabId, user, sendResponse) => {
  const context = await browser.tabs.sendMessage(tabId, { type: MessageType.SYNC, user });
  if (context.brand) {
    syncBadge(tabId, context, user);
    syncContext(tabId, context, user);
  }
  if (sendResponse) {
    sendResponse({
      ...context,
      user,
    });
  }
};
browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type || "") {
    case MessageType.AC:
      sendEvent(msg.action, msg.data);
      break;
    case MessageType.CONTEXT:
      // Search for the brand & load the user
      Promise.all([loadContext(msg.data), loadUser()]).then(([context, user]) => {
        // Sync the badge with the brand results
        syncBadge(sender.tab.id, context, user);
        syncContext(sender.tab.id, context, user);

        sendResponse({
          ...context,
          user,
        });
      });
      break;
    case MessageType.LOGIN:
      fetch(`${UrlBase}/sign-on/service/sign-in`, {
        method: "POST",
        body: `identifier=${encodeURIComponent(msg.identifier)}&password=${encodeURIComponent(msg.password)}`,
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          sendResponse(data);
        });
      break;
    case MessageType.LOGOUT:
      // Fire the sign-out request so on-platform things happen.
      fetch(`${UrlBase}/sign-out`, {
        credentials: "include",
        redirect: "follow",
      }).then(async (res) => {
        if (res.ok) {
          // Clear the cached results
          await removeFromCache("user");
        }

        return sendResponse(res.ok);
      });
      break;
    case MessageType.RESET:
      triggerSync(sender.tab.id, msg.user, sendResponse);
      break;
    case MessageType.LOGIN_START:
      browser.tabs.sendMessage(sender.tab.id, { type: MessageType.LOGIN_SHOW });
      break;
    default:
      return false;
  }

  return true; // Tell chrome it's asynchronous
});

// Send an AC event when the user first installs
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === browser.runtime.OnInstalledReason.INSTALL) {
    sendEvent(AnalyticEvent.INSTALL);
  }
});

// Trigger the content popup on the tab where the action (extension icon) was clicked
browser.browserAction?.onClicked.addListener((tab) => {
  browser.tabs.sendMessage(tab.id, { type: MessageType.OPEN });
});

// Watch for changes to the auth cookie to maintain the auth state
browser.cookies.onChanged.addListener(async (e) => {
  // Check if this is our auth cookie
  if (isAuthCookie(e.cookie)) {
    const c = await getAuthCookie();
    if (!c) {
      // The user signed out. Clear the user state.
      removeFromCache("user");
    }
  }
});

// Trigger a sync event whenever a tab is reactivated
browser.tabs.onActivated.addListener(async () => {
  try {
    const user = await loadUser();
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

    triggerSync(tab.id, user);
  } catch (ex) {
    // ignore
  }
});

function sendMessageToTabs(tabs) {
  const context = {
    brands: [
      {
        orgId: 139576,
        text: "Klymit",
        score: 111325.0625,
        exactMatch: true,
        orgKey: "klymit",
        url: "/brand/klymit",
        accessType: "UNKNOWN",
        avatarUrl: "/xapi/xds/ext/gimg/ee9afa6cfb1f4683/1692691833/brandAvatar.png",
        active: true,
        discount: -1,
      },
    ],
    products: [
      {
        orgId: 139576,
        text: "Static V Sleeping Pad",
        score: 1.0,
        exactMatch: true,
        productCode: "Static-V",
        imageUrl: "https://cdn.expertvoice.com/io/client/mfg/klymit/images/product/src/sc.400.400.bf/Klymit_StaticV_Front_Deep_StuffSack_v1.jpg",
        pdpUrl: "/product/klymit-static-v-sleeping-pad/139576?p=Static-V",
        price: 0.0,
        msrp: 0.0,
        bestPrice: 0.0,
        discountPct: 0.0,
        reviewStars: 4.53,
        reviewRating: 8.92,
        reviewCount: 324,
        inStock: false,
        currencyCode: "N/A",
        accessConfirmed: false,
      },
    ],
  };

  const user = {
    avatar: "https://res.cloudinary.com/experticity/image/upload/co_rgb:E5705E,e_colorize,h_200,w_200/co_rgb:FFF,l_text:Source%20Sans%20Pro_90_bold:AB/v1614801417/lite-gray_iqaexe.png",
    firstName: "Aditya",
    lastName: "Balbudhe",
    userId: 6224036,
    uuid: "C7C9979BC26E40B9BEBCC42B0133D512",
  };
  for (const tab of tabs) {
    browser.tabs
      .sendMessage(tab.id, { type: MessageType.DATA, context, user })
      .then((response) => {
        console.log("Message from the content script:");
        console.log(response.response);
      })
      .catch(onError);
  }
}

browser.browserAction.onClicked.addListener(() => {
  browser.tabs
    .query({
      currentWindow: true,
      active: true,
    })
    .then(sendMessageToTabs)
    .catch(onError);
});