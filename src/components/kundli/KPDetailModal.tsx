/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const KPDetailModal: React.FC<any> = ({ isOpen, onClose, planet }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 text-white">
      <div className="bg-[#07160e] border border-yellow-500/50 rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-yellow-400 mb-2">KP Detail: {planet?.name || 'Planet'}</h3>
        <button onClick={onClose} className="w-full py-2 bg-yellow-500 text-black font-bold rounded-xl mt-4">Close</button>
      </div>
    </div>
  );
};
