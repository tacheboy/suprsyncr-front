"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./OneClickAccounts.module.css";

/* ===================================
   PROBLEM SECTION — "The hurdles to D2C
   profitability are higher than ever."
   Two columns: Profitability Paradox
   & Data Deluge with interactive cards.
   =================================== */

export function OneClickAccounts() {
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
      ref={sectionRef}
      className={`${styles.section} ${visible ? styles.visible : ""}`}
    >
      <div className={styles.container}>
        {/* Section header */}
        <div className={styles.header}>
          <h2 className={styles.headline}>
            The hurdles to D2C profitability
            <br />
            are higher than ever.
          </h2>
          <p className={styles.sub}>
            Scaling a brand today requires navigating a landscape of volatility
            and noise. We&apos;ve identified the core bottlenecks holding your
            brand back.
          </p>
        </div>

        {/* Two column grid */}
        <div className={styles.grid}>
          {/* Column 1: Profitability Paradox */}
          <div className={styles.column}>
            <h3 className={styles.colTitle}>
              <span className={styles.colIcon} data-variant="error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
                  <polyline points="16 17 22 17 22 11" />
                </svg>
              </span>
              The Profitability Paradox
            </h3>

            <div className={styles.cardGrid}>
              <div className={styles.card}>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} data-width="75" />
                </div>
                <h4 className={styles.cardTitle}>Rising CAC</h4>
                <p className={styles.cardDesc}>
                  Ad costs are scaling faster than your revenue, eating into
                  every acquisition.
                </p>
              </div>

              <div className={styles.card}>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} data-width="50" />
                </div>
                <h4 className={styles.cardTitle}>Shrinking Margins</h4>
                <p className={styles.cardDesc}>
                  Operational inefficiencies and inventory leakage are draining
                  your bottom line.
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: The Data Deluge */}
          <div className={styles.column}>
            <h3 className={styles.colTitle}>
              <span className={styles.colIcon} data-variant="secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </span>
              The Data Deluge
            </h3>

            <div className={styles.cardGrid}>
              <div className={styles.card}>
                <div className={styles.barGroup}>
                  <div className={styles.miniBar} style={{ height: 32 }} />
                  <div className={styles.miniBar} style={{ height: 48 }} />
                  <div className={styles.miniBar} style={{ height: 24 }} />
                </div>
                <h4 className={styles.cardTitle}>Data Scattering</h4>
                <p className={styles.cardDesc}>
                  Shopify, Meta, Amazon… your truth is fragmented across a
                  dozen dashboards.
                </p>
              </div>

              <div className={styles.card}>
                <div className={styles.dotGroup}>
                  <span className={styles.pulseDot} />
                  <span className={styles.pulseDot} style={{ animationDelay: "0.2s" }} />
                  <span className={styles.pulseDot} style={{ animationDelay: "0.4s" }} />
                </div>
                <h4 className={styles.cardTitle}>Marketing Saturation</h4>
                <p className={styles.cardDesc}>
                  Generic campaigns are being tuned out. High-impact
                  personalization is unreachable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
