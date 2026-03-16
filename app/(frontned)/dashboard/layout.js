import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AuthGuard from './components/AuthGuard';

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        {/* Sidebar - Fixed on Left */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="md:ml-64 flex flex-col min-h-screen">
          {/* Topbar - Fixed on Top */}
          <Topbar />

          {/* Content Wrapper */}
          <main className="flex-1 mt-16 p-6">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}