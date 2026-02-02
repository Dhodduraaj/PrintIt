import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#4F1C51] border-t border-[#2E1A4D] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Branding / About */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-lg font-semibold text-white tracking-wide mb-2">
              🖨️ PrintFlow
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed">
              Simplifying Print Jobs for Students & Vendors
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Upload documents, join a virtual queue, and track your prints in real-time—no more waiting.
            </p>
          </div>

          {/* Legal / Policies */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Legal
            </h4>
            <ul className="space-y-1.5">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition text-sm">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact / Social */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Contact
            </h4>
            <a
              href="mailto:support@printflow.com"
              className="text-gray-300 hover:text-white transition text-sm block mb-3"
            >
              support@printflow.com
            </a>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Twitter"
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.067-.06-1.407-.06-4.123v-.08c0-2.643.012-2.987.06-4.043.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm0 2.225h-.63c-2.098.007-2.437.025-3.465.075-.1.007-.2.015-.3.022-.962.09-1.609.25-2.212.54a3.006 3.006 0 00-1.045.824 3.006 3.006 0 00-.54 2.213c-.05 1.023-.068 1.366-.075 3.464l.005.63c.007 2.098.025 2.437.075 3.465.09.96.25 1.609.54 2.212.24.47.53.863.824 1.044.603.29 1.25.45 2.213.54 1.023.05 1.366.068 3.464.075l.63-.005c2.098-.007 2.437-.025 3.465-.075.96-.09 1.609-.25 2.212-.54.47-.24.863-.53 1.044-.824.29-.603.45-1.25.54-2.213.05-1.023.068-1.366.075-3.464l-.005-.63c-.007-2.098-.025-2.437-.075-3.465-.09-.96-.25-1.609-.54-2.212a3.006 3.006 0 00-.824-1.044 3.006 3.006 0 00-2.213-.54c-1.023-.05-1.366-.068-3.464-.075zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm5.338-9.87a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-4 border-t border-[#2E1A4D]">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} PrintFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
