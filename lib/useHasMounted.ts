"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True only once hydrated on the client — false during SSR and the first
 * client render, so components can defer client-only behavior (e.g. an
 * enter animation that needs the DOM to end up differing from what SSR
 * produced) without a `setState` call inside a `useEffect`, which
 * react-hooks flags as a cascading-render risk. Same
 * getServerSnapshot/getSnapshot split as useMediaQuery. */
export function useHasMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
