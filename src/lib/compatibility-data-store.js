import { fetchAndParseJSON } from './data-loader.js';

const dataCache = new Map();
const promiseCache = new Map();

/**
 * Returns parsed compatibility data, cached by base path for client-side route reuse.
 * @param {string} basePath
 * @param {(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>} fetchImpl
 */
export function getCompatibilityData(basePath = '', fetchImpl = fetch) {
  const key = String(basePath || '');

  if (dataCache.has(key)) {
    return Promise.resolve(dataCache.get(key));
  }

  if (promiseCache.has(key)) {
    return promiseCache.get(key);
  }

  const promise = fetchAndParseJSON(
    `${key}/data/wacom-pen-compat.json`,
    `${key}/data/wacom-tablets.json`,
    `${key}/data/wacom-pens.json`,
    fetchImpl
  )
    .then((parsedData) => {
      const data = {
        ...parsedData,
        loadedAtIso: new Date().toISOString()
      };
      dataCache.set(key, data);
      promiseCache.delete(key);
      return data;
    })
    .catch((err) => {
      promiseCache.delete(key);
      throw err;
    });

  promiseCache.set(key, promise);
  return promise;
}

export function clearCompatibilityDataCache(basePath = '') {
  const key = String(basePath || '');
  dataCache.delete(key);
  promiseCache.delete(key);
}
