import { useCallback, useRef, useState } from "react";

// Editor Save flows used to call `shopify?.toast?.show(...)` with `shopify`
// hardcoded to undefined (App Bridge isn't available in the standalone
// editor tab), which made every validation/success/error message a silent
// no-op - the merchant would click Save and see nothing happen. This is a
// real, visible replacement with the same call shape (message, { duration }).
export function useSimpleToast() {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const showToast = useCallback((message, { duration = 4000, tone = "error" } = {}) => {
    clearTimeout(timeoutRef.current);
    setToast({ message, tone, id: Date.now() });
    timeoutRef.current = setTimeout(() => setToast(null), duration);
  }, []);

  return [toast, showToast];
}
