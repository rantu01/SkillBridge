import { Bell, Search } from 'lucide-react';

const AdminTopbar = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 md:left-64 z-10 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-gray-800">Admin User</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold">A</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;