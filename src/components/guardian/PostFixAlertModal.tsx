/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function PostFixAlertModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 text-white">
      <div className="bg-[#07160e] border border-emerald-500/50 rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-emerald-400 mb-2">Post-Fix Alert</h3>
        <p className="text-xs text-gray-300 mb-4">Auto-Recovery completed successfully.</p>
        <button onClick={onClose} className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer">Dismiss</button>
      </div>
    </div>
  );
}

export { PostFixAlertModal };
