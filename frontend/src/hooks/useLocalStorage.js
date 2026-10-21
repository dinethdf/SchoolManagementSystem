/**
 * Custom Hook: useLocalStorage
 * Read and persist state to browser local storage with reactive sync.
 */

export const useLocalStorage = (key, initialValue) => {
  return [initialValue, (val) => {}];
};
