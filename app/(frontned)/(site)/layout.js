import Footer from '@/app/components/home/Footer';
import Navbar from '@/app/components/home/Navbar';
import React from 'react';



export default function SiteLayout({ children }) {
  return (
    <section className="min-h-screen bg-white">
      <Navbar />
      <main>
        {children}
      </main>
      <Footer></Footer>
    </section>
  );
}