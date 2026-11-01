import { TranslationDictionary } from '../types';
import { hi } from './hi';

export const pa: TranslationDictionary = {
  ...hi,
  common: {
    ...hi.common,
    appName: 'ਜੀਵਨ ਦਰਪਣ',
    appTagline: 'ਵੈਦਿਕ ਜੀਵਨ ਸਾਥੀ ਅਤੇ ਆਤਮ-ਚਿੰਤਨ',
    loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    save: 'ਸੰਭਾਲੋ',
    close: 'ਬੰਦ ਕਰੋ'
  }
};
