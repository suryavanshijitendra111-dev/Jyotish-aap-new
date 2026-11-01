/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const ChamberDetailModal: React.FC<any> = ({ isOpen, onClose, chamber }) => {
  if (!isOpen || !chamber) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 text-white">
      <div className="bg-[#07160e] border border-yellow-500/50 rounded-2xl p-6 max-w-lg w-full">
        <h3 className="text-lg font-bold text-yellow-400 mb-2">{chamber.hindiTitle || chamber.englishTitle}</h3>
        <p className="text-xs text-gray-300 mb-4">{chamber.signification}</p>
        <button onClick={onClose} className="w-full py-2 bg-yellow-500 text-black font-bold rounded-xl">Close</button>
      </div>
    </div>
  );
};
