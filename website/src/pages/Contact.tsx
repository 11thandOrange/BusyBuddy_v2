import { useState } from 'react';
import { Github, Send } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  // No support inbox or backend endpoint exists yet for this form - wire
  // this up to a real address/API before launch. Submission is stubbed
  // client-side in the meantime so the page isn't a dead end.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-content">
      <Header />
      <main className="mx-auto max-w-container px-6 pb-20 pt-32">
        <div className="text-xs font-semibold uppercase tracking-wider text-brand">Contact</div>
        <h1 className="mt-2 text-heading-lg font-bold text-content">Get in touch</h1>
        <p className="mt-4 max-w-xl prose-body">
          Questions about a plan, a bug report, or a feature request - send a note and we'll get
          back to you.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
            <div>
              <label className="mb-1 block text-xs font-medium text-content-secondary">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-input border border-surface-border bg-background px-3 py-2.5 text-sm text-content placeholder:text-content-muted focus:border-brand focus:outline-none"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-content-secondary">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-input border border-surface-border bg-background px-3 py-2.5 text-sm text-content placeholder:text-content-muted focus:border-brand focus:outline-none"
                placeholder="you@yourstore.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-content-secondary">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="w-full resize-none rounded-input border border-surface-border bg-background px-3 py-2.5 text-sm text-content placeholder:text-content-muted focus:border-brand focus:outline-none"
                placeholder="How can we help?"
              />
            </div>
            <button
              type="submit"
              disabled={submitted}
              className="inline-flex items-center gap-2 rounded-button bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-button transition-fast hover:bg-brand-hover disabled:opacity-50"
            >
              <Send size={14} />
              {submitted ? 'Sent' : 'Send message'}
            </button>
            {submitted && (
              <p className="text-sm text-content-secondary">Thanks - we'll follow up shortly.</p>
            )}
          </form>

          <div className="rounded-card border border-surface-border bg-surface p-6">
            <div className="text-heading-sm font-bold text-content">Report a bug</div>
            <p className="mt-2 text-sm text-content-secondary">
              For technical issues, opening a GitHub issue is usually the fastest way to reach the
              team directly.
            </p>
            <a
              href="https://github.com/11thandOrange/BusyBuddy_v2/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-button border border-surface-border bg-surface px-4 py-2 text-sm text-content-secondary transition-fast hover:border-surface-border-hover hover:text-content"
            >
              <Github size={15} />
              Open an issue
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
