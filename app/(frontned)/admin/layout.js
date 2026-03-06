import AdminSidebar from './components/AdminSidebar';
import AdminTopbar from './components/AdminTopbar';
import AuthGuard from '../dashboard/components/AuthGuard';

export default function AdminLayout({ children }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Sidebar - Fixed on Left */}
        <AdminSidebar />

        {/* Main Content Area */}
        <div className="md:ml-64 flex flex-col min-h-screen">
          {/* Topbar - Fixed on Top */}
          <AdminTopbar />

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