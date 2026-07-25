import Link from "next/link";
import Image from "next/image";
import ScrollNavbar from "@/components/ScrollNavbar";
import Footer from "@/components/Footer";
import styles from "./PageLayout.module.css";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className={styles.pageWrapper}>
      <ScrollNavbar />
      <main className={styles.pageMain}>{children}</main>
      <Footer />
    </div>
  );
}
