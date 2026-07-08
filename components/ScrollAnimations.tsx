"use client";

import { useEffect } from "react";

export function ScrollAnimations() {
  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main section:not(#home), main article, footer, .section-shell > div",
      ),
    );
    let lastY = window.scrollY;

    targets.forEach((target) => {
      target.classList.add("scroll-reveal");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        const direction = window.scrollY >= lastY ? "down" : "up";
        lastY = window.scrollY;

        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            target.classList.toggle("from-up", direction === "up");
            target.classList.toggle("from-down", direction === "down");
            target.classList.add("is-visible");
          } else if (entry.boundingClientRect.top > window.innerHeight || entry.boundingClientRect.bottom < 0) {
            target.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  return null;
}
