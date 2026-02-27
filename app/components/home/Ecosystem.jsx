import React from 'react';

const Ecosystem = () => {
    const features = [
        {
            title: "Monetize Your Talent",
            icon: (
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                </div>
            ),
            image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80", // Placeholder laptop image
            points: [
                "Earn credits for every hour of tutoring or service provided.",
                "Build a verified portfolio of work to show recruiters.",
                "Gain endorsement badges from campus departments."
            ]
        },
        {
            title: "Master Your Degree",
            icon: (
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                </div>
            ),
            image: "https://img.freepik.com/free-vector/hand-drawn-flat-design-group-people-working-together_23-2149156061.jpg", // Illustration style
            points: [
                "Get help with specific course codes and lab assignments.",
                "Quick turnaround for design, writing, or coding tasks.",
                "Secure exchanges backed by university email verification."
            ]
        }
    ];

    return (
        <section className="py-20 px-6 bg-white">
            <div className="max-w-6xl mx-auto text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-4">
                    The Exchange Ecosystem
                </h2>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                    A specialized network where knowledge is the currency and growth is the shared goal.
                </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((card, index) => (
                    <div key={index} className="bg-[#F8FAFC] border border-gray-100 rounded-[40px] p-8 md:p-10 transition-transform hover:scale-[1.01]">
                        <div className="flex items-center gap-4 mb-8">
                            {card.icon}
                            <h3 className="text-2xl font-bold text-[#1E293B]">{card.title}</h3>
                        </div>

                        <div className="rounded-2xl overflow-hidden mb-8 h-64 shadow-sm">
                            <img 
                                src={card.image} 
                                alt={card.title} 
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <ul className="space-y-4">
                            {card.points.map((point, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="mt-1 flex-shrink-0">
                                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </span>
                                    <span className="text-gray-600 font-medium">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Ecosystem;