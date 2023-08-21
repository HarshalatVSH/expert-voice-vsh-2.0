import AbstractExtractor, { PageType } from './AbstractExtractor';

const extractDetails = (el) => {
  const result = {};
  if (!el) {
    // Nothing found.
    return result;
  }

  // They use a mix of tables & ul
  let items = el.getElementsByTagName('li');
  if (!items?.length) {
    items = el.getElementsByTagName('tr');
  }

  for (let i = 0, n = items.length; i < n; i += 1) {
    const item = items[i];

    // Sometimes they're nested
    let children = item?.children;
    if (children?.length === 1) {
      children = children[0]?.children;
    }

    if (!children.length) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const key = children[0]?.innerText?.toLowerCase().trim() || '';
    const value = children[1]?.innerText?.toLowerCase().trim() || '';

    if (key.includes('asin')) {
      result.identifier = value;
    } else if (key === 'brand') {
      result.brand = value;
    } else if (key.includes('manufacturer')) {
      result.mfg = value;
    } else if (key.includes('model name') || key.includes('model number')) {
      result.model = value;
    } else if (key.includes('part number')) {
      result.sku = value;
    }
  }

  return result;
};

const extractPrice = () => {
  const el = document.getElementById('twister-plus-price-data-price');
  return el?.value;
};

/**
 * Amazon Page Extractor
 */
class AmazonExtractor extends AbstractExtractor {
  constructor() {
    super({
      domain: 'amazon',
      key: 'amazon',
      parse: () => {
        const primary = extractDetails(document.getElementById('prodDetails'));
        const secondary = extractDetails(document.getElementById('detailBullets_feature_div'));
        return {
          brandText: document.getElementById('bylineInfo')?.innerText,
          identifier: primary.identifier || secondary.identifier,
          itemName: document.getElementById('title')?.innerText,
          model: primary.model || secondary.model,
          sku: primary.sku || secondary.sku,
          searchTerm: document.querySelector('#nav-search-bar-form .nav-search-field input')?.value,
          price: extractPrice(),
          primaryBrandText: primary.brand,
          primaryMfgText: primary.mfg,
          secondaryBrandText: secondary.brand,
          secondaryMfgText: secondary.mfg,
        };
      },
      type: PageType.RETAILER,
    });
  }
}

export default new AmazonExtractor();
