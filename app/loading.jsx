"use client";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      
      <div className="relative flex items-center justify-center">
        
        {/* Spinner */}
        <div className="absolute w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

        {/* Logo */}
        <Image
          src="/logo/logo-removebg.png"
          alt="SkillBridge Logo"
          width={60}
          height={60}
          className="rounded-full"
        />
      </div>

      <h1 className="mt-6 text-2xl font-bold text-gray-800">
        SkillBridge
      </h1>
    </div>
  );
}