/**
 * Custom Hook: useLocalStorage
 * 
 * This hook works just like useState, but it ALSO saves the value
 * to the browser's localStorage. This means the value persists even
 * after the user refreshes the page or closes and reopens the browser.
 * 
 * HOW TO USE:
 *   const [name, setName] = useLocalStorage('myKey', 'defaultValue');
 *   // 'name' will be read from localStorage if it exists,
 *   // otherwise it starts as 'defaultValue'.
 *   // Calling setName('new value') updates both the state AND localStorage.
 */
import { useState } from 'react';

export function useLocalStorage(storageKey, defaultValue) {
  // Try to read the existing value from localStorage when the hook first runs.
  // If nothing is stored yet, use the defaultValue provided.
  const [storedValue, setStoredValue] = useState(function () {
    // We wrap this in a try/catch because localStorage can sometimes
    // throw errors (e.g. in private/incognito mode on some browsers).
    try {
      // Read the item from localStorage using the key we were given
      const itemFromStorage = window.localStorage.getItem(storageKey);

      // If the item exists in storage, parse it from JSON string back to JS value
      // If it doesn't exist, return the default value
      if (itemFromStorage !== null) {
        return JSON.parse(itemFromStorage);
      } else {
        return defaultValue;
      }
    } catch (error) {
      // If there was an error reading from localStorage, just use the default
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  });

  // This function updates the state AND saves the new value to localStorage.
  // Components will call this instead of a normal setState function.
  function saveValue(newValue) {
    try {
      // Save the new value to React state so the component re-renders
      setStoredValue(newValue);

      // Also save the new value to localStorage so it persists across page refreshes.
      // JSON.stringify converts JS objects/arrays to a string for storage.
      if (newValue === null || newValue === undefined) {
        // If we're clearing the value, remove it from localStorage entirely
        window.localStorage.removeItem(storageKey);
      } else {
        window.localStorage.setItem(storageKey, JSON.stringify(newValue));
      }
    } catch (error) {
      // If there was an error writing to localStorage, log it but don't crash
      console.error('Error writing to localStorage:', error);
    }
  }

  // Return the current value and the save function, just like useState does
  return [storedValue, saveValue];
}
