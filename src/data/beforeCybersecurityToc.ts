// ============================================================
// Before Cybersecurity — public table of contents
// Safe to import in browser components. It holds titles and summaries only;
// the full chapter text lives in beforeCybersecurityData.ts, which is
// server-only so paid content is never shipped to visitors who have not paid.
// CHAPTER_TOC is generated from CHAPTERS. If chapter titles, slugs, summaries
// or order change, update CHAPTER_TOC to match (a server check warns on drift).
// ============================================================

export interface Part {
  number: number;
  title: string;
  slug: string;
  theme: string;
  description: string;
  chapters: number[]; // Chapter numbers
}

export const BOOK_METADATA = {
  title: 'Before Cybersecurity',
  subtitle: 'What Nobody Tells You Before You Start Learning Cybersecurity',
  author: 'Elijah Adegboyega Adeyeye',
  authorTitle: 'Founder & Lead Instructor, Elitech Hub',
  publisher: 'Elitech Hub Press',
  year: 2026,
  edition: '2026 Revised Interactive Edition',
  canonicalUrl: 'https://www.elitechub.com/before-cybersecurity',
  corePremise: 'You do not need to know everything before you start cybersecurity. You need to understand what you are starting.',
  summary: 'A practical, technically grounded orientation system designed to help you understand systems, evaluate your starting resources, build safe home laboratories, navigate Nigerian and international cyber law, and develop real capability before chasing tools or certificates.',
  stats: {
    partsCount: 10,
    chaptersCount: 29,
    exercisesCount: 9,
  },
  frameworksReferenced: [
    { name: 'NIST NICE Framework', version: 'SP 800-181 Rev. 1 (2020)', org: 'National Institute of Standards and Technology' },
    { name: 'NIST CSF', version: '2.0 (2024)', org: 'National Institute of Standards and Technology' },
    { name: 'OWASP', version: 'Top 10 & AppSec Guidance (2024)', org: 'Open Worldwide Application Security Project' },
    { name: 'ISC2 Cybersecurity Workforce Study', version: '2025 Edition', org: 'ISC2' },
    { name: 'Cybercrimes (Prohibition, Prevention, etc.) (Amendment) Act', version: '2024 Amendment', org: 'Federal Republic of Nigeria' },
    { name: 'Nigeria Data Protection Act (NDPA)', version: '2023', org: 'Nigeria Data Protection Commission (NDPC)' },
  ],
};

