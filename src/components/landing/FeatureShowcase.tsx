"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FeatureShowcase.module.css";

/* ===================================
   AI FEATURES SECTION — Two features:
   1. AI-Driven Predictive Analytics
   2. Autonomous Marketing Optimization
   =================================== */

export function FeatureShowcase() {
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
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className={`${styles.section} ${visible ? styles.visible : ""}`}
    >
      {/* Feature 1: Predictive Analytics */}
      <div className={styles.featureRow}>
        {/* Visual left */}
        <div className={styles.featureVisual}>
          <div className={styles.dashboardCard}>
            <div className={styles.dashInner}>
              <div className={styles.dashHeader}>
                <div className={styles.dashHeaderBar} />
                <div className={styles.dashDots}>
                  <span className={styles.dotRed} />
                  <span className={styles.dotPurple} />
                </div>
              </div>
              <div className={styles.dashBody}>
                <div className={styles.chartArea}>
                  <div className={styles.chartFill} />
                </div>
                <div className={styles.metricsRow}>
                  <div className={styles.metricBlock} />
                  <div className={styles.metricBlock} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Text right */}
        <div className={styles.featureText}>
          <div className={styles.label}>Intelligence Layer</div>
          <h3 className={styles.featureTitle}>
            AI-Driven Predictive
            <br />
            Analytics
          </h3>
          <p className={styles.featureDesc}>
            Let AI manage the complexity. SUPRSYNCR autonomously reallocates
            budgets to high-yielding campaigns, surfacing creative gaps and
            executing bid adjustments while you sleep.
          </p>
          <div className={styles.checkList}>
            <div className={styles.checkItem}>
              <span className={styles.checkIcon}>✓</span>
              <p>Real-time cross-channel attribution modeling</p>
            </div>
            <div className={styles.checkItem}>
              <span className={styles.checkIcon}>✓</span>
              <p>LTV-based customer cohort optimization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 2: Autonomous Marketing */}
      <div className={`${styles.featureRow} ${styles.featureRowReverse}`}>
        {/* Text left */}
        <div className={styles.featureText}>
          <div className={styles.label}>Performance Engine</div>
          <h3 className={styles.featureTitle}>
            Autonomous Marketing
            <br />
            Optimization
          </h3>
          <p className={styles.featureDesc}>
            Experience hands-free growth. Our engine executes complex scaling
            strategies across your entire funnel, ensuring every dollar spent
            targets your highest ROI customers.
          </p>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>+42%</div>
              <div className={styles.statLabel}>Avg ROAS Lift</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>-18%</div>
              <div className={styles.statLabel}>CAC Reduction</div>
            </div>
          </div>
        </div>

        {/* Visual right */}
        <div className={styles.featureVisual}>
          <div className={styles.toggleCard}>
            <div className={styles.toggleRow}>
              <div className={styles.toggleDot} data-active="true" />
              <div className={styles.toggleBarText} />
              <div className={styles.toggleSwitch} data-on="true">
                <div className={styles.toggleKnob} />
              </div>
            </div>
            <div className={`${styles.toggleRow} ${styles.toggleRowDim}`}>
              <div className={styles.toggleDot} />
              <div className={`${styles.toggleBarText} ${styles.shorter}`} />
              <div className={styles.toggleSwitch}>
                <div className={styles.toggleKnob} />
              </div>
            </div>
            <div className={styles.toggleRow}>
              <div className={styles.toggleDot} data-active="true" />
              <div className={`${styles.toggleBarText} ${styles.wider}`} />
              <div className={styles.toggleSwitch} data-on="true">
                <div className={styles.toggleKnob} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
