"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./Pricing.module.css";

/* ===================================
   FINAL CTA — Purple banner
   "Ready to Transform Your D2C Business?"
   =================================== */

export function Pricing() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="pricing"
      ref={ref}
      className={`${styles.section} ${visible ? styles.visible : ""}`}
    >
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Background decorations */}
          <div className={styles.blobTL} />
          <div className={styles.blobBR} />

          {/* Content */}
          <div className={styles.content}>
            <h2 className={styles.headline}>
              Ready to Transform Your
              <br />
              D2C Business?
            </h2>
            <p className={styles.sub}>
              Join the ranks of high-growth brands dominating their niche with
              unified intelligence.
            </p>
            <div className={styles.ctaWrap}>
              <Link href="/register" className={styles.ctaBtn}>
                Request a Demo Today
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
