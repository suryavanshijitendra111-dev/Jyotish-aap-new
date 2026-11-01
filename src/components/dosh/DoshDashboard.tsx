/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function DoshDashboard({ profile }: { profile?: any }) {
  return (
    <div className="space-y-6 p-6 text-white">
      <h2 className="text-2xl font-serif text-yellow-500">दोष विचार (Dosh & Remedy Dashboard)</h2>
      <p className="text-sm text-gray-300">Deterministic evaluation of Mangal Dosha, Kala Sarpa, Pitrishapa, Guru Chandal, Grahan, Kemadruma and Shani Sade Sati.</p>
    </div>
  );
}
