import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { OneClickAccounts } from "@/components/landing/OneClickAccounts";
import { Platforms } from "@/components/landing/Platforms";
import { AIFeatures } from "@/components/landing/AIFeatures";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { Security } from "@/components/landing/Security";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Header — UNTOUCHED */}
      <Header />

      {/* 1. Hero — "Unlock Growth with AI that sells for you." */}
      <Hero />

      {/* 2. Problem Section — "The hurdles to D2C profitability" */}
      <OneClickAccounts />

      {/* 3. AI Features — Predictive Analytics + Autonomous Marketing */}
      <FeatureShowcase />

      {/* 4. Scale Steps — "Scale In 3 Elegant Steps" */}
      <AIFeatures />

      {/* 5. Marketplace — "One Hub. Every Marketplace." */}
      <Platforms />

      {/* 6. Testimonials — "Trusted by High-Impact Brands" */}
      <Testimonials />

      {/* 7. Final CTA — "Ready to Transform Your D2C Business?" */}
      <Pricing />

      {/* 8. Footer */}
      <Footer />

      {/* Nullified components kept for import safety */}
      <Stats />
      <CTA />
      <Security />
    </div>
  );
}
