export type GlobalLoadingListener = (active: boolean, count: number) => void;

let listeners: GlobalLoadingListener[] = [];
let activeCount = 0;

function notify() {
  const active = activeCount > 0;
  for (const l of listeners) {
    try { l(active, activeCount); } catch { /* ignore */ }
  }
}

export function pushGlobalLoading() {
  activeCount += 1;
  notify();
}

export function popGlobalLoading() {
  activeCount = Math.max(0, activeCount - 1);
  notify();
}

export function subscribeGlobalLoading(listener: GlobalLoadingListener) {
  listeners.push(listener);
  try { listener(activeCount > 0, activeCount); } catch { /* ignore */ }
  return () => { listeners = listeners.filter(l => l !== listener); };
}

export function getActiveGlobalLoadingCount() { return activeCount; }
