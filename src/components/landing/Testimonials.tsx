"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Testimonials.module.css";

/* ===================================
   TESTIMONIALS — "Trusted by High-Impact Brands"
   Two glass cards with star ratings,
   quotes, and author info.
   =================================== */

const testimonials = [
  {
    quote:
      "SUPRSYNCR didn't just give us data; they gave us a roadmap. Within the first 90 days, we saw our retention rates climb by 30% and our operational waste vanish. It's the brain our business was missing.",
    name: "Sarah Jenkins",
    role: "Founder, Lume Skincare",
  },
  {
    quote:
      "The predictive inventory management alone saved us over ₹15L in lost sales last quarter. If you're serious about D2C, you're either using SUPRSYNCR or you're falling behind your competitors.",
    name: "David Chen",
    role: "COO, Peak Performance Gear",
  },
];

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#5e39e0" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function Testimonials() {
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
        {/* Header row */}
        <div className={styles.headerRow}>
          <div className={styles.headerText}>
            <h2 className={styles.headline}>Trusted by High-Impact Brands</h2>
            <p className={styles.sub}>
              Hear from founders who have unlocked the next stage of D2C
              evolution.
            </p>
          </div>
          <div className={styles.navButtons}>
            <button className={styles.navBtn} aria-label="Previous testimonial">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className={styles.navBtn} aria-label="Next testimonial">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Testimonial cards */}
        <div className={styles.cardGrid}>
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={styles.card}
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              {/* Stars */}
              <div className={styles.stars}>
                {[...Array(5)].map((_, j) => (
                  <StarIcon key={j} />
                ))}
              </div>

              {/* Quote */}
              <p className={styles.quote}>&ldquo;{t.quote}&rdquo;</p>

              {/* Author */}
              <div className={styles.author}>
                <div className={styles.avatar}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div className={styles.authorName}>{t.name}</div>
                  <div className={styles.authorRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
