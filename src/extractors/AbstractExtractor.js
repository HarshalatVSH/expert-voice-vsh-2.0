export const PageType = {
  BRAND: 'brand',
  RETAILER: 'retailer',
};

/**
 * Page Data Extractor
 */
class AbstractExtractor {
  constructor({ domain, key, parse, type }) {
    this.domain = (domain || '').toLowerCase();
    this.key = key;
    this.parse = parse;
    this.type = type;
  }

  handles(hostname) {
    return hostname?.toLowerCase()?.includes(this.domain);
  }

  extract() {
    const data = this.parse?.();
    if (!data) {
      return null;
    }

    return {
      ...data,
      source: this.key,
    };
  }
}

export default AbstractExtractor;
