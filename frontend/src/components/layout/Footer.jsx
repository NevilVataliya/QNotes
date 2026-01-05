import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'

function Footer() {
  return (
    <footer className="bg-surface-900 text-surface-100 py-12 mt-12 border-t border-surface-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo width="100px" />
            <p className="text-sm text-surface-300">
              Transform your thoughts into organized notes with AI-powered transcription and smart organization.
            </p>
            <p className="text-xs text-surface-400">
              © 2025 QNotes. All rights reserved.
            </p>
            <p className="text-xs text-surface-400">
              Made with ♥ in India
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-primary-300">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-surface-300 hover:text-surface-50 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-surface-300 hover:text-surface-50 transition-colors">
                  Blog/Updates
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm text-surface-300 hover:text-surface-50 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-sm text-surface-300 hover:text-surface-50 transition-colors">
                  Press/Media
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-surface-300 hover:text-surface-50 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-primary-300">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-sm text-surface-300 hover:text-surface-50 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/api" className="text-sm text-surface-300 hover:text-surface-50 transition-colors">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-surface-300 hover:text-surface-50 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-surface-300 hover:text-surface-50 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-surface-300 hover:text-surface-50 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-primary-300">Connect</h3>
            <div className="space-y-3">
              <a
                href="https://github.com/NevilVataliya/QNotes"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-surface-50 hover:text-surface-50 transition-colors"
                aria-label="View QNotes source code on GitHub"
                title="View source code on GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                <span className="text-sm font-medium">GitHub</span>
                <span className="text-xs text-primary-300">(Source code)</span>
              </a>

              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-surface-300 opacity-60"
                  tabIndex={-1}
                  title="Coming soon"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-surface-300 opacity-60"
                  tabIndex={-1}
                  title="Coming soon"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="space-y-2 w-full">
              <h4 className="text-sm font-medium">Stay Updated</h4>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-surface-800 text-surface-50 placeholder:text-surface-400 rounded-lg sm:rounded-l-lg sm:rounded-r-none border border-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 min-w-0"
                />
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg sm:rounded-l-none sm:rounded-r-lg hover:bg-primary-700 whitespace-nowrap transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer