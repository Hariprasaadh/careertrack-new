import Link from "next/link";
import { Github, Linkedin, Twitter, Mail, Code, LineChart, VideoIcon, FileCode2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-indigo-900 text-blue-100 mt-20 rounded-t-3xl shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Wave Design */}
        <div className="relative -top-28 h-16 overflow-hidden">
          <svg className="absolute bottom-0 w-full h-16" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              fill="currentColor"
              d="M0,120 C320,20 420,120 640,60 C780,20 960,60 1080,90 C1320,160 1440,30 1440,120 V120 H0 V120 Z"
              className="text-blue-100 opacity-20"
            ></path>
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                <LineChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                CareerTrack
              </h3>
            </div>
            <p className="text-blue-200">
              Empowering your career journey with AI-driven tools and insights.
            </p>
            <div className="flex space-x-4 pt-2">
              <Link href="https://twitter.com" className="text-blue-300 hover:text-cyan-300 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="https://linkedin.com" className="text-blue-300 hover:text-cyan-300 transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="mailto:contact@careertrack.com" className="text-blue-300 hover:text-cyan-300 transition-colors">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-white flex items-center">
              <Code className="w-5 h-5 mr-2 text-cyan-300" />
              Our Products
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/ats-analyzer"
                  className="flex items-center group"
                >
                  <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-cyan-600 transition-colors">
                    <FileCode2 className="w-4 h-4 text-blue-200" />
                  </div>
                  <span className="text-blue-200 group-hover:text-cyan-300 transition-colors">ATS Analyzer</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/ai-interview"
                  className="flex items-center group"
                >
                  <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-cyan-600 transition-colors">
                    <VideoIcon className="w-4 h-4 text-blue-200" />
                  </div>
                  <span className="text-blue-200 group-hover:text-cyan-300 transition-colors">AI Interviews</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/quiz-generator"
                  className="flex items-center group"
                >
                  <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-cyan-600 transition-colors">
                    <Code className="w-4 h-4 text-blue-200" />
                  </div>
                  <span className="text-blue-200 group-hover:text-cyan-300 transition-colors">Quiz Generator</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/coding-portfolio"
                  className="flex items-center group"
                >
                  <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-cyan-600 transition-colors">
                    <LineChart className="w-4 h-4 text-blue-200" />
                  </div>
                  <span className="text-blue-200 group-hover:text-cyan-300 transition-colors">Coding Portfolio</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Column */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-white flex items-center">
              <Github className="w-5 h-5 mr-2 text-cyan-300" />
              Connect With Us
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="https://github.com/careertrack-edutech/careertrack"
                  className="flex items-center group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-cyan-600 transition-colors">
                    <Github className="w-4 h-4 text-blue-200" />
                  </div>
                  <span className="text-blue-200 group-hover:text-cyan-300 transition-colors">GitHub Repo</span>
                </Link>
              </li>
              <li>
                <Link
                  href="https://devfolio.co/projects/careertrack"
                  className="flex items-center group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-cyan-600 transition-colors">
                    <Code className="w-4 h-4 text-blue-200" />
                  </div>
                  <span className="text-blue-200 group-hover:text-cyan-300 transition-colors">Devfolio</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-blue-800/50">
          <div className="max-w-md mx-auto">
            <h5 className="text-lg font-medium text-white text-center mb-4">Stay updated with our latest features</h5>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-grow px-4 py-2 bg-blue-800/50 text-blue-100 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-4 py-2 rounded-r-lg transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-blue-800/50 text-center text-sm text-blue-300">
          <p>
            © {new Date().getFullYear()} CareerTrack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}