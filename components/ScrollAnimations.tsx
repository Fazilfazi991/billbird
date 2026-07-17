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

    targets.forEach((target, index) => {
      target.classList.add("scroll-reveal");
      target.classList.add(index % 2 === 0 ? "from-down" : "from-up");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        const direction = window.scrollY >= lastY ? "down" : "up";
        lastY = window.scrollY;

        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            const naturalDirection = Array.from(targets).indexOf(target) % 2 === 0 ? "down" : "up";
            const revealDirection = direction === "up" ? (naturalDirection === "down" ? "up" : "down") : naturalDirection;
            target.classList.toggle("from-up", revealDirection === "up");
            target.classList.toggle("from-down", revealDirection === "down");
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
