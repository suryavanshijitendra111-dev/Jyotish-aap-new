/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const KundliIntro: React.FC<{ onStart?: () => void }> = ({ onStart }) => (
  <div className="space-y-6 p-6 text-white">
    <h2 className="text-2xl font-serif text-yellow-500">कुंडली एवं ज्योतिष परिचय (Kundli Intro)</h2>
    <p className="text-sm text-gray-300">Complete Vedic horoscope analysis with Parashari and KP calculations.</p>
    {onStart && (
      <button onClick={onStart} className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-xl">
        कुंडली देखें (View Kundli)
      </button>
    )}
  </div>
);

export const KundliShell: React.FC<{ profile?: any; children?: React.ReactNode }> = ({ profile, children }) => (
  <div className="space-y-6 p-6 text-white">
    <div className="p-4 bg-black/40 border border-yellow-500/30 rounded-2xl">
      <h3 className="text-lg font-bold text-yellow-500">जन्म कुंडली संकुल (Kundli Shell)</h3>
      <p className="text-xs text-gray-400 mt-1">Active Profile: {profile?.name || 'Master Profile'}</p>
    </div>
    {children}
  </div>
);
