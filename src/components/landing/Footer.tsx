"use client";

import Link from "next/link";
import styles from "./Footer.module.css";

/* ===================================
   FOOTER — Dark gradient with noise,
   4 link columns, social icons,
   and large watermark text.
   =================================== */

const footerLinks = [
  {
    title: "Industry Solutions",
    links: [
      { label: "D2C Growth", href: "#" },
      { label: "Marketplace Sync", href: "#" },
      { label: "Inventory Intelligence", href: "#" },
      { label: "AI Ad Manager", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Case Studies", href: "#" },
      { label: "Growth Blog", href: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "LinkedIn", href: "https://linkedin.com/company/suprsyncr" },
      { label: "Twitter", href: "#" },
      { label: "Support", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Link columns */}
        <div className={styles.columns}>
          {footerLinks.map((col) => (
            <div key={col.title} className={styles.column}>
              <h5 className={styles.colTitle}>{col.title}</h5>
              <ul className={styles.colList}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={styles.colLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className={styles.bottomBar}>
          <span className={styles.copy}>
            &copy; 2026 SUPRSYNCR. All rights reserved.
          </span>
          <div className={styles.socials}>
            {/* Facebook */}
            <a href="#" className={styles.socialIcon} aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.324v-21.35c0-.732-.593-1.325-1.325-1.325z" />
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className={styles.socialIcon} aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.337 2.609 6.76 6.977 6.977 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.351-.2 6.777-2.616 6.977-6.977.058-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.331-2.602-6.761-6.977-6.977-1.281-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div className={styles.watermark}>
        <h2 className={styles.watermarkText}>SUPRSYNCR</h2>
      </div>
    </footer>
  );
}