export const PARTS: Part[] = [
  {
    number: 1,
    title: 'Before You Enter',
    slug: 'before-you-enter',
    theme: 'Motivation, Expectations & Starting Resources',
    description: 'An honest audit of why you are entering the field and the transferable skills you already bring.',
    chapters: [1, 2],
  },
  {
    number: 2,
    title: 'The Landscape',
    slug: 'the-landscape',
    theme: 'Landscape vs. Ladder, Teamwork & Real-World Contexts',
    description: 'Understanding cybersecurity as an interconnected terrain, a multi-disciplinary team sport, and an organizational reality.',
    chapters: [3, 4, 5, 6],
  },
  {
    number: 3,
    title: 'Your First Lab',
    slug: 'your-first-lab',
    theme: 'Your Computer Classroom, System Layers & RAM Realities',
    description: 'Mastering the machine on your desk, understanding layered computing architecture, and sizing home virtualization labs.',
    chapters: [7, 8],
  },
  {
    number: 4,
    title: 'Learn to Think',
    slug: 'learn-to-think',
    theme: 'System Vocabulary, Problem-First Thinking & Defense',
    description: 'Learning the language of computing, solving problems rather than collecting tools, analyzing anomalies, and defending through understanding.',
    chapters: [9, 10, 11, 12],
  },
  {
    number: 5,
    title: 'Learn Without Wasting Your Time',
    slug: 'learn-without-wasting-time',
    theme: 'Fundamentals, Compounding & Interdisciplinary Range',
    description: 'Why the basics are not a detour, debunking the 3-month mastery myth, embracing depth, collaborating with peers, and learning beyond security.',
    chapters: [13, 14, 15, 16, 17],
  },
  {
    number: 6,
    title: 'Protect Yourself',
    slug: 'protect-yourself',
    theme: 'Cyber Law, Ethics & Personal Operational Security',
    description: 'Understanding statutory legal rules (Nigerian Cybercrimes Act 2024 & NDPA 2023), written authorization, and establishing personal security hygiene.',
    chapters: [18, 19],
  },
  {
    number: 7,
    title: 'Turn Learning Into Capability',
    slug: 'turn-learning-into-capability',
    theme: 'Certifications, Hiring Pipeline & Portfolio Evidence',
    description: 'What certifications actually prove, navigating the 4-stage employability pipeline, building project evidence, and shaping a T-shaped profile.',
    chapters: [20, 21, 22, 23],
  },
  {
    number: 8,
    title: 'The Future',
    slug: 'the-future',
    theme: 'Cybersecurity in the Age of AI & Continuous Change',
    description: 'Distinguishing AI-powered cybersecurity from securing AI models, and preparing for an industry that never stops moving.',
    chapters: [24, 25],
  },
  {
    number: 9,
    title: 'Find Your Direction',
    slug: 'find-your-direction',
    theme: 'Work-Style Compass & 30-60-90 Day Deliverable Plan',
    description: 'Aligning your problem preferences with real roles (Builder, Defender, Investigator, Researcher, Communicator), and executing your first 90 days.',
    chapters: [26, 27, 28],
  },
  {
    number: 10,
    title: 'The Journey',
    slug: 'the-journey',
    theme: 'Cybersecurity as a Way of Seeing & You Are Not Late',
    description: 'Developing the five investigative questions, shifting your perception of systems, and beginning with confidence.',
    chapters: [29],
  },
];

export interface ChapterSummary {
  number: number;
  partNumber: number;
  title: string;
  slug: string;
  subtitle?: string;
  readTimeMinutes: number;
  summary: string;
  hasExercise: boolean;
  exerciseNumber?: number;
}

