"use client";

import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useScroll } from "@/components/layout/SmoothScroll";
import { BRAND, NAV } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

export function Header() {
  const { scrollTo, setMenuLock } = useScroll();
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useGSAP(
    () => {
      const header = headerRef.current!;
      // Only the bar moves: a transformed <header> would trap the fixed menu panel.
      const bar = header.querySelector(".site-header__bar");
      let hidden = false;
      const setHidden = (next: boolean) => {
        if (next === hidden) return;
        hidden = next;
        gsap.to(bar, { yPercent: next ? -100 : 0, duration: 0.7, ease: "cine.out", overwrite: "auto" });
      };

      // Steps aside while reading downwards, returns as soon as you scroll back.
      ScrollTrigger.create({
        start: 0,
        end: "max",
        refreshPriority: -1,
        onUpdate: (self) => {
          const y = self.scroll();
          header.toggleAttribute("data-scrolled", y > 40);
          setHidden(!openRef.current && self.direction === 1 && y > window.innerHeight * 0.6);
        },
      });

      NAV.forEach((item) => {
        ScrollTrigger.create({
          // Resolve outside the header scope: selector strings are scoped by useGSAP.
          trigger: document.querySelector(item.href),
          start: "top 55%",
          end: "bottom 55%",
          refreshPriority: -1,
          onToggle: (self) => {
            if (self.isActive) setActive(item.href);
            else setActive((current) => (current === item.href ? null : current));
          },
        });
      });
    },
    { scope: headerRef },
  );

  const close = useCallback(
    (restoreFocus = true) => {
      setOpen(false);
      setMenuLock(false);
      if (restoreFocus) toggleRef.current?.focus();
    },
    [setMenuLock],
  );

  // Menu: Escape closes, Tab stays inside the header while it is open.
  useEffect(() => {
    if (!open) return;
    const header = headerRef.current!;
    header.querySelector<HTMLElement>("#mobile-menu a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab") return;
      const items = [...header.querySelectorAll<HTMLElement>("button, #mobile-menu a")];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Close the panel if the viewport grows into the desktop navigation.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && openRef.current && close(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [close]);

  const onNavigate = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href");
    if (openRef.current) close(false);
    if (href) scrollTo(href);
  };

  return (
    <header ref={headerRef} className="site-header fixed inset-x-0 top-0 z-50" data-open={open ? "" : undefined}>
      <div className="site-header__bar relative z-[2] flex h-[var(--header-h)] items-center justify-between px-[var(--gutter)]">
        <a
          href="#top"
          onClick={onNavigate}
          className="font-display text-[1.375rem] font-bold tracking-[0.22em] text-bone"
          aria-label={`${BRAND.name} — back to the top`}
        >
          {BRAND.name}
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active === item.href ? "true" : undefined}
                  className="link-blade eyebrow text-titanium transition-colors duration-500 hover:text-bone aria-[current=true]:text-bone"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="eyebrow -mr-2 flex min-h-11 items-center gap-3 px-2 text-bone lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => {
            if (open) close();
            else {
              setOpen(true);
              setMenuLock(true);
            }
          }}
        >
          {open ? "Close" : "Menu"}
          {open ? <X size={18} strokeWidth={1.5} aria-hidden="true" /> : <Menu size={18} strokeWidth={1.5} aria-hidden="true" />}
        </button>
      </div>

      <div id="mobile-menu" className="mobile-menu lg:hidden" inert={!open}>
        <nav aria-label="Mobile">
          <ul className="grid gap-2">
            {NAV.map((item, i) => (
              <li key={item.href} style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms" }}>
                <a href={item.href} onClick={onNavigate} className="display block py-1 text-[clamp(2.75rem,12vw,4.5rem)]">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="eyebrow mt-auto">{BRAND.concept}</p>
      </div>
    </header>
  );
}
