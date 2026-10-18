// Call ONCE in your entry file (main.jsx / index.jsx), BEFORE the router renders.
// A browser reload always lands on the home page, at the top (hero).
// Normal navigation and directly typed/shared links are untouched.
export function reloadToHero() {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/admin")) return;
  const nav = performance.getEntriesByType?.("navigation")?.[0] as
    PerformanceNavigationTiming | undefined;
  if (nav?.type !== "reload") return;
  if (window.location.pathname !== "/" || window.location.hash || window.location.search) {
    window.history.replaceState(null, "", "/");
  }
  // set AFTER replaceState so it applies to the entry we just rewrote
  if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  const top = () => window.scrollTo(0, 0);
  top();
  window.addEventListener("load", () => { top(); requestAnimationFrame(top); setTimeout(top, 120); }, { once: true });
}
