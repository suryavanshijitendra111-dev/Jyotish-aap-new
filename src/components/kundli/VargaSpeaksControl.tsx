/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Volume2, Square, Sparkles } from 'lucide-react';
import { SpeechEngine } from '../../services/companion/speechEngine';
import { useTranslation, LanguageCode } from '../../i18n';

interface VargaSpeaksControlProps {
  masterData?: any;
  spokenText?: string;
  title?: string;
  autoPlay?: boolean;
  language?: string;
  profile?: 'planet' | 'bhava' | 'default';
}

export const VargaSpeaksControl: React.FC<VargaSpeaksControlProps> = ({
  masterData,
  spokenText: propSpokenText,
  title,
  autoPlay = false,
  language: propLanguage,
  profile = 'bhava'
}) => {
  const { language: i18nLang } = useTranslation();
  const currentLang = (propLanguage || i18nLang || 'hi') as LanguageCode;
  const isHindi = currentLang === 'hi' || (currentLang as string) === 'Hindi' || currentLang === 'sa';

  const [isPlaying, setIsPlaying] = useState(false);

  const defaultText = isHindi
    ? 'नवांश कुंडली आत्मा के आंतरिक बल, विवाह एवं धर्म का सूक्ष्म दर्पण है। ग्रहों का नवांश में उच्च या स्वक्षेत्री होना उनके वास्तविक बल को प्रकट करता है।'
    : 'The Navamsha D9 divisional chart reflects the inner strength of the soul, marriage, and dharma. A planet exalted or in its own sign in Navamsha gains immense auspicious potential.';

  const textToSpeak = propSpokenText || defaultText;

  const handleToggle = useCallback(() => {
    if (isPlaying) {
      SpeechEngine.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    SpeechEngine.speak(textToSpeak, currentLang, {
      profile,
      onStateChange: state => {
        if (state === 'stopped') {
          setIsPlaying(false);
        }
      }
    });
  }, [isPlaying, textToSpeak, currentLang, profile]);

  useEffect(() => {
    if (autoPlay && textToSpeak) {
      handleToggle();
    }
    return () => {
      SpeechEngine.stop();
    };
  }, []);

  return (
    <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-[#041910] via-[#062417] to-[#041910] border border-[#d4af37]/40 rounded-xl text-white shadow-md">
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0" />
        <div className="min-w-0">
          <h4 className="font-bold text-[#d4af37] text-xs truncate">
            {title || (isHindi ? 'वर्ग वाणी (Varga Speaks Audio)' : 'Varga Speaks Audio')}
          </h4>
          <p className="text-[10px] text-gray-300 truncate">
            {isHindi ? 'प्रामाणिक वैदिक वाणी सुनें' : 'Listen to verified spoken guidance'}
          </p>
        </div>
      </div>

      <button
        onClick={handleToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm ${
          isPlaying
            ? 'bg-amber-500 text-black animate-pulse'
            : 'bg-[#d4af37] text-black hover:bg-[#ffe89e]'
        }`}
        title={isPlaying ? 'Stop' : 'Listen'}
      >
        {isPlaying ? <Square className="w-3 h-3 fill-black" /> : <Volume2 className="w-3 h-3" />}
        <span>{isPlaying ? (isHindi ? 'विराम' : 'Stop') : (isHindi ? 'वाणी सुनें' : 'Listen')}</span>
      </button>
    </div>
  );
};
