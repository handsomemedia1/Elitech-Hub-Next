"use client";

import Link from "next/link";
import Image from "next/image";
import { openCookieSettings } from "@/lib/consent";
import styles from "./Footer.module.css";
import { Bot as IconBot, Brain as IconBrain, Bug as IconBug, Building2 as IconBuilding2, Calendar as IconCalendar, Compass as IconCompass, FileText as IconFileText, FlaskConical as IconFlaskConical, Info as IconInfo, Laptop as IconLaptop, LinkedinLogo as IconLinkedinLogo, Mail as IconMail, MapPin as IconMapPin, Microscope as IconMicroscope, Newspaper as IconNewspaper, Phone as IconPhone, Question as IconQuestion, Rocket as IconRocket, Settings as IconSettings, Shield as IconShield, ShieldCheck as IconShieldCheck, Student as IconStudent, ThreadsLogo as IconThreadsLogo, WhatsappLogo as IconWhatsappLogo, YoutubeLogo as IconYoutubeLogo } from '@/components/icons';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        {/* Brand */}
        <div className={styles.footerBrand}>
          <div className={styles.footerLogo}>
            <Image src="/images/logo.png" alt="Elitech Hub" width={44} height={44} style={{ objectFit: "contain" }} />
            <span>Elitech<span className={styles.accentRed}>Hub</span></span>
          </div>
          <p className={styles.footerDesc}>
            Nigeria&apos;s premier AI‑powered cybersecurity training platform. Internship
            experience · SMEDAN certified · RC: 8693883. Serving students from Ibadan to
            London, New York &amp; beyond.
          </p>
          <div className={styles.footerSocials}>
            <a href="https://www.linkedin.com/company/elitech-hub" target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="LinkedIn">
              <IconLinkedinLogo size={18} aria-hidden="true" />
            </a>
            <a href="https://www.youtube.com/@elitechub" target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="YouTube">
              <IconYoutubeLogo size={18} aria-hidden="true" />
            </a>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <h5 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Connect with Founder</h5>
            <div className={styles.footerSocials}>
              <a href="https://www.threads.com/@thehandsomekvng" target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="Threads">
                <IconThreadsLogo size={18} aria-hidden="true" />
              </a>
              <a href="mailto:elijah@elitechub.com" className={styles.social} aria-label="Email">
                <IconMail size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Programs */}
        <div>
          <h4 className={styles.footerColTitle}>Programs</h4>
          <ul className={styles.footerLinks}>
            <li><Link href="/before-cybersecurity"><IconCompass size="1em" aria-hidden="true" /><span>Before Cybersecurity</span></Link></li>
            <li><Link href="/ai-training"><IconBot size="1em" aria-hidden="true" /><span>AI Cybersecurity (6 Weeks)</span></Link></li>
            <li><Link href="/programs#ai-security"><IconShield size="1em" aria-hidden="true" /><span>AI Security and Reverse Vulnerability</span></Link></li>
            <li><Link href="/programs/professional"><IconShieldCheck size="1em" aria-hidden="true" /><span>16‑Week Professional</span></Link></li>
            <li><Link href="/programs/corporate-training"><IconBuilding2 size="1em" aria-hidden="true" /><span>Corporate Training</span></Link></li>
            <li><Link href="/apply"><IconRocket size="1em" aria-hidden="true" /><span>Apply Now</span></Link></li>
          </ul>
        </div>

        {/* Consultation & Services */}
        <div>
          <h4 className={styles.footerColTitle}>Advisory &amp; Services</h4>
          <ul className={styles.footerLinks}>
            <li><Link href="/consultation"><IconCalendar size="1em" aria-hidden="true" /><span>1-on-1 Consultation</span></Link></li>
            <li><Link href="/coaching"><IconStudent size="1em" aria-hidden="true" /><span>Career Coaching</span></Link></li>
            <li><Link href="/services"><IconSettings size="1em" aria-hidden="true" /><span>All Enterprise Services</span></Link></li>
            <li><Link href="/services/penetration-testing"><IconBug size="1em" aria-hidden="true" /><span>Penetration Testing</span></Link></li>
            <li><Link href="/services/ai-chatbots"><IconBrain size="1em" aria-hidden="true" /><span>AI Chatbots</span></Link></li>
            <li><Link href="/services/web-development"><IconLaptop size="1em" aria-hidden="true" /><span>Web Development</span></Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className={styles.footerColTitle}>Company</h4>
          <ul className={styles.footerLinks}>
            <li><Link href="/about"><IconInfo size="1em" aria-hidden="true" /><span>About Us</span></Link></li>
            <li><Link href="/research"><IconFlaskConical size="1em" aria-hidden="true" /><span>Research</span></Link></li>
            <li><Link href="/resources"><IconFileText size="1em" aria-hidden="true" /><span>Resources</span></Link></li>
            <li><Link href="/lab"><IconMicroscope size="1em" aria-hidden="true" /><span>Security Lab</span></Link></li>
            <li><Link href="/blog"><IconNewspaper size="1em" aria-hidden="true" /><span>Blog</span></Link></li>
            <li><Link href="/faq"><IconQuestion size="1em" aria-hidden="true" /><span>FAQ</span></Link></li>
            <li><Link href="/contact"><IconPhone size="1em" aria-hidden="true" /><span>Contact</span></Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className={styles.footerColTitle}>Get In Touch</h4>
          <a href="https://maps.google.com/?q=Ibadan,Nigeria" target="_blank" rel="noopener noreferrer" className={styles.footerContact}><IconMapPin size="1em" aria-hidden="true" /> Ibadan, Nigeria</a>
          <a href="https://wa.me/2347081968062" className={styles.footerContact}><IconWhatsappLogo size="1em" aria-hidden="true" /> +234 708 196 8062</a>
          <a href="mailto:info@elitechub.com" className={styles.footerContact}><IconMail size="1em" aria-hidden="true" /> info@elitechub.com</a>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>© {new Date().getFullYear()} <span>Elitech Hub Limited</span>. All rights reserved. RC: 8693883 | SMEDAN Certified</p>
        <div className={styles.footerBottomLinks}>
          <Link href="/policies">Privacy Policy</Link>
          <Link href="/policies#terms">Terms of Service</Link>
          <Link href="/policies#cookies">Cookie Policy</Link>
          <button type="button" onClick={openCookieSettings}>Cookie Settings</button>
        </div>
      </div>
    </footer>
  );
}
