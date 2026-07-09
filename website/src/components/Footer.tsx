import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-surface-border">
      <div className="mx-auto flex max-w-container-lg flex-col items-center gap-4 px-6 py-10 text-sm text-content-muted sm:flex-row sm:justify-between">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-brand">Busy</span>
          <span className="text-content">Buddy</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/about" className="hover:text-content-secondary transition-fast">About</Link>
          <Link to="/contact" className="hover:text-content-secondary transition-fast">Contact</Link>
          <a
            href="https://github.com/11thandOrange/BusyBuddy_v2"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-content-secondary transition-fast"
          >
            GitHub
          </a>
        </div>
        <div>&copy; {new Date().getFullYear()} BusyBuddy</div>
      </div>
    </footer>
  );
}
