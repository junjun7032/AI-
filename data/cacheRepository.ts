
import { AlgorithmExplanation } from '../types';

const KEY_PREFIX = 'algo_cache_v1_';

export const getStoredAlgorithm = (term: string): AlgorithmExplanation | null => {
  try {
    const key = KEY_PREFIX + term.trim().toLowerCase();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading from cache:", error);
    return null;
  }
};

export const storeAlgorithm = (term: string, data: AlgorithmExplanation) => {
  try {
    const key = KEY_PREFIX + term.trim().toLowerCase();
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
     console.error("Error saving to cache:", error);
  }
};
