import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 px-6">
      <div className="w-full max-w-3xl text-center space-y-8">

        {/* Hero Title */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Applicant Tracking
          <span className="text-purple-500 dark:text-purple-400"> System</span>
        </h1>

        {/* Subtitle */}
        <p className="text-purple-600 dark:text-purple-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          Made for <i>Human Resources</i> interviewer for managing applicants seamlessly.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-purple-900 hover:bg-purple-800 dark:bg-purple-100 dark:hover:bg-purple-200 text-white dark:text-purple-900 font-medium transition shadow-sm"
          >
            Get Started
          </Link>

          <Link
            to="/register"
            className="px-6 py-3 rounded-xl border border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-200 font-medium transition"
          >
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
}