"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./Hero.module.css";

export function Hero() {
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
      className={`${styles.hero} ${visible ? styles.visible : ""}`}
    >
      {/* Dot grid background */}
      <div className={styles.dotGrid} />

      <div className={styles.container}>
        {/* Left content */}
        <div className={styles.content}>
          {/* Eyebrow badge */}
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowIcon}>✦</span>
            The Intelligence Era
          </div>

          {/* Headline */}
          <h1 className={styles.headline}>
            Unlock Growth with{" "}
            <br />
            <span className={styles.headlineAccent}>AI that sells for you.</span>
          </h1>

          {/* Description */}
          <p className={styles.sub}>
            Let AI manage the complexity. SUPRSYNCR autonomously reallocates
            budgets to high-yielding campaigns, surfacing creative gaps and
            executing bid adjustments while you sleep. High-performance growth,
            automated.
          </p>

          {/* CTAs */}
          <div className={styles.ctaRow}>
            <Link href="/register" className={styles.primaryBtn}>
              Request a Demo
              <span className={styles.arrow}>→</span>
            </Link>
            <Link href="#features" className={styles.ghostBtn}>
              View Ecosystem
            </Link>
          </div>
        </div>

        {/* Right visual — Intelligence Engine */}
        <div className={styles.visualWrap}>
          <div className={styles.visualCard}>
            {/* Background animated path */}
            <svg className={styles.bgPath} fill="none" viewBox="0 0 400 300">
              <path
                d="M0 150C100 150 100 50 200 50C300 50 300 250 400 250"
                stroke="url(#hero-gradient)"
                strokeDasharray="8 8"
                strokeWidth="2"
              />
              <defs>
                <linearGradient id="hero-gradient" x1="0" x2="400" y1="0" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#5e39e0" />
                  <stop offset="1" stopColor="#5e39e0" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center content */}
            <div className={styles.engineContent}>
              <div className={styles.engineIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5v1l3 2 3-1v3l-3 1-3-2h-4l-3 2-3-1v-3l3 1 3-2v-1A4 4 0 0 1 12 2z" />
                  <circle cx="12" cy="6" r="1.5" />
                  <path d="M12 15v7" />
                  <path d="M8 18h8" />
                </svg>
              </div>
              <h3 className={styles.engineTitle}>Intelligence Engine Active</h3>
              <div className={styles.bars}>
                <div className={styles.bar} style={{ height: "40%", animationDelay: "0s" }} />
                <div className={styles.bar} style={{ height: "80%", animationDelay: "0.2s" }} />
                <div className={styles.bar} style={{ height: "100%", animationDelay: "0.4s" }} />
                <div className={styles.bar} style={{ height: "60%", animationDelay: "0.1s" }} />
              </div>
              <p className={styles.engineSub}>
                Optimizing Sales · Monitoring Margin · Predicting LTV
              </p>
            </div>
          </div>
          {/* Glow blob */}
          <div className={styles.glow} />
        </div>
      </div>
    </section>
  );
}
