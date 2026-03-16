import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { store } from "./store";
import { initI18n, getPolarisTranslations } from "./utils/i18nUtils";
import "./App.css";
import "./assets/fonts/stylesheet.css";

// Import editor components
import { StandardBundleEditor } from "./apps/bundle-discounts/StandardBundleEditor";
import { BuyXGetYEditor } from "./apps/buy-one-get-one/BuyXGetYEditor";
import { VolumeDiscountEditor } from "./apps/volume-discounts/VolumeDiscountEditor";
import { MixAndMatchEditor } from "./apps/mix-and-match-discounts/MixAndMatchEditor";
import AnnouncementBarEditor from "./apps/announcement-bar/AnnouncementBarEditor";

const queryClient = new QueryClient();

function EditorApp() {
  const translations = getPolarisTranslations();
  
  return (
    <AppProvider i18n={translations}>
      <BrowserRouter>
        <Routes>
          <Route path="/announcement-bar/editor" element={<AnnouncementBarEditor />} />
          <Route path="/announcement-bar/editor/:id" element={<AnnouncementBarEditor />} />
          <Route path="/bundle-discount/editor" element={<StandardBundleEditor />} />
          <Route path="/bundle-discount/editor/:id" element={<StandardBundleEditor />} />
          <Route path="/buy-one-get-one/editor" element={<BuyXGetYEditor />} />
          <Route path="/buy-one-get-one/editor/:id" element={<BuyXGetYEditor />} />
          <Route path="/volume-discounts/editor" element={<VolumeDiscountEditor />} />
          <Route path="/volume-discounts/editor/:id" element={<VolumeDiscountEditor />} />
          <Route path="/mix-and-match/editor" element={<MixAndMatchEditor />} />
          <Route path="/mix-and-match/editor/:id" element={<MixAndMatchEditor />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

// Initialize i18n then render
initI18n().then(() => {
  const root = createRoot(document.getElementById("app"));
  root.render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <EditorApp />
      </QueryClientProvider>
    </Provider>
  );
});
