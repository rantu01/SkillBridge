import Footer from "@/app/components/home/Footer";
import ProfileTopbar from "./components/ProfileTopbar";

export default function ProfileLayout({ children }) {
    return (
        <div className="min-h-screen    ">
            {/* Custom Profile Topbar */}
            <ProfileTopbar />

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-12 min-h-[calc(60vh)]" >
                {/* Profile Content (Form, Settings, etc.) */}
                <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 p-6 md:p-10">
                    {children}
                </div>

            </main>
            <Footer></Footer>
        </div>
    );
}