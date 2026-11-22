import React, { useEffect, useRef, useState } from 'react';
import { StoreProvider, useStore, useReducedMotion } from './lib/store.jsx';
import { BACKGROUNDS } from './data/rewards.js';
import { Caption } from './components/ui.jsx';
import { audio } from './lib/audio.js';
import Welcome from './screens/Welcome.jsx';
import Home from './screens/Home.jsx';
import Journey from './screens/Journey.jsx';
import Lesson from './screens/Lesson.jsx';
import Rewards from './screens/Rewards.jsx';
import Parent from './screens/Parent.jsx';

class Boundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="screen error-screen">
        <div className="pic">🙈</div>
        <p>حصلت مشكلة صغيرة</p>
        <button type="button" className="start-btn" onClick={() => { this.setState({ err: null }); this.props.onReset?.(); }} aria-label="رجوع">🏠</button>
      </div>
    );
  }
}

function Shell() {
  const { state, dispatch } = useStore();
  const [route, setRoute] = useState({ screen: 'welcome' });
  const reduce = useReducedMotion();
  const routeRef = useRef(route); routeRef.current = route;

  // time tracking: counts only while the page is visible and Maria is past the welcome screen
  useEffect(() => {
    const t = setInterval(() => {
      const r = routeRef.current;
      if (document.visibilityState !== 'visible' || r.screen === 'welcome' || r.screen === 'parent') return;
      dispatch({ type: 'TICK', seconds: 5, world: r.world && (r.screen === 'lesson' || r.screen === 'journey') ? r.world : null });
    }, 5000);
    return () => clearInterval(t);
  }, [dispatch]);

  const go = (r) => { audio.stop(); setRoute(r); window.scrollTo?.(0, 0); };
  const bg = BACKGROUNDS.find((b) => b.id === state.equipped.background) || BACKGROUNDS[0];
  return (
    <div className={`app ${reduce ? 'reduce-motion' : ''}`} style={{ '--app-bg': bg.css }}>
      <Boundary onReset={() => setRoute({ screen: 'home' })}>
        {route.screen === 'welcome' && <Welcome onStart={() => setRoute({ screen: 'home' })} />}
        {route.screen === 'home' && <Home onWorld={(w) => setRoute({ screen: 'journey', world: w })} onRewards={() => go({ screen: 'rewards' })} onParent={() => go({ screen: 'parent' })} />}
        {route.screen === 'journey' && <Journey worldId={route.world} onHome={() => go({ screen: 'home' })} onLesson={(id) => setRoute({ screen: 'lesson', world: route.world, lesson: id })} />}
        {route.screen === 'lesson' && <Lesson key={route.lesson} worldId={route.world} lessonId={route.lesson}
          onExit={() => go({ screen: 'journey', world: route.world })} onStartLesson={(id) => go({ screen: 'lesson', world: route.world, lesson: id })} />}
        {route.screen === 'rewards' && <Rewards onHome={() => go({ screen: 'home' })} />}
        {route.screen === 'parent' && <Parent onClose={() => go({ screen: 'home' })} />}
      </Boundary>
      {route.screen !== 'parent' && <Caption />}
    </div>
  );
}

export default function App() {
  return <StoreProvider><Shell /></StoreProvider>;
}
