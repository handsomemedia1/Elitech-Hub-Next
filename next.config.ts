import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/mentorship',
        destination: '/coaching',
        permanent: true,
      },
      {
        source: '/blog/step-by-step-cybersecurity-guide-for-overwhelmed-beginners-moftm94x',
        destination: '/blog/what-cybersecurity-means-and-why-it-is-important-mniuol60',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'clickfix-the-scam-hijacking-laptops-in-2026' }],
        destination: '/blog/clickfix-the-scam-hijacking-laptops-in-2026',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'the-canvas-lms-breach-the-human-side-of-cybersecurity' }],
        destination: '/blog/the-canvas-lms-breach-the-human-side-of-cybersecurity',
        permanent: true,
      },
      {
        source: '/blog-posts/zero-trust-and-identity-first-security.html',
        destination: '/blog/zero-trust-and-identity-first-security',
        permanent: true,
      },
      {
        source: '/blog-posts/curiosity-the-invisible-key-to-cybersecurity.html',
        destination: '/blog/curiosity-the-invisible-key-to-cybersecurity',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'critical-infrastructure-under-cyber-threat' }],
        destination: '/blog/critical-infrastructure-under-cyber-threat',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'ransomware-evolution-and-resilience-strategies' }],
        destination: '/blog/ransomware-evolution-and-resilience-strategies',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'ai-sovereignty-in-africa-who-controls-your-data-and-future' }],
        destination: '/blog/ai-sovereignty-in-africa-who-controls-your-data-and-future',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'election-cyber-risks-and-emerging-security-threats-in-2027' }],
        destination: '/blog/election-cyber-risks-and-emerging-security-threats-in-2027',
        permanent: true,
      },
      {
        source: '/blog-posts/patch-everything-week-your-digital-life-might-be-more-exposed-mo690dji.html',
        destination: '/blog/patch-everything-week-your-digital-life-might-be-more-exposed-mo690dji',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'deepfake-and-synthetic-identity-threats' }],
        destination: '/blog/deepfake-and-synthetic-identity-threats',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'curiosity-the-invisible-key-to-cybersecurity' }],
        destination: '/blog/curiosity-the-invisible-key-to-cybersecurity',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'the-surge-of-double-extortion-and-standalone-data-extortion' }],
        destination: '/blog/the-surge-of-double-extortion-and-standalone-data-extortion',
        permanent: true,
      },
      {
        source: '/blog-posts/critical-infrastructure-under-cyber-threat.html',
        destination: '/blog/critical-infrastructure-under-cyber-threat',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'patch-everything-week-your-digital-life-might-be-more-exposed-mo690dji' }],
        destination: '/blog/patch-everything-week-your-digital-life-might-be-more-exposed-mo690dji',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'regulatory-compliance-and-cyber-risk-governance' }],
        destination: '/blog/regulatory-compliance-and-cyber-risk-governance',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'emerging-cyber-threats-and-counter-strategies-in-nigeria' }],
        destination: '/blog/emerging-cyber-threats-and-counter-strategies-in-nigeria',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'beyond-firewalls-the-hidden-layers-of-modern-cyber-defense' }],
        destination: '/blog/beyond-firewalls-the-hidden-layers-of-modern-cyber-defense',
        permanent: true,
      },
      {
        source: '/mentor-application',
        destination: '/volunteer',
        permanent: true,
      },
      {
        source: '/apply.html',
        destination: '/apply',
        permanent: true,
      },
      {
        source: '/research-paper.html',
        destination: '/research-paper',
        permanent: true,
      },
      {
        source: '/blog-posts/nigeria-cybersecurity-outlook-2026-threats-and-trends-mor7igji.html',
        destination: '/blog/nigeria-cybersecurity-outlook-2026-threats-and-trends-mor7igji',
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/blog-posts/beyond-firewalls-the-hidden-layers-of-modern-cyber-defense.html',
        destination: '/blog/beyond-firewalls-the-hidden-layers-of-modern-cyber-defense',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'cybersecurity-skills-shortage-and-human-ai-defense' }],
        destination: '/blog/cybersecurity-skills-shortage-and-human-ai-defense',
        permanent: true,
      },
      {
        source: '/get-involved.html',
        destination: '/get-involved',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'the-digital-map-navigating-the-8-worlds-of-cybersecurity' }],
        destination: '/blog/the-digital-map-navigating-the-8-worlds-of-cybersecurity',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'foxconn-cyberattack-disrupts-major-tech-supply-chains' }],
        destination: '/blog/foxconn-cyberattack-disrupts-major-tech-supply-chains',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'biometric-identity-theft-and-data-privacy-risks' }],
        destination: '/blog/biometric-identity-theft-and-data-privacy-risks',
        permanent: true,
      },
      {
        source: '/blog-posts/the-digital-map-navigating-the-8-worlds-of-cybersecurity.html',
        destination: '/blog/the-digital-map-navigating-the-8-worlds-of-cybersecurity',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'the-hackers-new-best-friend-how-ai-is-being-weaponized-against-you' }],
        destination: '/blog/the-hackers-new-best-friend-how-ai-is-being-weaponized-against-you',
        permanent: true,
      },
      {
        source: '/blog-posts/shai-hulud-worm-a-hacked-package-threat.html',
        destination: '/blog/shai-hulud-worm-a-hacked-package-threat',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'how-east-africa-plans-to-lead-in-ai' }],
        destination: '/blog/how-east-africa-plans-to-lead-in-ai',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'fintech-growth-and-expanding-cyber-attack-surfaces-in-2026' }],
        destination: '/blog/fintech-growth-and-expanding-cyber-attack-surfaces-in-2026',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'how-to-set-up-your-first-cybersecurity-lab-at-home-even-with-zero-it-experience' }],
        destination: '/blog/how-to-set-up-your-first-cybersecurity-lab-at-home-even-with-zero-it-experience',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'how-fake-it-support-is-powering-modern-cyber-attacks' }],
        destination: '/blog/how-fake-it-support-is-powering-modern-cyber-attacks',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'nigeria-cybersecurity-outlook-2026-threats-and-trends-mor7igji' }],
        destination: '/blog/nigeria-cybersecurity-outlook-2026-threats-and-trends-mor7igji',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'it-didnt-begin-with-a-crime-from-curiosity-to-crime' }],
        destination: '/blog/it-didnt-begin-with-a-crime-from-curiosity-to-crime',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'agentic-ai-attacks-defenses-the-ai-arms-race-explained' }],
        destination: '/blog/agentic-ai-attacks-defenses-the-ai-arms-race-explained',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'shai-hulud-worm-a-hacked-package-threat' }],
        destination: '/blog/shai-hulud-worm-a-hacked-package-threat',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'safeguarding-electoral-infrastructure' }],
        destination: '/blog/safeguarding-electoral-infrastructure',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'bank-account-hacking-in-nigeria-what-is-really-happening-and-how-to-stay-safe' }],
        destination: '/blog/bank-account-hacking-in-nigeria-what-is-really-happening-and-how-to-stay-safe',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'zero-trust-and-identity-first-security' }],
        destination: '/blog/zero-trust-and-identity-first-security',
        permanent: true,
      },
      {
        source: '/blog-posts/regulatory-compliance-and-cyber-risk-governance.html',
        destination: '/blog/regulatory-compliance-and-cyber-risk-governance',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'ai-is-now-both-the-hacker-and-the-guard' }],
        destination: '/blog/ai-is-now-both-the-hacker-and-the-guard',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'the-1m-firewall-vs-a-tired-employee' }],
        destination: '/blog/the-1m-firewall-vs-a-tired-employee',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'how-to-recognize-and-avoid-phishing-scams-in-nigeria-mo31j9uq' }],
        destination: '/blog/how-to-recognize-and-avoid-phishing-scams-in-nigeria-mo31j9uq',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'what-cybersecurity-means-and-why-it-is-important-mniuol60' }],
        destination: '/blog/what-cybersecurity-means-and-why-it-is-important-mniuol60',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'nigerias-rising-exposure-to-cyber-threats-and-the-realities-often-left-unaddressed' }],
        destination: '/blog/nigerias-rising-exposure-to-cyber-threats-and-the-realities-often-left-unaddressed',
        permanent: true,
      },
      {
        source: '/research.html',
        destination: '/research',
        permanent: true,
      },
      {
        source: '/programs.html',
        destination: '/programs',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'supply-chain-and-third-party-fragility' }],
        destination: '/blog/supply-chain-and-third-party-fragility',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'the-seven-phases-of-a-cyber-attack-mo1h84pt' }],
        destination: '/blog/the-seven-phases-of-a-cyber-attack-mo1h84pt',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'network-reliability-and-digital-forensic-readiness' }],
        destination: '/blog/network-reliability-and-digital-forensic-readiness',
        permanent: true,
      },
      {
        source: '/article.html',
        has: [{ type: 'query', key: 'slug', value: 'is-your-phone-hacked-5-hidden-warning-signs' }],
        destination: '/blog/is-your-phone-hacked-5-hidden-warning-signs',
        permanent: true,
      },
      {
        source: '/blog-posts/bank-account-hacking-in-nigeria-what-is-really-happening-and-how-to-stay-safe.html',
        destination: '/blog/bank-account-hacking-in-nigeria-what-is-really-happening-and-how-to-stay-safe',
        permanent: true,
      },
      {
        source: '/blog-posts/emerging-cyber-threats-and-counter-strategies-in-nigeria.html',
        destination: '/blog/emerging-cyber-threats-and-counter-strategies-in-nigeria',
        permanent: true,
      },
      {
        source: '/contact.html',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/lab.html',
        destination: '/lab',
        permanent: true,
      },
      {
        source: '/about.html',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/policies.html',
        destination: '/policies',
        permanent: true,
      },
      {
        source: '/blog.html',
        missing: [{ type: 'query', key: 'tag' }],
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/blog-posts/tutorial-home-lab-setup',
        destination: '/blog/how-to-set-up-your-first-cybersecurity-lab-at-home-even-with-zero-it-experience',
        permanent: true,
      },
      {
        source: '/blog-posts/cybersecurity-bootcamp-guaranteed-internship.html',
        destination: '/programs/cybersecurity-bootcamp',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ijawxlndyslanklfigua.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "www.elitechub.com",
      },
      {
        protocol: "https",
        hostname: "elitechub.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
