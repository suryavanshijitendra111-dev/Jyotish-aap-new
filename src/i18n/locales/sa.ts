import { TranslationDictionary } from '../types';
import { hi } from './hi';

export const sa: TranslationDictionary = {
  ...hi,
  common: {
    ...hi.common,
    appName: 'जीवनदर्पणम्',
    appTagline: 'वैदिकज्योतिषम् आध्यात्मिकजीवनमार्गदर्शनं च',
    loading: 'आरोहति...',
    save: 'संरक्षतु',
    close: 'पिदधातु'
  }
};
