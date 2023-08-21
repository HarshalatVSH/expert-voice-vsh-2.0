export const UrlBase = 'https://www.expertvoice.com';
export const CdnUrlBase = 'https://cdn.expertvoice.com';

export const AnalyticEvent = {
  CLOSE: 'EXTENSION_CLOSE',
  CTA_CLICK: 'EXTENSION_CTA_CLICK',
  INLINE_CTA_CLICK: 'EXTENSION_INLINE_CTA_CLICK',
  INLINE_ERROR: 'EXTENSION_INLINE_ERROR',
  INSTALL: 'EXTENSION_INSTALLED',
  LOGIN: 'EXTENSION_LOGIN',
  LOGIN_ERROR: 'EXTENSION_LOGIN_ERROR',
  OPEN: 'EXTENSION_OPEN',
  REPORT: 'EXTENSION_REPORT',
  SEARCH: 'EXTENSION_SEARCH',
  SIGN_UP: 'EXTENSION_SIGNUP',
};

export const CtaType = {
  BRAND: 'BRAND',
  BRAND_PLP: 'BRAND_PLP',
  EV_BRANDS: 'EV_BRANDS',
  EV_HOME: 'EV_HOME',
  LOGIN: 'LOGIN',
  PDP: 'PDP',
  PDP_REVIEW_PROMPT: 'PDP_REVIEW_PROMPT',
  PDP_REVIEWS: 'PDP_REVIEWS',
};

export const InlineVariant = {
  DISCOUNT_GENERIC: 'discount-generic',
  DISCOUNT_PERCENT: 'discount-percent',
  DISCOUNT_PRICE: 'discount-price',
  LOGGED_OUT: 'logged-out',
  NO_SAVINGS: 'no-savings',
  OOS: 'oos',
};

export const MessageType = {
  AC: 'ac', // Publishes an analytic event
  CONTEXT: 'context', // Initiates a context load with parsed page data
  DATA: 'data', // Updates page components' context and user data
  LOGIN: 'login:submit', // Submits the Login form
  LOGIN_SHOW: 'login:show', // Opens popup with login form
  LOGIN_START: 'login:start', // Requests to open popup and login form
  LOGOUT: 'logout', // Initiates a logout
  OPEN: 'open', // Opens the popup in the overlay
  SYNC: 'sync', // Sync's the state in the content script with the user
  RESET: 'reset', // Initiates a context load from page components
};

export const NotificationType = {
  ACTIVE: 'active',
  PASSIVE: 'passive',
};

export const PopupMode = {
  LOGIN: 'login',
  REPORT: 'report',
};

export const UtmPlacement = {
  INLINE_PRODUCT: 'inline_product',
  INLINE_REVIEWS: 'inline_reviews',
  POPUP_BRAND: 'popup_brand',
  POPUP_LEARN: 'popup_learn_more',
  POPUP_MY_BRANDS: 'popup_my_brands',
  POPUP_PRODUCT: 'popup_product',
  POPUP_REVIEWS: 'popup_reviews',
};
