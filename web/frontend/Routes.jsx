import { Routes as ReactRouterRoutes, Route } from "react-router-dom";
import AnnouncementBarEditor from "./apps/announcement-bar/AnnouncementBarEditor";
import StandardBundleEditor from "./apps/bundle-discounts/StandardBundleEditor";
import BuyXGetYEditor from "./apps/buy-one-get-one/BuyXGetYEditor";
import VolumeDiscountEditor from "./apps/volume-discounts/VolumeDiscountEditor";
import MixAndMatchEditor from "./apps/mix-and-match-discounts/MixAndMatchEditor";

/**
 * File-based routing.
 * @desc File-based routing that uses React Router under the hood.
 * To create a new route create a new .jsx file in `/pages` with a default export.
 *
 * Some examples:
 * * `/pages/index.jsx` matches `/`
 * * `/pages/blog/[id].jsx` matches `/blog/123`
 * * `/pages/[...catchAll].jsx` matches any URL not explicitly matched
 *
 * @param {object} pages value of import.meta.glob(). See https://vitejs.dev/guide/features.html#glob-import
 *
 * @return {Routes} `<Routes/>` from React Router, with a `<Route/>` for each file in `pages`
 */
export default function Routes({ pages }) {
  const routes = useRoutes(pages);
  const routeComponents = routes.map(({ path, component: Component }) => (
    <Route key={path} path={path} element={<Component />} />
  ));

  const NotFound = routes.find(({ path }) => path === "/notFound").component;

  return (
    <ReactRouterRoutes>
      {routeComponents}
      
      {/* Editor Routes (open in new tab) */}
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
      
      <Route path="*" element={<NotFound />} />
    </ReactRouterRoutes>
  );
}

function useRoutes(pages) {
  const routes = Object.keys(pages)
    .map((key) => {
      let path = key
        .replace("./pages", "")
        .replace(/\.(t|j)sx?$/, "")
        /**
         * Replace /index with /
         */
        .replace(/\/index$/i, "/")
        /**
         * Only lowercase the first letter. This allows the developer to use camelCase
         * dynamic paths while ensuring their standard routes are normalized to lowercase.
         */
        .replace(/\b[A-Z]/, (firstLetter) => firstLetter.toLowerCase())
        /**
         * Convert /[handle].jsx and /[...handle].jsx to /:handle.jsx for react-router-dom
         */
        .replace(/\[(?:[.]{3})?(\w+?)\]/g, (_match, param) => `:${param}`);

      if (path.endsWith("/") && path !== "/") {
        path = path.substring(0, path.length - 1);
      }

      if (!pages[key].default) {
        console.warn(`${key} doesn't export a default React component`);
      }

      return {
        path,
        component: pages[key].default,
      };
    })
    .filter((route) => route.component);

  return routes;
}
