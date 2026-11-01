/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function GuardianApprovalModal({ isOpen, onClose, onApprove }: { isOpen: boolean; onClose: () => void; onApprove: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 text-white">
      <div className="bg-[#07160e] border border-yellow-500/50 rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-yellow-400 mb-2">Guardian Approval Required</h3>
        <p className="text-xs text-gray-300 mb-4">Level 2 governance requires explicit owner approval.</p>
        <div className="flex gap-2">
          <button onClick={onApprove} className="flex-1 py-2 bg-yellow-500 text-black font-bold rounded-xl cursor-pointer">Approve</button>
          <button onClick={onClose} className="flex-1 py-2 bg-black/40 text-gray-300 rounded-xl cursor-pointer">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export { GuardianApprovalModal };
