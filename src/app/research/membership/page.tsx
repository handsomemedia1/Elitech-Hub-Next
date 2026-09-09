import Link from 'next/link';

export const metadata = {
  title: 'Research Membership | Elitech Hub',
  description: 'Join the Elitech Hub Research Membership. Limited to 30 researchers globally. Applications open for Jan 2027.',
};

export default function ResearchMembershipPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-primary text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Research Membership</h1>
          <p className="text-xl md:text-2xl mb-8">
            An exclusive ecosystem for pioneering researchers in Behavioral Cybersecurity.
          </p>
          <div className="inline-block bg-white text-primary font-bold py-2 px-4 rounded-full mb-8">
            Coming January 2027
          </div>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            We are accepting early applications for our inaugural cohort. 
            Limited to exactly <strong>30 researchers</strong> globally.
          </p>
          <Link
            href="/research/membership/apply"
            className="inline-block bg-secondary text-white font-bold py-3 px-8 rounded hover:bg-secondary/90 transition-colors"
          >
            Apply Now
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Membership Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-primary">Collaborative Ecosystem</h3>
              <p className="text-gray-600">
                Connect with a curated group of 30 top-tier researchers. Share data, co-author papers, and tackle the most pressing behavioral cybersecurity challenges together.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-primary">Exclusive Resources</h3>
              <p className="text-gray-600">
                Gain access to proprietary datasets, specialized analytical tools, and early-stage findings from Elitech Hub's internal research initiatives.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-primary">Global Visibility</h3>
              <p className="text-gray-600">
                Amplify your work through Elitech Hub's platform. Feature your research in our publications and present at our exclusive symposiums.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrity Policies */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Commitment to Integrity</h2>
          <div className="prose prose-lg mx-auto text-gray-700">
            <p className="mb-6">
              Elitech Hub maintains the highest standards of research integrity, ethics, and transparency. As a member of this exclusive cohort, you agree to abide by our core principles:
            </p>
            <ul className="list-disc pl-6 space-y-4 mb-8">
              <li>
                <strong>Ethical Data Usage:</strong> All research must respect user privacy, comply with global data protection regulations, and ensure informed consent where applicable.
              </li>
              <li>
                <strong>Rigorous Methodology:</strong> We champion reproducible research. Members are expected to share their methodologies transparently with the cohort.
              </li>
              <li>
                <strong>Constructive Collaboration:</strong> Foster a supportive environment. Critique ideas, not individuals, and actively contribute to the growth of fellow members.
              </li>
              <li>
                <strong>Conflict of Interest Transparency:</strong> Any potential conflicts of interest must be disclosed promptly and fully.
              </li>
            </ul>
            <p>
              By applying for the Elitech Hub Research Membership, you acknowledge these principles and commit to upholding them throughout your tenure.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gray-900 text-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to Join the Cohort?</h2>
          <p className="text-lg mb-8 text-gray-300">
            Submit your application today. We are reviewing candidates on a rolling basis for the January 2027 launch.
          </p>
          <Link
            href="/research/membership/apply"
            className="inline-block bg-primary text-white font-bold py-3 px-8 rounded hover:bg-primary/90 transition-colors"
          >
            Submit Application
          </Link>
        </div>
      </section>
    </div>
  );
}
