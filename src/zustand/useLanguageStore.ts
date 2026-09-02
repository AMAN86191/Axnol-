import { create } from 'zustand';
import { zustandStorage } from '../utils/asyncstorage';
import i18n from '../i18n';

interface LanguageState {
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  loadLanguage: () => Promise<void>;
}

const LANGUAGE_KEY = 'app-language';

const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en',

  setLanguage: (lang: 'en' | 'hi') => {
    i18n.changeLanguage(lang);
    zustandStorage.setItem(LANGUAGE_KEY, lang);
    set({ language: lang });
  },

  loadLanguage: async () => {
    try {
      const stored = await zustandStorage.getItem(LANGUAGE_KEY);
      if (stored) {
        i18n.changeLanguage(stored);
        set({ language: stored });
      }
    } catch (error) {
      console.log('[LanguageStore] Error loading language:', error);
    }
  },
}));

export default useLanguageStore;
