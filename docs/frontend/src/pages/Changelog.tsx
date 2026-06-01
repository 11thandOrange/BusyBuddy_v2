import React from 'react';
export function Changelog() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Changelog</h1>
      <p className="text-gray-500 text-sm mb-8">Maintained by changelog-agent on each release.</p>
      {/* changelog-agent populates version sections here */}
    </main>
  );
}
