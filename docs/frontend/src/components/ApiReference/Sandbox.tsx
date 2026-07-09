import { useState } from 'react';
import { AlertTriangle, Play } from 'lucide-react';
import type { EndpointDoc } from '../../types';
import { CodeBlock } from '../ui/CodeBlock';
import { cn } from '../../lib/cn';

interface SandboxProps {
  endpoint: EndpointDoc;
}

type Result = { status: number; body: string } | { error: string };
type CodeLang = 'curl' | 'fetch';

export function Sandbox({ endpoint }: SandboxProps) {
  const [shop, setShop] = useState('');
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [codeLang, setCodeLang] = useState<CodeLang>('curl');

  const queryParams = endpoint.params.filter((p) => p.in === 'query');
  const bodyParams = endpoint.params.filter((p) => p.in === 'body' && p.type !== 'file');

  const buildUrl = (placeholder = false) => {
    const host = shop || (placeholder ? 'your-store.myshopify.com' : '');
    if (!host) return '';
    const base = `https://${host}${endpoint.path}`;
    if (endpoint.method !== 'GET' || queryParams.length === 0) return base;
    const qs = queryParams
      .filter((p) => paramValues[p.name] || placeholder)
      .map((p) => `${p.name}=${encodeURIComponent(paramValues[p.name] || `{${p.name}}`)}`)
      .join('&');
    return qs ? `${base}?${qs}` : base;
  };

  const bodyJson = () => {
    const body: Record<string, string> = {};
    for (const p of bodyParams) body[p.name] = paramValues[p.name] || `{${p.name}}`;
    return JSON.stringify(body, null, 2);
  };

  const curlSnippet = () => {
    const url = buildUrl(true);
    if (endpoint.method === 'GET') return `curl "${url}"`;
    return `curl -X ${endpoint.method} "${url}" \\\n  -H "Content-Type: application/json" \\\n  -d '${bodyJson().replace(/\n\s*/g, ' ')}'`;
  };

  const fetchSnippet = () => {
    const url = buildUrl(true);
    if (endpoint.method === 'GET') return `fetch("${url}")\n  .then((res) => res.json())\n  .then(console.log);`;
    return `fetch("${url}", {\n  method: "${endpoint.method}",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(${bodyJson()}),\n})\n  .then((res) => res.json())\n  .then(console.log);`;
  };

  const send = async () => {
    if (!shop) return;
    setLoading(true);
    setResult(null);
    const url = buildUrl();
    try {
      const init: RequestInit = { method: endpoint.method };
      if (endpoint.method !== 'GET') {
        const body: Record<string, string> = {};
        for (const p of bodyParams) if (paramValues[p.name]) body[p.name] = paramValues[p.name];
        init.headers = { 'Content-Type': 'application/json' };
        init.body = JSON.stringify(body);
      }
      const res = await fetch(url, init);
      const text = await res.text();
      setResult({ status: res.status, body: text });
    } catch (err) {
      setResult({
        error:
          err instanceof TypeError
            ? 'Request blocked - most likely CORS, since this request goes from the docs site\'s origin to your store\'s domain and the backend does not currently send Access-Control-Allow-Origin for this origin. Try the endpoint directly from your store\'s storefront console instead, or open the Network tab for details.'
            : String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2 rounded-input border border-status-warning/30 bg-status-warning/5 p-3 text-xs text-content-secondary">
        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-status-warning" />
        <span>
          This calls your real store through the Shopify App Proxy. Use a development/test store, not a live production shop.
        </span>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-content-secondary">Store domain</label>
        <input
          value={shop}
          onChange={(e) => setShop(e.target.value.trim())}
          placeholder="your-store.myshopify.com"
          className="w-full rounded-input border border-surface-border bg-background px-3 py-2 text-sm text-white placeholder:text-content-muted focus:border-brand focus:outline-none"
        />
      </div>

      {[...queryParams, ...bodyParams].map((p) => (
        <div key={p.name}>
          <label className="mb-1 block text-xs font-medium text-content-secondary">
            {p.name}
            {p.required && <span className="text-status-error"> *</span>}
          </label>
          <input
            value={paramValues[p.name] ?? ''}
            onChange={(e) => setParamValues((prev) => ({ ...prev, [p.name]: e.target.value }))}
            placeholder={p.description}
            className="w-full rounded-input border border-surface-border bg-background px-3 py-2 text-sm text-white placeholder:text-content-muted focus:border-brand focus:outline-none"
          />
        </div>
      ))}

      <button
        onClick={send}
        disabled={!shop || loading}
        className="flex w-full items-center justify-center gap-2 rounded-button bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-button transition-fast hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Play size={14} />
        {loading ? 'Sending...' : 'Try it'}
      </button>

      {result && (
        <div>
          {'error' in result ? (
            <div className="rounded-input border border-status-error/30 bg-status-error/5 p-3 text-xs text-status-error">
              {result.error}
            </div>
          ) : (
            <>
              <div className="mb-1.5 text-xs font-medium text-content-secondary">
                Response · <span className={result.status < 400 ? 'text-status-success' : 'text-status-error'}>{result.status}</span>
              </div>
              <CodeBlock code={result.body} language="json" />
            </>
          )}
        </div>
      )}

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-content-muted">Code examples</div>
        <div className="mb-2 flex gap-1.5">
          {(['curl', 'fetch'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setCodeLang(lang)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-fast',
                codeLang === lang ? 'bg-surface-active text-white' : 'text-content-muted hover:text-content-secondary'
              )}
            >
              {lang === 'curl' ? 'cURL' : 'fetch'}
            </button>
          ))}
        </div>
        <CodeBlock code={codeLang === 'curl' ? curlSnippet() : fetchSnippet()} language={codeLang === 'curl' ? 'bash' : 'javascript'} />
      </div>
    </div>
  );
}
