/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

export default function SwamiSecretPinModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [pin, setPin] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-[#07160e] border border-yellow-500/50 rounded-2xl p-6 max-w-md w-full text-white">
        <h3 className="text-lg font-bold text-yellow-500 mb-2">स्वामी गुप्त पिन (Swami Secret PIN)</h3>
        <p className="text-xs text-gray-300 mb-4">Enter Owner Secret PIN to authorize critical governance actions.</p>
        <input 
          type="password" 
          placeholder="Enter PIN" 
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full bg-black/50 border border-yellow-500/30 rounded-xl px-3 py-2 text-white mb-4"
        />
        <button onClick={onSuccess} className="w-full py-2 bg-yellow-500 text-black font-bold rounded-xl mb-2 cursor-pointer">Authorize (सत्यापित करें)</button>
        <button onClick={onClose} className="w-full py-2 bg-black/40 text-gray-400 rounded-xl cursor-pointer">Cancel</button>
      </div>
    </div>
  );
}
