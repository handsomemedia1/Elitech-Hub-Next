"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, BookOpen, Users, PenTool, MessageSquare, 
  Settings, LogOut, Menu, X, FileText, FlaskConical, Award, DollarSign, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './dashboard.module.css';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'LMS Manager', icon: BookOpen },
  { href: '/admin/users', label: 'Students', icon: Users },
  { href: '/admin/applications', label: 'CRM & Leads', icon: MessageSquare },
  { href: '/admin/certificates', label: 'Certificates', icon: Award },
  { href: '/admin/writers', label: 'Writers Panel', icon: PenTool },
  { href: '/writer', label: 'Writer Portal', icon: LayoutDashboard },
  { href: '/writer/editor', label: 'Write Blog', icon: FileText },
  { href: '/admin/lab', label: 'Research Lab', icon: FlaskConical },
  { href: '/admin/letterhead', label: 'Letterhead Gen', icon: Mail },
  { href: '/admin/pricing', label: 'Pricing Engine', icon: DollarSign },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const WRITER_LINKS = [
  { href: '/writer', label: 'Overview', icon: LayoutDashboard },
  { href: '/writer/posts', label: 'My Articles', icon: FileText },
  { href: '/writer/editor', label: 'Write New', icon: PenTool },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = pathname.startsWith('/admin');
  const links = isAdmin ? ADMIN_LINKS : WRITER_LINKS;
  const roleName = isAdmin ? 'Admin' : 'Writer';

  // For /admin/login or /writer/login, don't show the dashboard shell
  if (pathname === '/admin/login' || pathname === '/writer/login') {
    return <div className={styles.authWrapper}>{children}</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            className={styles.sidebarOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2>Elitech <span>{roleName}</span></h2>
          <button className={styles.closeSidebarBtn} onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className={styles.topbarRight}>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>
                {roleName[0]}
              </div>
              <span className={styles.userName}>{roleName} Portal</span>
            </div>
          </div>
        </header>

        <div className={styles.contentInner}>
          {children}
        </div>
      </main>
    </div>
  );
}
