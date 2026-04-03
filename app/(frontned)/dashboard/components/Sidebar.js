import Link from 'next/link';
import { Home, User, Settings, ShoppingBag, LogOut, Store, Users } from 'lucide-react'; // lucide-react install thakle bhalo, na hole normal text use koren

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: <Home size={20} />, href: '/dashboard' },
    { name: 'Profile', icon: <User size={20} />, href: '/profile' },
    { name: 'My Trades', icon: <ShoppingBag size={20} />, href: '/dashboard/trades' },
    { name: 'Settings', icon: <Settings size={20} />, href: '/dashboard/settings' },
    { name: 'Marketplace', icon: <Store size={20} />, href: '/profile/marketplace' },
    { name: 'Community', icon: <Users size={20} />, href: '/community' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
      <div className="p-6">
        <Link href="/">
          <h2 className="text-2xl font-bold text-blue-600">SkillBridge</h2>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium"
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;