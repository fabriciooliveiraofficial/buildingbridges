import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

/* ------------------------------------------------------------------ */
/* Round flags (inline SVG, drawn for a circular crop, no external     */
/* requests and no dependency on emoji fonts — Windows renders flag    */
/* emoji as plain letters such as "BR" / "US").                        */
/* ------------------------------------------------------------------ */

const star = (cx: number, cy: number, r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.4;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
};

const FlagUS: React.FC = () => {
  const stripe = 512 / 13;
  const stars: [number, number][] = [];
  for (let row = 0; row < 5; row++) {
    const cols = row % 2 === 0 ? 4 : 3;
    for (let c = 0; c < cols; c++) {
      stars.push([row % 2 === 0 ? 38 + c * 62 : 69 + c * 62, 40 + row * 48]);
    }
  }
  return (
    <svg viewBox="0 0 512 512" preserveAspectRatio="xMidYMid slice" className="block size-full" aria-hidden="true">
      <rect width="512" height="512" fill="#ffffff" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} y={i * 2 * stripe} width="512" height={stripe + 0.5} fill="#bf0a30" />
      ))}
      <rect width="262" height={stripe * 7} fill="#0a3161" />
      {stars.map(([x, y], i) => (
        <polygon key={i} points={star(x, y, 13)} fill="#ffffff" />
      ))}
    </svg>
  );
};

const FlagBR: React.FC = () => (
  <svg viewBox="0 0 512 512" preserveAspectRatio="xMidYMid slice" className="block size-full" aria-hidden="true">
    <rect width="512" height="512" fill="#009b3a" />
    <polygon points="256,58 462,256 256,454 50,256" fill="#fedf00" />
    <circle cx="256" cy="256" r="104" fill="#002776" />
    <clipPath id="br-globe"><circle cx="256" cy="256" r="104" /></clipPath>
    <path
      d="M140 262 C 200 228, 300 228, 372 292"
      stroke="#ffffff"
      strokeWidth="20"
      fill="none"
      clipPath="url(#br-globe)"
    />
    {[[214, 214], [292, 204], [326, 250], [190, 290], [262, 320], [232, 248], [286, 282]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="5" fill="#ffffff" />
    ))}
  </svg>
);

const FlagMX: React.FC = () => (
  <svg viewBox="0 0 512 512" preserveAspectRatio="xMidYMid slice" className="block size-full" aria-hidden="true">
    <rect width="171" height="512" fill="#006847" />
    <rect x="171" width="171" height="512" fill="#ffffff" />
    <rect x="341" width="171" height="512" fill="#ce1126" />
    <circle cx="256" cy="256" r="58" fill="none" stroke="#3f8f4a" strokeWidth="14" strokeDasharray="34 12" />
    <ellipse cx="256" cy="258" rx="30" ry="24" fill="#a56a3a" />
    <circle cx="256" cy="224" r="11" fill="#a56a3a" />
    <path d="M232 282 Q256 296 280 282" stroke="#3f8f4a" strokeWidth="8" fill="none" strokeLinecap="round" />
  </svg>
);

const languages = [
  { code: 'en', label: 'English', Flag: FlagUS, aria: 'Change language', hint: 'Drag to move' },
  { code: 'pt', label: 'Português', Flag: FlagBR, aria: 'Alterar idioma', hint: 'Arraste para mover' },
  { code: 'es', label: 'Español (México)', Flag: FlagMX, aria: 'Cambiar idioma', hint: 'Arrastra para mover' },
];

/* ------------------------------------------------------------------ */
/* Draggable language switcher                                          */
/* ------------------------------------------------------------------ */

