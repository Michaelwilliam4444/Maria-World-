import React from 'react';
import { ACCESSORIES } from '../data/rewards.js';

// Original illustrated child avatar (pure SVG). With a parent-supplied photo, the photo
// (already cartoon-filtered on the device) replaces the drawn head.
export default function Avatar({ avatar, accessory, size = 120, mood = 'happy', className = '' }) {
  const { skin, hair, outfit, photo, usePhoto } = avatar;
  const acc = ACCESSORIES.find((a) => a.id === accessory);
  const cheer = mood === 'cheer';
  const showPhoto = usePhoto && photo;
  return (
    <svg className={`avatar ${cheer ? 'avatar-cheer' : ''} ${className}`} width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="ماريا">
      <defs>
        <clipPath id="headClip"><circle cx="100" cy="92" r="60" /></clipPath>
        <radialGradient id="avGlow" cx="50%" cy="40%" r="60%"><stop offset="0%" stopColor="#fff" stopOpacity=".9" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#avGlow)" />
      {acc?.id === 'wings' && <text x="100" y="150" fontSize="120" textAnchor="middle" opacity=".85">🦋</text>}
      {/* body */}
      <path d="M38 200 C40 160 62 146 100 146 C138 146 160 160 162 200 Z" fill={outfit} />
      <path d="M80 147 Q100 166 120 147" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".85" />
      <circle cx="100" cy="178" r="5" fill="#fff" opacity=".8" />
      {showPhoto ? (
        <g>
          <circle cx="100" cy="92" r="64" fill="#fff" />
          <image href={photo} x="40" y="32" width="120" height="120" clipPath="url(#headClip)" preserveAspectRatio="xMidYMid slice" />
          <circle cx="100" cy="92" r="61" fill="none" stroke={outfit} strokeWidth="5" />
        </g>
      ) : (
        <g>
          {/* hair puffs + back hair */}
          <circle cx="46" cy="62" r="24" fill={hair} />
          <circle cx="154" cy="62" r="24" fill={hair} />
          <ellipse cx="100" cy="92" rx="66" ry="64" fill={hair} />
          {/* neck + face */}
          <rect x="88" y="136" width="24" height="14" rx="6" fill={skin} />
          <circle cx="100" cy="98" r="54" fill={skin} />
          <circle cx="47" cy="104" r="9" fill={skin} /><circle cx="153" cy="104" r="9" fill={skin} />
          {/* bangs */}
          <path d="M48 88 C52 50 84 38 104 40 C132 42 152 60 152 86 C140 70 124 62 108 66 C100 56 82 60 70 70 C62 76 54 82 48 88 Z" fill={hair} />
          {/* eyes */}
          <g className="eyes">
            <ellipse cx="80" cy="102" rx="7" ry={cheer ? 4 : 8.5} fill="#2b1d17" />
            <ellipse cx="120" cy="102" rx="7" ry={cheer ? 4 : 8.5} fill="#2b1d17" />
            {!cheer && <><circle cx="82.5" cy="98.5" r="2.6" fill="#fff" /><circle cx="122.5" cy="98.5" r="2.6" fill="#fff" /></>}
          </g>
          <circle cx="68" cy="118" r="8" fill="#ff8fa3" opacity=".45" />
          <circle cx="132" cy="118" r="8" fill="#ff8fa3" opacity=".45" />
          {cheer
            ? <path d="M84 120 Q100 140 116 120 Z" fill="#c2414f" stroke="#2b1d17" strokeWidth="2" strokeLinejoin="round" />
            : <path d="M86 122 Q100 134 114 122" fill="none" stroke="#2b1d17" strokeWidth="3.5" strokeLinecap="round" />}
        </g>
      )}
      {/* accessories */}
      {acc?.id === 'bow' && <text x="150" y="52" fontSize="40" textAnchor="middle">🎀</text>}
      {acc?.id === 'flower' && <text x="52" y="56" fontSize="36" textAnchor="middle">🌼</text>}
      {acc?.id === 'crown' && <text x="100" y="40" fontSize="46" textAnchor="middle">👑</text>}
      {acc?.id === 'horn' && <path d="M92 40 L100 2 L108 40 Z" fill="#ffd66b" stroke="#f3a83b" strokeWidth="2" />}
      {acc?.id === 'glasses' && <g fontSize="30" textAnchor="middle"><text x="80" y="112">⭐</text><text x="120" y="112">⭐</text></g>}
    </svg>
  );
}
