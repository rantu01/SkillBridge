import React from 'react';

const Stats = () => {
    const statData = [
        { label: "STUDENTS", value: "12k+" },
        { label: "CREDITS", value: "45k" },
        { label: "RESPONSE", value: "24h" },
        { label: "SKILLS", value: "150+" },
    ];

    return (
        <section className="w-full px-6 py-12">
            <div className="max-w-6xl mx-auto bg-[#2563EB] rounded-[40px] py-12 md:py-16 shadow-2xl shadow-blue-200">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4 divide-white/10">
                    {statData.map((stat, index) => (
                        <div key={index} className="flex flex-col items-center justify-center text-center">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                                {stat.value}
                            </h2>
                            <p className="text-blue-100 text-xs md:text-sm font-bold tracking-[0.2em] uppercase">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;