import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { GettingStarted } from './pages/GettingStarted';
import { Features } from './pages/Features';
import { ApiOverview } from './pages/Api/ApiOverview';
import { BundlesApi } from './pages/Api/BundlesApi';
import { BogoApi } from './pages/Api/BogoApi';
import { AnnouncementBarsApi } from './pages/Api/AnnouncementBarsApi';
import { VolumeDiscountsApi } from './pages/Api/VolumeDiscountsApi';
import { AnalyticsApi } from './pages/Api/AnalyticsApi';
import { ReferralsApi } from './pages/Api/ReferralsApi';
import { Changelog } from './pages/Changelog';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/getting-started" element={<GettingStarted />} />
      <Route path="/features" element={<Features />} />
      <Route path="/api" element={<ApiOverview />} />
      <Route path="/api/bundles" element={<BundlesApi />} />
      <Route path="/api/bogo" element={<BogoApi />} />
      <Route path="/api/announcement-bars" element={<AnnouncementBarsApi />} />
      <Route path="/api/volume-discounts" element={<VolumeDiscountsApi />} />
      <Route path="/api/analytics" element={<AnalyticsApi />} />
      <Route path="/api/referrals" element={<ReferralsApi />} />
      <Route path="/changelog" element={<Changelog />} />
    </Routes>
  );
}
