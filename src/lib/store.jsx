import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { reducer, hydrate } from './progress.js';
import { loadState, saveState, isStorageAvailable } from './storage.js';
import { audio } from './audio.js';

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => hydrate(loadState()));
  const saveTimer = useRef(null);
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveState(state), 250);
    return () => clearTimeout(saveTimer.current);
  }, [state]);
  // flush on tab close / app switch so a refresh never loses progress
  useEffect(() => {
    const flush = () => saveState(stateRef.current);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', flush);
    return () => { window.removeEventListener('pagehide', flush); document.removeEventListener('visibilitychange', flush); };
  }, []);
  const stateRef = useRef(state); stateRef.current = state;
  useEffect(() => { audio.configure(state.settings); }, [state.settings]);
  return <Ctx.Provider value={{ state, dispatch, storageOk: isStorageAvailable() }}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);

export function useAudioState() {
  const [s, set] = useState(audio.state);
  useEffect(() => audio.subscribe(set), []);
  return s;
}

export function useReducedMotion() {
  const { state } = useStore();
  const [sys, setSys] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const m = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!m) return;
    const h = () => setSys(m.matches);
    m.addEventListener?.('change', h);
    return () => m.removeEventListener?.('change', h);
  }, []);
  return sys || state.settings.reduceMotion;
}
