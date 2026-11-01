/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BackupManifest } from '../../types/backup';

export const BackupHistory: React.FC<{
  backups: BackupManifest[];
  onRestore: (manifest: BackupManifest) => void;
  onExportJson: (manifest: BackupManifest) => void;
  onGeneratePdf: (manifest: BackupManifest) => void;
  onDelete: (id: string) => void;
}> = ({ backups, onRestore, onExportJson, onGeneratePdf, onDelete }) => {
  return (
    <div className="space-y-4 text-white">
      <h3 className="text-lg font-bold text-yellow-500">Backup History</h3>
      {backups.length === 0 ? (
        <p className="text-xs text-gray-400">No backups stored yet.</p>
      ) : (
        <div className="space-y-2">
          {backups.map(b => (
            <div key={b.id} className="p-4 bg-black/40 border border-yellow-500/20 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-yellow-400">{b.label}</div>
                <div className="text-[10px] text-gray-400">{new Date(b.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onRestore(b)} className="px-3 py-1 bg-emerald-600 text-xs font-bold rounded">Restore</button>
                <button onClick={() => onExportJson(b)} className="px-3 py-1 bg-blue-600 text-xs font-bold rounded">JSON</button>
                <button onClick={() => onDelete(b.id)} className="px-3 py-1 bg-red-600 text-xs font-bold rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
