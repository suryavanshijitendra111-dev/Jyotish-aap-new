/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function TechnicalAlertModal({ isOpen, onClose, error }: { isOpen: boolean; onClose: () => void; error?: any }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 text-white">
      <div className="bg-[#07160e] border border-red-500/50 rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-red-400 mb-2">Technical Alert</h3>
        <p className="text-xs text-gray-300 mb-4">System caught an unhandled exception or warning.</p>
        <button onClick={onClose} className="w-full py-2 bg-red-600 text-white font-bold rounded-xl cursor-pointer">Close</button>
      </div>
    </div>
  );
}

export { TechnicalAlertModal };
