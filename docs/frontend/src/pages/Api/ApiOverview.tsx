import React from 'react';
export function ApiOverview() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">API Reference</h1>
      <p className="text-gray-400 mb-6">
        BusyBuddy exposes a REST API consumed by the embedded Shopify admin app.
        All endpoints require an active Shopify session. Base URL: <code>/api</code>.
      </p>
      {/* docs-writer expands this */}
    </main>
  );
}
