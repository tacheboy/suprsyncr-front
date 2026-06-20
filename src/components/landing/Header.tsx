"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoS}>S</span>
          <span className={styles.logoRest}>uprsyncr</span>
        </Link>

        {/* Center nav */}
        <nav className={styles.nav}>
          <Link href="#features" className={styles.navLink}>Features</Link>
          <Link href="#integrations" className={styles.navLink}>Integrations</Link>
          <Link href="#pricing" className={styles.navLink}>Pricing</Link>
        </nav>

        {/* Right actions */}
        <div className={styles.actions}>
          <Link href="/login" className={styles.login}>Log in</Link>
          <Link href="/register" className={styles.bookDemo}>Book a Demo</Link>
        </div>
      </div>
    </header>
  );
}
