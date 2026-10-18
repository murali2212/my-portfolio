import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cardState, computeSlots, wrap } from "./beltMath.js";
import "./InfiniteProjectCardBelt.css";

export default function InfiniteProjectCardBelt({
  projects = [],
  onProjectClick,
  dwell = 0,
  gap = 28,
  className = "",
  ariaLabel = "Projects",
}) {
  const count = projects.length;
  const rootRef = useRef(null);
  const itemRefs = useRef([]);
  const shadowRefs = useRef([]);
  const [slots, setSlots] = useState(count);

  const S = useRef({
    s: 0, v: 0, pitch: 400, L: 0,
    auto: 1, autoTarget: 1,
    hover: false, dragging: false, pending: false, didDrag: false,
    pid: null, startX: 0, startY: 0, lastX: 0, lastT: 0,
    idleAt: 0, glide: null, tgt: null, nextAt: 0, reduce: false, visible: true, slots: 0,
  });

  const slotCount = useMemo(() => slots, [slots]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !count) return;
    const st = S.current;
    const measure = () => {
      const first = itemRefs.current[0];
      const cardW = first ? first.offsetWidth : 360;
      st.pitch = cardW + gap;
      const n = computeSlots(root.clientWidth, st.pitch, count);
      st.L = n * st.pitch;
      st.slots = n;
      setSlots((prev) => (prev === n ? prev : n));
      render();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, gap, slotCount]);

  function render() {
    const st = S.current;
    if (!st.L) return;
    const strength = st.reduce ? 0.35 : 1;
    for (let i = 0; i < st.slots; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const x = wrap(i * st.pitch - st.s, st.L);
      const c = cardState(x, st.pitch, strength);
      el.style.transform =
        `translate3d(${x.toFixed(2)}px,${c.y.toFixed(2)}px,${c.z.toFixed(1)}px) ` +
        `rotateY(${c.rotY.toFixed(2)}deg) rotateZ(${c.rotZ.toFixed(2)}deg) scale(${c.scale.toFixed(4)})`;
      el.style.opacity = c.opacity.toFixed(3);
      el.style.filter = c.blur > 0.05 || c.brightness < 0.999
        ? `blur(${c.blur.toFixed(2)}px) brightness(${c.brightness.toFixed(3)})` : "none";
      el.style.zIndex = c.depth;
      const sh = shadowRefs.current[i];
      if (sh) sh.style.opacity = c.shadow.toFixed(3);
    }
  }

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const st = S.current;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => { st.reduce = mq.matches; if (st.reduce) st.v = 0; render(); };
    st.reduce = mq.matches;
    mq.addEventListener?.("change", onMq);

    const now = () => performance.now();
    const bump = () => { st.idleAt = now() + 1400; st.autoTarget = 0; st.glide = null; st.tgt = null; };

    const onDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      st.pending = true; st.didDrag = false; st.pid = e.pointerId;
      st.startX = st.lastX = e.clientX; st.startY = e.clientY; st.lastT = now();
      st.v = 0; bump();
    };
    const onMove = (e) => {
      if (!st.pending || e.pointerId !== st.pid) return;
      const t = now();
      if (!st.dragging) {
        if (Math.abs(e.clientX - st.startX) < 6) return;      // drag threshold
        st.dragging = true; st.didDrag = true;
        root.dataset.dragging = "true";
        try { root.setPointerCapture(e.pointerId); } catch {}
        st.lastX = st.startX; st.lastT = t;
      }
      const dx = e.clientX - st.lastX, dt = Math.max((t - st.lastT) / 1000, 0.001);
      st.s -= dx;                                             // drag left => cards move left
      const inst = Math.max(-4000, Math.min(4000, -dx / dt));
      st.v = st.v * 0.6 + inst * 0.4;
      st.lastX = e.clientX; st.lastT = t;
      bump();
    };
    const onUp = (e) => {
      if (e.pointerId !== st.pid) return;
      const wasDragging = st.dragging;
      st.pending = false; st.dragging = false; st.pid = null;
      delete root.dataset.dragging;
      try { root.releasePointerCapture(e.pointerId); } catch {}
      if (wasDragging && now() - st.lastT > 90) st.v = 0;
      if (st.reduce) st.v = 0;
      bump();
      setTimeout(() => { st.didDrag = false; }, 0);
    };

    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;   // vertical scroll stays native
      e.preventDefault();
      const k = e.deltaMode === 1 ? 16 : 1;
      st.s += e.deltaX * k; st.v = 0; bump();
    };

    const onEnter = (e) => { if (e.pointerType === "mouse") st.hover = true; };
    const onLeave = () => { st.hover = false; };

    const onFocusIn = (e) => {
      const li = e.target.closest?.("[data-slot]");
      if (!li || li.dataset.primary !== "true") return;
      const i = Number(li.dataset.slot);
      st.glide = st.s + wrap(i * st.pitch - st.s, st.L);
      st.v = 0; st.idleAt = now() + 2500; st.autoTarget = 0;
      root.scrollLeft = 0;
    };
    const onKey = (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const dir = e.key === "ArrowRight" ? 1 : -1;
      st.glide = (st.glide ?? st.s) + dir * st.pitch;
      st.v = 0; st.idleAt = now() + 2500; st.autoTarget = 0;
    };
    const onClickCapture = (e) => {
      if (st.didDrag) { e.preventDefault(); e.stopPropagation(); }   // a drag is never a click
    };
    const onScroll = () => { root.scrollLeft = 0; };

    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("keydown", onKey);
    root.addEventListener("click", onClickCapture, true);
    root.addEventListener("scroll", onScroll);

    const io = new IntersectionObserver(([en]) => { st.visible = en.isIntersecting; }, { rootMargin: "100px" });
    io.observe(root);

    let raf = 0, last = now();
    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((t - last) / 1000, 0.05); last = t;
      if (!st.visible || document.hidden || !st.L) return;

      if (!st.dragging) {
        if (st.glide != null) {
          const diff = st.glide - st.s;
          st.s += diff * (1 - Math.exp(-dt * 6));
          if (Math.abs(diff) < 0.4) { st.s = st.glide; st.glide = null; st.tgt = null; }
        } else if (!st.reduce) {
          if (Math.abs(st.v) > 40) {
            st.v *= Math.exp(-dt * 2.4); st.s += st.v * dt; st.tgt = null;   // momentum
          } else {
            st.v = 0;                                                         // soft settle on nearest card
            if (st.tgt == null) { st.tgt = Math.round(st.s / st.pitch) * st.pitch; st.nextAt = t + dwell; }
            if (dwell && !st.hover && t > st.idleAt && t > st.nextAt && Math.abs(st.tgt - st.s) < 2) {
              st.tgt += st.pitch; st.nextAt = t + dwell;
            }
            const far = Math.abs(st.tgt - st.s) > st.pitch * 0.5;
            st.s += (st.tgt - st.s) * (1 - Math.exp(-dt * (far ? 1.5 : 2.6)));
          }
        }
        if (Math.abs(st.s) > st.L * 50) st.s = wrap(st.s, st.L);
      }
      render();
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      mq.removeEventListener?.("change", onMq);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("keydown", onKey);
      root.removeEventListener("click", onClickCapture, true);
      root.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dwell, count]);

  if (!count) return null;

  const items = [];
  for (let i = 0; i < slotCount; i++) {
    const p = projects[i % count];
    const primary = i < count;
    items.push(
      <li
        key={i}
        className="icb__item"
        data-slot={i}
        data-primary={primary}
        aria-hidden={primary ? undefined : "true"}
        ref={(el) => { itemRefs.current[i] = el; }}
      >
        <span className="icb__shadow" ref={(el) => { shadowRefs.current[i] = el; }} />
        <button
          type="button"
          className="icb__card"
          tabIndex={primary ? 0 : -1}
          onClick={() => onProjectClick?.(p)}
        >
          <span className="icb__media">
            {p.image && <img className="icb__img" src={p.image} alt="" draggable={false} loading="eager" />}
          </span>
          <span className="icb__body">
            <span className="icb__meta">
              <span className="icb__index">{p.index}</span>
              {p.status && <span className="icb__status">{p.status}</span>}
            </span>
            <span className="icb__title">{p.title}</span>
            {p.description && <span className="icb__desc">{p.description}</span>}
            {p.tags?.length > 0 && (
              <span className="icb__tags" aria-label="Project tags">
                {p.tags.slice(0, 3).map((tag) => <span className="icb__tag" key={`${p.slug}-${tag}`}>{tag}</span>)}
              </span>
            )}
            <span className="icb__footer"><span>VIEW PROJECT</span><span aria-hidden="true">→</span></span>
          </span>
        </button>
      </li>
    );
  }

  return (
    <ul ref={rootRef} className={`icb ${className}`.trim()} role="group" aria-label={ariaLabel} aria-roledescription="carousel">
      {items}
    </ul>
  );
}