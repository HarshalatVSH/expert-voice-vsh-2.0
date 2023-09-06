/* eslint-disable  */
import { InlineVariant, MessageType, NotificationType, UrlBase, UtmPlacement } from "./constants";

// ----------------------------------
// Analytics Helpers
// ----------------------------------
export const sendAC = (action, data = {}) =>
  browser.runtime.sendMessage({
    action,
    data: {
      ...data,
      url: document.location.href,
    },
    type: MessageType.AC,
  });

export const event = (action,data={}) =>{
  fetch(`${UrlBase}/xapi/ac/pub/1.0/event`, {
    method: "POST",
    body: JSON.stringify({
      action:"EXTENSION_SEARCH",
      appName: "ev-shop-plugin",
      data: {
        version: chrome.runtime.getManifest().version,
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
  }).then((res) => console.log(res,"helperRes"))
  .catch((err) => console.log(err,"helperErr"));
}

// ----------------------------------
// Auth Helpers
// ----------------------------------
export const AUTH_COOKIE = "__at"; // also __at2 with auth2 & gateway2
export const AUTH_DOMAIN = "https://www.expertvoice.com";

export const isAuthCookie = (c) => AUTH_DOMAIN.includes(c?.domain) && c?.name?.startsWith(AUTH_COOKIE);

export function getAuthCookie() {
  return new Promise(function (resolve, reject) {
    browser.cookies.getAll({ url: AUTH_DOMAIN }, function (cookies) {
      const authCookie = cookies.find(function (c) {
        return isAuthCookie(c);
      });
      resolve(authCookie);
    });
  });
}
export const isAuthenticated = async () => {
  const c = await getAuthCookie();
  return !!c;
};

// ----------------------------------
// Cache Helpers
// ----------------------------------

export const getFromCache = async (key, { ttl } = {}) => {
  return new Promise((resolve, reject) => {
    browser.storage.local.get([key], (entries) => {
      const entry = entries?.[key];
      if (entry?.created && entry?.value && (!ttl || entry.created + ttl > Date.now())) {
        resolve(entry.value);
      } else {
        resolve(null);
      }
    });
  });
};

export const getCacheable = async (key, supplier, { reset = false, ttl } = {}) => {
  // Try to pull from storage
  const cached = await getFromCache(key, { ttl });
  if (cached) {
    if (reset) {
      // Remove the previously cached item
      browser.storage.local.remove(key);
    } else {
      return cached;
    }
  }

  const loaded = await supplier();
  if (loaded) {
    // Cache the new item
    browser.storage.local.set({
      [key]: {
        created: Date.now(),
        value: loaded,
      },
    });
    return loaded;
  }

  return null;
};
export const removeFromCache = async (...keys) => browser.storage.local.remove(keys);

// ----------------------------------
// Product Price Helpers
// ----------------------------------
export const getPrice = (data) => {
  let p = data?.bestPrice || data?.price;
  if (typeof p === "string") {
    p = parseFloat(p);
  }
  return p >= 0 ? p : null; // verify if price is valid
};

export const isComparablePrice = (product, page) => {
  const pEV = product?.accessConfirmed ? getPrice(product) : null;
  const pPage = getPrice(page);
  if (pEV === null || pPage === null) {
    return null;
  }
  return pEV <= pPage;
};

export const formatPrice = (product) => {
  const price = getPrice(product);
  if (price === null) {
    return null;
  }

  const currency = product.currencyCode && product.currencyCode !== "N/A" ? product.currencyCode : "USD";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);
};

// ----------------------------------
// Review Summary Helpers
// ----------------------------------
export const getRoundedStar = (reviewStars) => (reviewStars ? (Math.round(reviewStars * 10) / 10).toFixed(1) : null);

export const formatInteger = (n) => {
  if (typeof n !== "number") {
    return null;
  }
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
};

// ----------------------------------
// Product Name Helpers
// ----------------------------------
const decodeHTML = (string) => {
  const div = document.createElement("div");
  div.innerHTML = string;
  return div.textContent;
};

const formatHtml = (input = "") => {
  let output = input;
  if (input.includes("&reg")) {
    output = output.replace(/&reg/gi, "&#174");
  }
  if (input.includes("&copy")) {
    output = output.replace(/&copy/gi, "&#169");
  }
  if (input.includes("&trade")) {
    output = output.replace(/&trade/gi, "&#8482");
  }
  return output;
};

export const formatProductName = (value) => decodeHTML(formatHtml(value).replace(/&#(\d+);/g, (m, n) => String.fromCharCode(n)));

// ----------------------------------
// Context Helpers
// ----------------------------------
export const getNotificationType = ({ brand, page, product }, user) => {
  if (!brand) {
    return null;
  }
  if (brand?.active) {
    if (!user) {
      return NotificationType.ACTIVE;
    }

    if (brand?.rewarded) {
      if (product) {
        if (!product.inStock && product.accessConfirmed) {
          return NotificationType.PASSIVE;
        }

        const evIsCheaper = isComparablePrice(product, page);
        if (evIsCheaper === null) {
          return NotificationType.ACTIVE;
        }

        return evIsCheaper ? NotificationType.ACTIVE : NotificationType.PASSIVE;
      }

      return NotificationType.ACTIVE;
    }

    return brand.targeted ? NotificationType.PASSIVE : null;
  }

  return null;
};

export const getInlineVariant = ({ brand, page, product }, user) => {
  if (!user) {
    return InlineVariant.LOGGED_OUT;
  }

  const evIsCheaper = isComparablePrice(product, page);
  if (evIsCheaper === false) {
    return InlineVariant.NO_SAVINGS;
  }

  if (!product?.inStock && product?.accessConfirmed) {
    return InlineVariant.OOS;
  }

  if (evIsCheaper) {
    return InlineVariant.DISCOUNT_PRICE;
  }

  if (brand?.discount > 0) {
    return InlineVariant.DISCOUNT_PERCENT;
  }

  return InlineVariant.DISCOUNT_GENERIC;
};

// ----------------------------------
// Url Helpers
// ----------------------------------
export const toAbsoluteUrl = (src, base = UrlBase) => {
  if (!src) {
    return null;
  }

  return new URL(src, base).href;
};

const addQueryParams = (url, newParams = []) => {
  const newUrl = new URL(url);
  const params = newUrl.searchParams;

  newParams.forEach(([key, value]) => {
    params.append(key, value);
  });

  return newUrl.href;
};

const addUTMParams = (url, placement) =>
  addQueryParams(url, [
    ["ac_tracking", "extension"],
    ["utm_source", "amazon"],
    ["utm_medium", "chrome"],
    ["utm_placement", placement],
  ]);

export const getEVHomeUrl = (placement = UtmPlacement.POPUP_LEARN) => addUTMParams(UrlBase, placement);

export const getEVBrandsUrl = (placement = UtmPlacement.POPUP_MY_BRANDS) => addUTMParams(`${UrlBase}/home/brands`, placement);

export const getBrandUrls = (brand, placement = UtmPlacement.POPUP_BRAND) => {
  if (!brand) return {};
  return {
    brand: addUTMParams(brand.url, placement),
    plp: addUTMParams(`${UrlBase}/shop/brand/${brand.orgId}/${brand.orgKey}`, placement),
  };
};

export const getProductUrls = (product, placementPrefix = "POPUP") => {
  if (!product) return {};
  return {
    pdp: addUTMParams(product.pdpUrl, UtmPlacement[`${placementPrefix}_PRODUCT`]),
    reviewPrompt: addUTMParams(addQueryParams(product.pdpUrl, [["launch", "true"]]), UtmPlacement[`${placementPrefix}_REVIEWS`]),
    reviews: addUTMParams(addQueryParams(product.pdpUrl, [["section", "recommendations"]]), UtmPlacement[`${placementPrefix}_REVIEWS`]),
  };
};
