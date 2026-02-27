import Image from "next/image";

export default function AboutPage() {
  return (
    <div className=" min-h-screen">

      {/* Hero Section */}
      <section className="text-center py-20 bg-white">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          About <span className="text-blue-600">SkillBridge</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-gray-600 text-lg">
          SkillBridge is a modern platform designed to connect learners with
          valuable skills, expert mentors, and real-world opportunities.
        </p>
      </section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        
        <div>
          <h2 className="text-3xl font-bold  mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Our mission is to bridge the gap between learning and practical
            application. We empower students, professionals, and creators to
            grow their skills through structured learning and real-world
            collaboration.
          </p>

          <ul className="mt-6 space-y-3 text-gray-700">
            <li>✔️ Skill-based learning</li>
            <li>✔️ Expert guidance</li>
            <li>✔️ Community collaboration</li>
            <li>✔️ Real project experience</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Image
            src="/logo/logo.png"
            alt="SkillBridge"
            width={250}
            height={250}
            className="rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* Vision Section */}
      <section className="max-w-6xl mx-auto rounded-2xl bg-blue-600 text-white py-16 text-center px-6">
        <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
        <p className="max-w-3xl mx-auto text-lg">
          We envision a world where everyone has access to high-quality skill
          development resources and opportunities to grow, innovate, and
          succeed.
        </p>
      </section>

      {/* Footer CTA */}
      <section className="py-16 text-center ">
        <h2 className="text-3xl font-bold text-gray-800">
          Join SkillBridge Today 🚀
        </h2>
        <p className="mt-4 text-gray-600">
          Start your journey towards skill mastery and career growth.
        </p>
        <button className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
          Get Started
        </button>
      </section>

    </div>
  );
}