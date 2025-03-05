import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CareerTrack
            </h3>
            <p className="text-sm">
              Empowering your career journey with AI-driven tools and insights.
            </p>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/ats-analyzer"
                  className="hover:text-blue-400 transition-colors"
                >
                  ATS Analyzer
                </Link>
              </li>
              <li>
                <Link
                  href="/ai-interview"
                  className="hover:text-blue-400 transition-colors"
                >
                  AI Interviews
                </Link>
              </li>
              <li>
                <Link
                  href="/quiz-generator"
                  className="hover:text-blue-400 transition-colors"
                >
                  Quiz Generator
                </Link>
              </li>
              <li>
                <Link
                  href="/coding-portfolio"
                  className="hover:text-blue-400 transition-colors"
                >
                  Coding Portfolio
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Column */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white">GitHub and Devfolio</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://github.com/careertrack-edutech/careertrack"
                  className="hover:text-blue-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Git Repo
                </Link>
              </li>
              <li>
                <Link
                  href="https://devfolio.co/projects/careertrack"
                  className="hover:text-blue-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Devfolio
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>
            © {new Date().getFullYear()} CareerTrack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
