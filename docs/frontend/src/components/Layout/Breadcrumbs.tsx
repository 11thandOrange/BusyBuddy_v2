import { Link } from 'react-router-dom';

export interface Crumb {
  title: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-content-muted">
      <Link to="/" className="hover:text-content-secondary transition-fast">
        Docs
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span>/</span>
          {item.href ? (
            <Link to={item.href} className="hover:text-content-secondary transition-fast">
              {item.title}
            </Link>
          ) : (
            <span className="text-content-secondary">{item.title}</span>
          )}
        </span>
      ))}
    </div>
  );
}
