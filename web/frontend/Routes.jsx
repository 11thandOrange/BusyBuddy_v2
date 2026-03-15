import { Routes as ReactRouterRoutes, Route, useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import AnnouncementBarEditor from "./apps/announcement-bar/AnnouncementBarEditor";
import { StandardBundleEditor } from "./apps/bundle-discounts/StandardBundleEditor";
import { BuyXGetYEditor } from "./apps/buy-one-get-one/BuyXGetYEditor";
import { VolumeDiscountEditor } from "./apps/volume-discounts/VolumeDiscountEditor";
import { MixAndMatchEditor } from "./apps/mix-and-match-discounts/MixAndMatchEditor";

// Wrapper component for Bundle Discount Editor
const BundleEditorWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [editingBundle, setEditingBundle] = useState(null);
  const [isLoading, setIsLoading] = useState(!!id);

  const getQueryString = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const host = params.get('host');
    return host ? `?host=${encodeURIComponent(host)}` : '';
  }, [location.search]);

  useEffect(() => {
    if (id) {
      fetch(`/api/bundles/${id}`)
        .then(res => res.json())
        .then(data => {
          setEditingBundle(data.data || data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch bundle:', err);
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleSuccess = () => {
    window.close();
    window.location.href = '/bundle-discount' + getQueryString();
  };

  if (isLoading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <StandardBundleEditor
      editingBundle={editingBundle}
      onSuccess={handleSuccess}
    />
  );
};

// Wrapper component for Buy X Get Y Editor
const BuyXGetYEditorWrapper = () => {
  const { id } = useParams();
  const location = useLocation();
  const [editingBundle, setEditingBundle] = useState(null);
  const [isLoading, setIsLoading] = useState(!!id);

  const getQueryString = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const host = params.get('host');
    return host ? `?host=${encodeURIComponent(host)}` : '';
  }, [location.search]);

  useEffect(() => {
    if (id) {
      fetch(`/api/bundles/${id}`)
        .then(res => res.json())
        .then(data => {
          setEditingBundle(data.data || data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch bundle:', err);
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleSuccess = () => {
    window.close();
    window.location.href = '/buy-one-get-one' + getQueryString();
  };

  if (isLoading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <BuyXGetYEditor
      editingBundle={editingBundle}
      onSuccess={handleSuccess}
    />
  );
};

// Wrapper component for Volume Discount Editor
const VolumeEditorWrapper = () => {
  const { id } = useParams();
  const location = useLocation();
  const [editingBundle, setEditingBundle] = useState(null);
  const [isLoading, setIsLoading] = useState(!!id);

  const getQueryString = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const host = params.get('host');
    return host ? `?host=${encodeURIComponent(host)}` : '';
  }, [location.search]);

  useEffect(() => {
    if (id) {
      fetch(`/api/bundles/${id}`)
        .then(res => res.json())
        .then(data => {
          setEditingBundle(data.data || data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch bundle:', err);
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleSuccess = () => {
    window.close();
    window.location.href = '/volume-discount' + getQueryString();
  };

  if (isLoading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <VolumeDiscountEditor
      editingBundle={editingBundle}
      onSuccess={handleSuccess}
    />
  );
};

// Wrapper component for Mix and Match Editor
const MixMatchEditorWrapper = () => {
  const { id } = useParams();
  const location = useLocation();
  const [editingBundle, setEditingBundle] = useState(null);
  const [isLoading, setIsLoading] = useState(!!id);

  const getQueryString = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const host = params.get('host');
    return host ? `?host=${encodeURIComponent(host)}` : '';
  }, [location.search]);

  useEffect(() => {
    if (id) {
      fetch(`/api/bundles/${id}`)
        .then(res => res.json())
        .then(data => {
          setEditingBundle(data.data || data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch bundle:', err);
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleSuccess = () => {
    window.close();
    window.location.href = '/mix-and-match' + getQueryString();
  };

  if (isLoading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <MixAndMatchEditor
      editingBundle={editingBundle}
      onSuccess={handleSuccess}
    />
  );
};

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
      <Route path="/bundle-discount/editor" element={<BundleEditorWrapper />} />
      <Route path="/bundle-discount/editor/:id" element={<BundleEditorWrapper />} />
      <Route path="/buy-one-get-one/editor" element={<BuyXGetYEditorWrapper />} />
      <Route path="/buy-one-get-one/editor/:id" element={<BuyXGetYEditorWrapper />} />
      <Route path="/volume-discounts/editor" element={<VolumeEditorWrapper />} />
      <Route path="/volume-discounts/editor/:id" element={<VolumeEditorWrapper />} />
      <Route path="/mix-and-match/editor" element={<MixMatchEditorWrapper />} />
      <Route path="/mix-and-match/editor/:id" element={<MixMatchEditorWrapper />} />
      
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
