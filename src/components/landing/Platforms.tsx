"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Platforms.module.css";

/* ===================================
   MARKETPLACE INTEGRATION — Dark section
   "One Hub. Every Marketplace."
   Bento cards + CTA button.
   =================================== */

export function Platforms() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="integrations"
      ref={sectionRef}
      className={`${styles.section} ${visible ? styles.visible : ""}`}
    >
      {/* Ambient glow */}
      <div className={styles.ambientGlow} />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Intelligence Layer
          </div>
          <h2 className={styles.headline}>
            One Hub. Every Marketplace.
          </h2>
          <p className={styles.sub}>
            Experience the future of unified commerce. SUPRSYNCR AI orchestrates
            your entire ecosystem—handling everything from automated listing
            optimization to real-time inventory sync and intelligent fulfillment
            across global channels.
          </p>
        </div>

        {/* Bento grid */}
        <div className={styles.bentoGrid}>
          {/* Large card — Unified AI Engine */}
          <div className={styles.bentoLarge}>
            <div className={styles.bentoVisual}>
              {/* Center hub */}
              <div className={styles.hubIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                <div className={styles.pulseRing} />
              </div>

              {/* Satellite icons */}
              <div className={`${styles.satellite} ${styles.satTL}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
              </div>
              <div className={`${styles.satellite} ${styles.satTR}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              </div>
              <div className={`${styles.satellite} ${styles.satBL}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
              </div>
              <div className={`${styles.satellite} ${styles.satBR}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
              </div>

              {/* Connection lines SVG */}
              <svg className={styles.connectionLines} viewBox="0 0 600 200">
                <path d="M150 50 Q300 100 300 100" fill="none" stroke="#5e39e0" strokeDasharray="4 4" strokeWidth="2" opacity="0.3" />
                <path d="M450 50 Q300 100 300 100" fill="none" stroke="#5e39e0" strokeDasharray="4 4" strokeWidth="2" opacity="0.3" />
                <path d="M150 150 Q300 100 300 100" fill="none" stroke="#5e39e0" strokeDasharray="4 4" strokeWidth="2" opacity="0.3" />
                <path d="M450 150 Q300 100 300 100" fill="none" stroke="#5e39e0" strokeDasharray="4 4" strokeWidth="2" opacity="0.3" />
              </svg>
            </div>

            <div className={styles.bentoText}>
              <h4 className={styles.bentoTitle}>Unified AI Engine</h4>
              <p className={styles.bentoDesc}>
                Cross-channel synchronization with 100% data integrity.
              </p>
            </div>
          </div>

          {/* Side card — AI-Driven Listings */}
          <div className={styles.bentoSide}>
            <div className={styles.listingsVisual}>
              <div className={styles.listingRow}>
                <span className={styles.listingDot} />
                <div className={styles.listingBar} />
              </div>
              <div className={`${styles.listingRow} ${styles.listingRowDim}`}>
                <span className={styles.listingDot} />
                <div className={`${styles.listingBar} ${styles.shorter}`} />
              </div>
            </div>

            <div className={styles.bentoText}>
              <h4 className={styles.bentoTitle}>AI-Driven Listings</h4>
              <p className={styles.bentoDesc}>
                One product, infinite storefronts, perfectly optimized.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className={styles.ctaWrap}>
          <a href="/register" className={styles.ctaBtn}>
            <span>Get Early Access</span>
            <span className={styles.ctaArrow}>→</span>
          </a>
          <div className={styles.ctaMeta}>
            <span className={styles.ctaMetaTop}>Waitlist Priority Live</span>
          </div>
        </div>
      </div>
    </section>
  );
}
