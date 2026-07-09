import { AlertTriangle } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Breadcrumbs } from '../components/Layout/Breadcrumbs';

export function StretchFeatures() {
  return (
    <Layout>
      <Breadcrumbs items={[{ title: 'Stretch Features' }]} />
      <h1 className="mt-4 text-heading-lg font-bold text-white">Stretch Features</h1>

      <div className="mt-4 flex items-start gap-2 rounded-input border border-status-warning/30 bg-status-warning/5 p-4 text-sm text-content-secondary">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-status-warning" />
        <span>
          Everything on this page is speculative/future-looking. None of it is implemented in
          the current codebase - it's documented here as a concept, not a shipped capability.
        </span>
      </div>

      <h2 className="mt-8 text-heading-sm font-semibold text-white">Custom App Creation</h2>
      <p className="mt-2 prose-body">
        The concept: let a merchant (or BusyBuddy internally) compose a new storefront
        widget/app from existing primitives - the same product-picker, scheduling, and
        appearance-editor building blocks already shared across the six current apps - without
        writing a new editor, controller, and theme-extension script from scratch each time.
      </p>
      <p className="mt-4 prose-body">
        This would require generalizing the current per-app pattern (editor component +
        Mongo model + REST controller + theme-extension script, largely duplicated six times
        today) into a configuration-driven system: a schema describing a widget's fields and
        appearance options, a single generic editor that renders from that schema, and a single
        generic storefront-rendering script that reads the same schema. Not attempted in this
        pass - the current six apps intentionally stay as independent, purpose-built
        implementations.
      </p>
    </Layout>
  );
}
