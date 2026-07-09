import { useState } from 'react';
import { Play, AlertTriangle } from 'lucide-react';
import type { EndpointDoc } from '../../types';
import { CodeBlock } from '../ui/CodeBlock';

interface SandboxProps {
  endpoint: EndpointDoc;
}

type Result = { status: number; body: string } | { error: string };

export function Sandbox({ endpoint }: SandboxProps) {
  const [shop, setShop] = useState('');
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const queryParams = endpoint.params.filter((p) => p.in === 'query');
  const bodyParams = endpoint.params.filter((p) => p.in === 'body' && p.type !== 'file');

  const buildUrl = () => {
    if (!shop) return '';
    const base = `https://${shop}${endpoint.path}`;
    if (endpoint.method !== 'GET' || queryParams.length === 0) return base;
    const qs = queryParams
      .filter((p) => paramValues[p.name])
      .map((p) => `${p.name}=${encodeURIComponent(paramValues[p.name])}`)
      .join('&');
    return qs ? `${base}?${qs}` : base;
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Play size={15} className="text-brand" />
        Try it
      </div>

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
        className="w-full rounded-button bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-button transition-fast hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : `Send ${endpoint.method} request`}
      </button>

      {shop && (
        <div className="text-xs text-content-muted break-all font-mono">{buildUrl()}</div>
      )}

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
    </div>
  );
}
