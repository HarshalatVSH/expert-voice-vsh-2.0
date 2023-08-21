import * as extractors from './extractors';

export default () => {
  const { hostname } = document.location;

  const values = Object.values(extractors);
  for (let i = 0; i < values.length; i += 1) {
    if (values[i].handles(hostname)) {
      return values[i].extract(hostname);
    }
  }

  return null;
};
