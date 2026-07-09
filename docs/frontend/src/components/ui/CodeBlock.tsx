import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative rounded-input border border-surface-border bg-background overflow-hidden">
      <div className="flex items-center justify-between border-b border-surface-border px-4 py-2">
        <span className="text-xs font-mono text-content-muted uppercase tracking-wide">{language}</span>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 text-xs text-content-secondary hover:text-content transition-fast"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono text-content-secondary">{code}</code>
      </pre>
    </div>
  );
}
