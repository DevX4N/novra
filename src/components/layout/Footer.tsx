"use client";

import { useScroll } from "@/components/layout/SmoothScroll";
import { BRAND, NAV } from "@/content/site";

export function Footer() {
  const { scrollTo } = useScroll();
  return (
    <footer className="site-footer">
      <p className="flex items-baseline gap-4">
        <span className="font-display text-2xl font-bold tracking-[0.18em] text-bone">{BRAND.name}</span>
        <span className="eyebrow">{BRAND.model} concept</span>
      </p>

      <nav aria-label="Footer">
        <ul className="flex flex-wrap gap-x-8 gap-y-1">
          {NAV.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="link-blade eyebrow text-titanium hover:text-bone"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(item.href);
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <p className="text-xs text-steel">{BRAND.concept}</p>
    </footer>
  );
}
