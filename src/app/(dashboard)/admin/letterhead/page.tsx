"use client";
import React from 'react';
import { Printer } from 'lucide-react';
import styles from './letterhead.module.css';

export default function LetterheadGenerator() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.headerRow} ${styles.noPrint}`}>
        <h1 className={styles.title}>Letterhead Generator</h1>
        <button onClick={handlePrint} className={styles.printBtn}>
          <Printer size={18} /> Print to PDF
        </button>
      </div>

      <div className={`${styles.a4Page} ${styles.printContainer}`}>
        <img src="/assets/images/logo.png" className={styles.watermark} alt="" />

        <div className={styles.docHeader}>
          <img src="/assets/images/logo.png" className={styles.logo} alt="Elitech Hub Logo" />
          <div className={styles.contactInfo}>
            <strong>Elitech Hub</strong>
            Ibadan, Nigeria<br />
            +234 708 196 8062<br />
            elitechub.com | info@elitechub.com
          </div>
        </div>

        <div 
          className={styles.content} 
          contentEditable 
          suppressContentEditableWarning
        >
          <p>[Date]</p>
          <br />
          <p><strong>[Recipient Name]</strong><br />
          [Recipient Title]<br />
          [Company Name]<br />
          [Address]</p>
          <br />
          <p>Dear [Name],</p>
          <br />
          <p>Begin typing your official letter here. This entire section is fully editable. You can delete this text, paste your own content, format it, and use it exactly like Microsoft Word.</p>
          <br />
          <p>When you are finished, simply click the "Print to PDF" button.</p>
          <br /><br />
          <p>Sincerely,</p>
          <br /><br />
          <p><strong>[Your Name]</strong><br />
          [Your Title]<br />
          Elitech Hub</p>
        </div>

        <div className={styles.docFooter}>
          <div><strong>Elitech Hub</strong> — Africa's Leading Cybersecurity Bootcamp</div>
          <div><span>RC:</span> 8693883 &nbsp;&nbsp;|&nbsp;&nbsp; SMEDAN Certified</div>
        </div>
      </div>
      
      {/* Print CSS Injection to hide dashboard elements */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body, html {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide dashboard shell */
          [class*="sidebar"], [class*="header"], [class*="nav"], .${styles.noPrint} {
            display: none !important;
          }
          body * {
            visibility: hidden;
          }
          .${styles.printContainer}, .${styles.printContainer} * {
            visibility: visible;
          }
          .${styles.printContainer} {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            margin: 0 !important;
            padding: 20mm !important;
            width: 210mm !important;
            min-height: 297mm !important;
            box-shadow: none !important;
            background: white !important;
          }
        }
      `}} />
    </div>
  );
}