export const CHAPTER_TOC: ChapterSummary[] = [
  {
    "number": 1,
    "partNumber": 1,
    "title": "Why Are You Here?",
    "slug": "why-are-you-here",
    "subtitle": "Auditing Motivation and Setting Realistic Expectations",
    "readTimeMinutes": 6,
    "summary": "Every meaningful learning journey begins with an honest audit of motivation. Your reason for entering shapes how you respond when the technical work becomes difficult or unfamiliar.",
    "hasExercise": false
  },
  {
    "number": 2,
    "partNumber": 1,
    "title": "What Are You Bringing With You?",
    "slug": "what-are-you-bringing-with-you",
    "subtitle": "Transferable Strengths and the Starting-Skills Inventory",
    "readTimeMinutes": 7,
    "summary": "Before asking what cybersecurity can teach you, inventory what you already know. Beginners routinely overlook valuable transferable skills in administration, logic, writing, and problem-solving.",
    "hasExercise": true,
    "exerciseNumber": 1
  },
  {
    "number": 3,
    "partNumber": 2,
    "title": "What Cybersecurity Actually Is",
    "slug": "what-cybersecurity-actually-is",
    "subtitle": "NIST NICE Framework, Scope of Defense & Hacking Distinctions",
    "readTimeMinutes": 9,
    "summary": "Cybersecurity is much larger than hacking. Grounded in the NIST NICE Framework, it spans protecting data, systems, and people across diverse economic sectors.",
    "hasExercise": false
  },
  {
    "number": 4,
    "partNumber": 2,
    "title": "Cybersecurity Is a Landscape, Not a Ladder",
    "slug": "cybersecurity-is-a-landscape-not-a-ladder",
    "subtitle": "Debunking the Linear Progression Myth",
    "readTimeMinutes": 7,
    "summary": "Stop imagining cybersecurity as a single vertical ladder. Understanding the landscape prevents you from treating tool exposure as true expertise.",
    "hasExercise": false
  },
  {
    "number": 5,
    "partNumber": 2,
    "title": "Cybersecurity Is a Team Sport",
    "slug": "cybersecurity-is-a-team-sport",
    "subtitle": "Cross-Functional Defense and the Reality of Incident Response",
    "readTimeMinutes": 6,
    "summary": "Cinema portrays cybersecurity as an isolated genius in a dark room. In reality, modern security is cross-functional, requiring coordination across engineers, analysts, legal counsel, and leadership.",
    "hasExercise": false
  },
  {
    "number": 6,
    "partNumber": 2,
    "title": "Where Cybersecurity Meets the Real World",
    "slug": "where-cybersecurity-meets-the-real-world",
    "subtitle": "Sector Realities, Operational Constraints and Business Risk",
    "readTimeMinutes": 8,
    "summary": "A hospital, commercial bank, oil refinery, and SaaS startup operate under completely different realities. Security tools alone cannot calculate risk without understanding the operational context.",
    "hasExercise": false
  },
  {
    "number": 7,
    "partNumber": 3,
    "title": "Your Computer Is Your First Classroom",
    "slug": "your-computer-is-your-first-classroom",
    "subtitle": "The Safe Learning Progression and Ground Zero for Practice",
    "readTimeMinutes": 7,
    "summary": "You do not need an expensive enterprise lab or cloud subscription to begin. Start with the computer you already own and study its hardware, processes, files, and network activity.",
    "hasExercise": false
  },
  {
    "number": 8,
    "partNumber": 3,
    "title": "The Computer You Don't See & Virtualization Memory Limits",
    "slug": "the-computer-you-dont-see",
    "subtitle": "System Layers, Firmware, and Sizing Local Virtual Machines",
    "readTimeMinutes": 9,
    "summary": "When you open your laptop, you only see the desktop interface. Understand the layers underneath and how physical RAM dictates what virtualization home labs you can safely run.",
    "hasExercise": true,
    "exerciseNumber": 2
  },
  {
    "number": 9,
    "partNumber": 4,
    "title": "Learn the Language of Computers",
    "slug": "learn-the-language-of-computers",
    "subtitle": "System Vocabulary, Protocols, and Foundations of Telemetry",
    "readTimeMinutes": 8,
    "summary": "Master the fundamental vocabulary of computing: IP and MAC addresses, TCP/UDP protocols, DNS, HTTP/HTTPS, Authentication vs. Authorization, processes, and logs.",
    "hasExercise": false
  },
  {
    "number": 10,
    "partNumber": 4,
    "title": "Don't Collect Tools. Learn Problems.",
    "slug": "dont-collect-tools-learn-problems",
    "subtitle": "The Four-Question Problem-First Investigation Framework",
    "readTimeMinutes": 7,
    "summary": "A beginner can download dozens of security utilities and still understand nothing. Learn to reason from the problem statement down to the tool, never the reverse.",
    "hasExercise": false
  },
  {
    "number": 11,
    "partNumber": 4,
    "title": "What Happens When Systems Don't Behave?",
    "slug": "what-happens-when-systems-dont-behave",
    "subtitle": "Assumptions, Trust Boundaries, and the Anatomy of Anomalies",
    "readTimeMinutes": 8,
    "summary": "Software developers expect clean inputs, network architects assume internal traffic is trustworthy. Security practitioners study the gap between assumption and reality.",
    "hasExercise": false
  },
  {
    "number": 12,
    "partNumber": 4,
    "title": "To Defend, Understand",
    "slug": "to-defend-understand",
    "subtitle": "Offensive Insight in Service of Defensive Resilience",
    "readTimeMinutes": 9,
    "summary": "The goal of understanding offensive techniques is not to cause harm, but to recognize attack patterns, interpret forensic artifacts, and construct resilient defenses.",
    "hasExercise": true,
    "exerciseNumber": 3
  },
  {
    "number": 13,
    "partNumber": 5,
    "title": "The Basics Are Not a Detour",
    "slug": "the-basics-are-not-a-detour",
    "subtitle": "Why Foundational Computing Is the Shortest Path to Security Mastery",
    "readTimeMinutes": 7,
    "summary": "Beginners frequently rush toward advanced exploitation topics while skipping foundational computing. Without fundamentals, advanced tools only create the illusion of understanding.",
    "hasExercise": false
  },
  {
    "number": 14,
    "partNumber": 5,
    "title": "Stop Trying to Become Good in Three Months",
    "slug": "stop-trying-to-become-good-in-three-months",
    "subtitle": "The Compounding Nature of Technical Judgment",
    "readTimeMinutes": 7,
    "summary": "Debunking the pervasive commercial myth of overnight mastery. Technical capability requires repetition, failure, and cognitive consolidation.",
    "hasExercise": false
  },
  {
    "number": 15,
    "partNumber": 5,
    "title": "The More You Learn, the More You Discover",
    "slug": "the-more-you-learn-the-more-you-discover",
    "subtitle": "Navigating Technical Depth and the Horizon of Knowledge",
    "readTimeMinutes": 6,
    "summary": "As you understand networking, you encounter cloud routing; as you learn operating systems, you discover kernels and hypervisors. This expansion is natural progress, not failure.",
    "hasExercise": false
  },
  {
    "number": 16,
    "partNumber": 5,
    "title": "Don't Travel Alone",
    "slug": "dont-travel-alone",
    "subtitle": "Communities, Mentors, and the Peer Verification Cycle",
    "readTimeMinutes": 7,
    "summary": "Engage with reputable technical communities and documentation, but never blindly copy scripts or commands. Verify and reproduce every solution yourself.",
    "hasExercise": false
  },
  {
    "number": 17,
    "partNumber": 5,
    "title": "Learn Beyond Cybersecurity",
    "slug": "learn-beyond-cybersecurity",
    "subtitle": "The Interdisciplinary Edge: Psychology, Law, Economics, and Systems",
    "readTimeMinutes": 7,
    "summary": "Cybersecurity is not just computer science. The strongest practitioners draw insights from economics (incentive models), psychology (cognitive bias), and law (statutory compliance).",
    "hasExercise": true,
    "exerciseNumber": 5
  },
  {
    "number": 18,
    "partNumber": 6,
    "title": "Know the Rules Before You Travel",
    "slug": "know-the-rules-before-you-travel",
    "subtitle": "Statutory Law, Written Authorization, and the 2024 Cybercrimes Amendment",
    "readTimeMinutes": 10,
    "summary": "A critical analysis of cyber law. In Nigeria, unauthorized access is penalized under the Cybercrimes Act (2024 Amendment) and personal data handling is governed by the NDPA 2023.",
    "hasExercise": false
  },
  {
    "number": 19,
    "partNumber": 6,
    "title": "Protect Yourself Before You Protect Others",
    "slug": "protect-yourself-before-you-protect-others",
    "subtitle": "Personal Operational Security Baseline and Digital Hygiene",
    "readTimeMinutes": 8,
    "summary": "Establish an unassailable personal security baseline: password managers, hardware/app MFA, full-disk encryption, encrypted backups, and lab credential isolation.",
    "hasExercise": true,
    "exerciseNumber": 6
  },
  {
    "number": 20,
    "partNumber": 7,
    "title": "What Does a Certification Actually Prove?",
    "slug": "what-does-a-certification-actually-prove",
    "subtitle": "Standardized Signals, Hiring Realities, and Practical Limits",
    "readTimeMinutes": 8,
    "summary": "Instead of asking only \"Which certification should I buy?\", ask what the credential assesses and what it does not. Real hiring combines credentials with practical evidence and troubleshooting ability.",
    "hasExercise": false
  },
  {
    "number": 21,
    "partNumber": 7,
    "title": "Learning Is Not the Same as Getting Hired",
    "slug": "learning-is-not-the-same-as-getting-hired",
    "subtitle": "The Four-Stage Employability Pipeline",
    "readTimeMinutes": 8,
    "summary": "Understand the four distinct stages: 01 Learning (theory) → 02 Competence (reliable tasks) → 03 Employability (documented evidence & communication) → 04 Employment (market match).",
    "hasExercise": false
  },
  {
    "number": 22,
    "partNumber": 7,
    "title": "Build Evidence, Not Just a Portfolio",
    "slug": "build-evidence-not-just-a-portfolio",
    "subtitle": "The 8-Stage Project Workflow and Documenting Technical Failure",
    "readTimeMinutes": 9,
    "summary": "Move beyond generic screenshots of tool outputs. Document the full workflow: Idea → Research → Knowledge Gaps → Setup → Initial Failure → Fix → Evidence → Lessons.",
    "hasExercise": true,
    "exerciseNumber": 7
  },
  {
    "number": 23,
    "partNumber": 7,
    "title": "Depth Creates Capability. Breadth Creates Context.",
    "slug": "depth-creates-capability-breadth-creates-context",
    "subtitle": "The T-Shaped Security Professional Profile",
    "readTimeMinutes": 7,
    "summary": "The goal is neither to know an inch of everything nor to be locked into an isolated silo. Build a T-shaped profile with one deep functional specialization supported by broad literacy.",
    "hasExercise": false
  },
  {
    "number": 24,
    "partNumber": 8,
    "title": "Cybersecurity in the Age of AI",
    "slug": "cybersecurity-in-the-age-of-ai",
    "subtitle": "Distinguishing AI-Powered Cybersecurity from Securing AI Systems",
    "readTimeMinutes": 9,
    "summary": "Carefully separate using AI as a defensive assistant (detection, triage, summarization) from the engineering discipline of securing AI models, prompts, data, and autonomous agents.",
    "hasExercise": false
  },
  {
    "number": 25,
    "partNumber": 8,
    "title": "Cybersecurity Never Stops Moving",
    "slug": "cybersecurity-never-stops-moving",
    "subtitle": "The Shifting Attack Surface and Continuous Learning as a Baseline",
    "readTimeMinutes": 7,
    "summary": "The security landscape is never static. Technology evolution constantly redefines trust boundaries, requiring an enduring commitment to curiosity.",
    "hasExercise": false
  },
  {
    "number": 26,
    "partNumber": 9,
    "title": "What Kind of Work Might Fit You?",
    "slug": "what-kind-of-work-might-fit-you",
    "subtitle": "The Work-Style Compass: Aligning Instinct with Security Domains",
    "readTimeMinutes": 9,
    "summary": "Explore the 8 core work-style directions: Builder, Defender, Investigator, Analyst, Researcher, Strategist, Communicator, and Organizer.",
    "hasExercise": false
  },
  {
    "number": 27,
    "partNumber": 9,
    "title": "Find Your Starting Point",
    "slug": "find-your-starting-point",
    "subtitle": "Selecting Your First Functional Focus and Avoiding Paralysis",
    "readTimeMinutes": 7,
    "summary": "Synthesizing your skills inventory and work-style compass into a concrete starting decision. Avoid spreading yourself thin across five different sub-specialties.",
    "hasExercise": true,
    "exerciseNumber": 8
  },
  {
    "number": 28,
    "partNumber": 9,
    "title": "Your First 30, 60 and 90 Days",
    "slug": "your-first-30-60-and-90-days",
    "subtitle": "The Realistic Foundational Milestone Framework",
    "readTimeMinutes": 9,
    "summary": "A structured, deliverable-driven framework: Days 1–30 (Understand), Days 31–60 (Explore), Days 61–90 (Choose & Build Evidence).",
    "hasExercise": true,
    "exerciseNumber": 9
  },
  {
    "number": 29,
    "partNumber": 10,
    "title": "Cybersecurity as a Way of Seeing",
    "slug": "cybersecurity-as-a-way-of-seeing",
    "subtitle": "The Five Questions of the Security Mindset & You Are Not Late",
    "readTimeMinutes": 8,
    "summary": "Cybersecurity changes how you perceive systems, assumptions, dependencies, and risk. Master the five fundamental questions of the security mindset.",
    "hasExercise": false
  }
];
