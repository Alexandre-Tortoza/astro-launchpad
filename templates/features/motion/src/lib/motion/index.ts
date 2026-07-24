export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function observeIntersection(
  targets: NodeListOf<Element> | Element[],
  className = "is-visible",
  options: IntersectionObserverInit = {
    threshold: 0.15,
    rootMargin: "0px 0px -48px 0px",
  },
): IntersectionObserver {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add(className);
        observer.unobserve(entry.target);
      }
    }
  }, options);

  for (const target of Array.from(targets)) {
    observer.observe(target);
  }

  return observer;
}
