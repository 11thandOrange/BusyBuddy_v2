import React from 'react';
export function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">BusyBuddy</h1>
      <p className="text-xl text-gray-400 mb-6">
        Shopify app for bundle discounts, BOGO deals, announcement bars, volume discounts, and referrals.
      </p>
      <nav className="flex gap-4">
        <a href="/getting-started" className="text-blue-400 underline">Quick Start</a>
        <a href="/api" className="text-blue-400 underline">API Reference</a>
        <a href="/changelog" className="text-blue-400 underline">Changelog</a>
      </nav>
    </main>
  );
}
