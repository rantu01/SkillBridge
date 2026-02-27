import Link from 'next/link';
import React from 'react';

const Navbar = () => {
    return (

        <div className='w-full px-8 bg-[#fcf7f7] border-b border-gray-100 shadow-sm'>

            <nav className="max-w-6xl mx-auto flex items-center justify-between ">
                {/* Left Side: Logo */}
                <Link href="/"><div className="flex items-center gap-2 cursor-pointer">

                    <div className="">
                        <img
                            src="/logo/logo-removebg.png"
                            alt="SkillBridge Logo"
                            className="h-22 w-22 object-contain"
                        />
                    </div>
                </div></Link>


                {/* Center: Navigation Links */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="HowItWorks" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">How it Works</a>
                    <a href="/about" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">About </a>
                    <a href="SafetyRules" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Safety Rules</a>
                </div>

                {/* Right Side: Auth Buttons */}
                <div className="flex items-center gap-6">
                    <button className="text-sm font-semibold text-gray-600 hover:text-gray-900">Login</button>
                    <button className="bg-[#2563EB] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
                        Get Started
                    </button>
                </div>
            </nav>
        </div>

    );
};

export default Navbar;