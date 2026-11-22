// Local-only persistence. Nothing leaves the device.
const KEY = 'marias-little-world.v1';
let memoryFallback = null;
let available = true;

export function storageAvailable() {
  try {
    const k = '__mlw_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function loadState() {
  available = storageAvailable();
  if (!available) return memoryFallback;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // corrupted data -> start fresh rather than crash
  }
}

export function saveState(state) {
  memoryFallback = state;
  if (!available) return false;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    // Most likely quota exceeded (e.g. very large photo). Retry without the photo.
    try {
      const slim = { ...state, avatar: { ...state.avatar, photo: null, usePhoto: false } };
      window.localStorage.setItem(KEY, JSON.stringify(slim));
    } catch { /* give up silently; state stays in memory */ }
    return false;
  }
}

export function clearState() {
  memoryFallback = null;
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export const isStorageAvailable = () => available;
