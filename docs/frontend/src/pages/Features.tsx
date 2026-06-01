import React from 'react';
const features = [
  { title: 'Bundle Discounts', desc: 'Create quantity-based bundle discount rules.' },
  { title: 'BOGO Deals', desc: 'Configure Buy One Get One free or discounted promotions.' },
  { title: 'Announcement Bars', desc: 'Display custom banners across your storefront.' },
  { title: 'Volume Discounts', desc: 'Set tiered pricing for bulk purchases.' },
  { title: 'Analytics', desc: 'Track discount performance and revenue impact.' },
  { title: 'Referrals', desc: 'Incentivise customers to refer friends.' },
];
export function Features() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Features</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map(f => (
          <div key={f.title} className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2">{f.title}</h2>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
