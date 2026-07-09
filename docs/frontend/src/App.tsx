import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Home } from './pages/Home';
import { GettingStarted } from './pages/GettingStarted';
import { Features } from './pages/Features';
import { AppList } from './pages/AppList';
import { ApiReference } from './pages/ApiReference';
import { CiCd } from './pages/CiCd';
import { Architecture } from './pages/Architecture';
import { StretchFeatures } from './pages/StretchFeatures';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// HashRouter, not BrowserRouter: this site is served from a GitHub Pages
// project path (/BusyBuddy_v2/), which has no server to rewrite deep-link
// requests back to index.html. Hash-based routes never hit the server on
// navigation, so they work with zero extra GH Pages configuration.
function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/getting-started" element={<GettingStarted />} />
        <Route path="/getting-started/:section" element={<GettingStarted />} />
        <Route path="/features" element={<Features />} />
        <Route path="/features/:feature" element={<Features />} />
        <Route path="/apps" element={<AppList />} />
        <Route path="/apps/:app" element={<AppList />} />
        <Route path="/api" element={<ApiReference />} />
        <Route path="/api/:group" element={<ApiReference />} />
        <Route path="/ci-cd" element={<CiCd />} />
        <Route path="/ci-cd/:workflow" element={<CiCd />} />
        <Route path="/architecture" element={<Architecture />} />
        <Route path="/stretch-features" element={<StretchFeatures />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
