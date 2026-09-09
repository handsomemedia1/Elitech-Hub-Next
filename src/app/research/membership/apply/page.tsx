'use client';

import { useActionState } from 'react';
import { submitApplication } from './actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const initialState = {
  success: false,
  message: '',
};

export default function ApplicationFormPage() {
  const [state, formAction, isPending] = useActionState(submitApplication, initialState);

  if (state.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-lg shadow-sm border border-gray-100 max-w-2xl w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-primary">Application Received</h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for applying to the Elitech Hub Research Membership. 
            We will review your application and be in touch before the January 2027 launch.
          </p>
          <Link
            href="/research/membership"
            className="inline-block bg-primary text-white font-bold py-3 px-8 rounded hover:bg-primary/90 transition-colors"
          >
            Return to Overview
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/research/membership" className="inline-flex items-center text-primary hover:underline font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Membership Overview
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-2 text-primary">Research Membership Application</h1>
          <p className="text-gray-600 mb-8 pb-8 border-b">
            Please provide your details below to apply for the inaugural January 2027 cohort. 
            The cohort is strictly limited to 30 researchers.
          </p>

          {state.message && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded border border-red-100">
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country of Residence
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
              </div>
            </div>

            {/* Professional Background */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800 pt-4 border-t">Professional Background</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="professional_title" className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Title / Role
                  </label>
                  <input
                    type="text"
                    id="professional_title"
                    name="professional_title"
                    placeholder="e.g. Principal Researcher, Postdoc"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
                    Institution / Organization
                  </label>
                  <input
                    type="text"
                    id="institution"
                    name="institution"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Specialization
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    placeholder="e.g. Behavioral Cybersecurity"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
              </div>
            </div>

            {/* Online Profiles */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800 pt-4 border-t">Online Profiles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="orcid" className="block text-sm font-medium text-gray-700 mb-1">
                    ORCID
                  </label>
                  <input
                    type="text"
                    id="orcid"
                    name="orcid"
                    placeholder="0000-0000-0000-0000"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="google_scholar_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Google Scholar URL
                  </label>
                  <input
                    type="url"
                    id="google_scholar_url"
                    name="google_scholar_url"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    id="linkedin_url"
                    name="linkedin_url"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Personal Website URL
                  </label>
                  <input
                    type="url"
                    id="website_url"
                    name="website_url"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
              </div>
            </div>

            {/* Research Details */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800 pt-4 border-t">Research Details</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="research_interests" className="block text-sm font-medium text-gray-700 mb-1">
                    Research Interests (comma separated)
                  </label>
                  <input
                    type="text"
                    id="research_interests"
                    name="research_interests"
                    placeholder="e.g. Usable Security, Social Engineering, Phishing"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="research_background" className="block text-sm font-medium text-gray-700 mb-1">
                    Research Background Summary
                  </label>
                  <textarea
                    id="research_background"
                    name="research_background"
                    rows={4}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="publications" className="block text-sm font-medium text-gray-700 mb-1">
                    Key Publications (Top 3-5)
                  </label>
                  <textarea
                    id="publications"
                    name="publications"
                    rows={4}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="current_projects" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Projects
                  </label>
                  <textarea
                    id="current_projects"
                    name="current_projects"
                    rows={3}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
              </div>
            </div>

            {/* Motivation & Expectations */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800 pt-4 border-t">Motivation & Expectations</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-1">
                    Why do you want to join the Elitech Hub Research Membership?
                  </label>
                  <textarea
                    id="motivation"
                    name="motivation"
                    rows={4}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="contribution" className="block text-sm font-medium text-gray-700 mb-1">
                    How do you plan to contribute to the cohort?
                  </label>
                  <textarea
                    id="contribution"
                    name="contribution"
                    rows={4}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
                <div>
                  <label htmlFor="expectations" className="block text-sm font-medium text-gray-700 mb-1">
                    What are your expectations from this membership?
                  </label>
                  <textarea
                    id="expectations"
                    name="expectations"
                    rows={4}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={isPending}
                className="w-full md:w-auto bg-primary text-white font-bold py-3 px-8 rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
