"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AIFeatures.module.css";

/* ===================================
   SCALE STEPS — "Scale In 3 Elegant Steps"
   Three purple icon cards with connector line.
   =================================== */

const steps = [
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    title: "1. Secure Connect",
    desc: "Instant, secure synchronization with your existing commerce and ad stacks.",
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5v1l3 2 3-1v3l-3 1-3-2h-4l-3 2-3-1v-3l3 1 3-2v-1A4 4 0 0 1 12 2z" />
        <circle cx="12" cy="6" r="1.5" />
        <path d="M12 15v7" />
        <path d="M8 18h8" />
      </svg>
    ),
    title: "2. Engine Synthesis",
    desc: "Our AI maps your historical data to build an autonomous growth blueprint.",
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
    title: "3. Autonomous Scale",
    desc: "Deploy high-impact optimizations and monitor your metrics as they ascend.",
  },
];

export function AIFeatures() {
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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${visible ? styles.visible : ""}`}
    >
      {/* Background */}
      <div className={styles.bgLayer} />
      <div className={styles.bgDots} />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.headline}>Scale In 3 Elegant Steps</h2>
          <p className={styles.sub}>
            Integration that respects your time. Intelligence that grows your
            brand.
          </p>
        </div>

        {/* Steps grid */}
        <div className={styles.stepsGrid}>
          {/* Connector line */}
          <div className={styles.connector} />

          {steps.map((step, i) => (
            <div
              key={step.title}
              className={styles.stepCard}
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              <div className={styles.iconWrap}>
                {step.icon}
              </div>
              <div className={styles.stepContent}>
                <h4 className={styles.stepTitle}>{step.title}</h4>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
