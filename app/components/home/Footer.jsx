import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#fcf7f7] border-t border-gray-100 pt-16 pb-8 px-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        {/* Logo & Description */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#EEF2FF] p-1.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#1E293B]">SkillBridge</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Empowering the next generation of professionals through peer-to-peer knowledge sharing and service exchange within university networks.
          </p>
        </div>

        {/* Platform Links */}
        <div>
          <h4 className="font-bold text-gray-900 mb-6 tracking-wider text-xs uppercase">Platform</h4>
          <ul className="space-y-4">
            <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Marketplace</a></li>
            <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Leaderboard</a></li>
            <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Credits</a></li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h4 className="font-bold text-gray-900 mb-6 tracking-wider text-xs uppercase">Support</h4>
          <ul className="space-y-4">
            <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Rules</a></li>
            <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Safety</a></li>
            <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Help Center</a></li>
          </ul>
        </div>

        {/* Connect / Social */}
        <div>
          <h4 className="font-bold text-gray-900 mb-6 tracking-wider text-xs uppercase">Connect</h4>
          <div className="flex gap-4">
            <div className="p-2.5 bg-[#F8FAFC] rounded-full text-gray-400 hover:text-blue-600 cursor-pointer transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div className="p-2.5 bg-[#F8FAFC] rounded-full text-gray-400 hover:text-blue-600 cursor-pointer transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-6xl mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-400 text-xs">
          © 2024 University Service Exchange Platform. All rights reserved.
        </p>
        <div className="flex gap-8">
          <a href="#" className="text-gray-400 hover:text-gray-900 text-xs transition-colors">Privacy Policy</a>
          <a href="#" className="text-gray-400 hover:text-gray-900 text-xs transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;