const MARGIN = 16; // px kept between the button and the viewport edge
const DRAG_THRESHOLD = 5; // px of movement before a press turns into a drag
const STORAGE_KEY = 'bb-language-widget-pos';

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const readStoredPosition = (): { fx: number; fy: number } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (typeof p.fx === 'number' && typeof p.fy === 'number') {
        return { fx: clamp(p.fx, 0, 1), fy: clamp(p.fy, 0, 1) };
      }
    }
  } catch {
    // storage unavailable — fall back to the default corner
  }
  return { fx: 1, fy: 1 }; // bottom-right
};

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  // Position is stored as a 0..1 fraction of the free viewport area, so it stays
  // valid (and never leaves the screen) when the window is resized or rotated.
  const [pos, setPos] = useState(readStoredPosition);

  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number; moved: boolean } | null>(null);
  const swallowClick = useRef(false);
  const lastPos = useRef(pos);

  const currentLanguage = languages.find(l => i18n.language?.startsWith(l.code)) || languages[0];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const persist = (p: { fx: number; fy: number }) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      // ignore
    }
  };

  const moveTo = (left: number, top: number) => {
    const btn = btnRef.current;
    if (!btn) return null;
    const s = btn.offsetWidth;
    const freeW = Math.max(1, window.innerWidth - s - MARGIN * 2);
    const freeH = Math.max(1, window.innerHeight - s - MARGIN * 2);
    const next = {
      fx: clamp((left - MARGIN) / freeW, 0, 1),
      fy: clamp((top - MARGIN) / freeH, 0, 1),
    };
    lastPos.current = next;
    setPos(next);
    return next;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    dragRef.current = { x: e.clientX, y: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d) return;
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < DRAG_THRESHOLD) return;
      d.moved = true;
      setDragging(true);
      setIsOpen(false);
    }
    moveTo(e.clientX - d.ox, e.clientY - d.oy);
  };

  const endDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (d?.moved) {
      swallowClick.current = true; // the click that follows a drag must not toggle the menu
      window.setTimeout(() => { swallowClick.current = false; }, 100);
      setDragging(false);
      persist(lastPos.current);
    }
  };

  const onClick = () => {
    if (swallowClick.current) {
      swallowClick.current = false;
      return;
    }
    setIsOpen(o => !o);
  };

  // Keyboard alternative to dragging: Shift + arrow keys nudge the widget.
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (!e.shiftKey) return;
    const step = 32;
    const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
    const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
    if (!dx && !dy) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    const next = moveTo(r.left + dx, r.top + dy);
    if (next) persist(next);
  };

  // Close the menu on outside press / Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  // The menu opens towards the side of the screen that has room for it.
  const openUp = pos.fy > 0.5;
  const alignRight = pos.fx > 0.5;
  const CurrentFlag = currentLanguage.Flag;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none [--s:48px] sm:[--s:56px]">
      <div
        ref={rootRef}
        className="absolute pointer-events-auto"
        style={{
          left: `calc(${pos.fx} * (100% - var(--s) - ${MARGIN * 2}px) + ${MARGIN}px)`,
          top: `calc(${pos.fy} * (100% - var(--s) - ${MARGIN * 2}px) + ${MARGIN}px)`,
        }}
      >
        <AnimatePresence>
          {isOpen && !dragging && (
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: openUp ? 12 : -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: openUp ? 12 : -12, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`absolute ${openUp ? 'bottom-full mb-3' : 'top-full mt-3'} ${alignRight ? 'right-0' : 'left-0'} min-w-[220px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-1.5`}
            >
              {languages.map(({ code, label, Flag }) => {
                const active = currentLanguage.code === code;
                return (
                  <button
                    key={code}
                    role="menuitem"
                    onClick={() => changeLanguage(code)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors hover:bg-slate-50 ${
                      active ? 'text-orange-500 bg-orange-50/60' : 'text-slate-700'
                    }`}
                  >
                    <span className="block size-8 shrink-0 rounded-full overflow-hidden shadow-[inset_0_0_0_1px_rgba(15,23,42,0.15)]">
                      <Flag />
                    </span>
                    <span>{label}</span>
                    {active && <span className="material-symbols-outlined text-base ml-auto">check</span>}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          ref={btnRef}
          type="button"
          aria-label={`${currentLanguage.aria} (${currentLanguage.label})`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          title={`${currentLanguage.aria} · ${currentLanguage.hint}`}
          whileHover={{ scale: 1.06 }}
          animate={{ scale: dragging ? 1.12 : 1 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={onClick}
          onKeyDown={onKeyDown}
          style={{ touchAction: 'none' }}
          className={`relative block size-[var(--s)] rounded-full select-none outline-none focus-visible:ring-4 focus-visible:ring-accent/50 ${
            dragging ? 'cursor-grabbing shadow-[0_18px_40px_-10px_rgba(10,49,97,0.55)]' : 'cursor-grab shadow-[0_10px_28px_-8px_rgba(10,49,97,0.45)]'
          }`}
        >
          <span className="block size-full rounded-full overflow-hidden ring-[3px] ring-white">
            <CurrentFlag />
          </span>
          {/* depth: soft gloss + hairline edge so light flags stay visible on white pages */}
          <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/35 via-transparent to-slate-900/25 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.18)]" />
          <span className="pointer-events-none absolute -top-1 -right-1 size-5 sm:size-6 rounded-full bg-accent text-white ring-2 ring-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[13px] sm:text-[15px] leading-none">
              {isOpen ? 'close' : 'language'}
            </span>
          </span>
        </motion.button>
      </div>
    </div>
  );
};
