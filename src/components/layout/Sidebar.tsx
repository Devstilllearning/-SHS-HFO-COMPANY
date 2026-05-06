import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/useNotifications';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Bell, 
  UserCircle, 
  Settings, 
  LogOut,
  ChevronRight,
  Home
} from 'lucide-react';
import { auth } from '../../firebase/config';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const { profile, isAdmin, isCEO } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error('Logout failed');
    }
  };

  const navItems = [
    { name: 'Public Home', path: '/', icon: Home, admin: false },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, admin: false },
    { name: 'My Meetings', path: '/dashboard/meetings', icon: Calendar, admin: false },
    { name: 'Team', path: '/team', icon: Users, admin: false },
    { name: 'Notifications', path: '/dashboard/notifications', icon: Bell, badge: unreadCount, admin: false },
    { name: 'Profile', path: '/dashboard/profile', icon: UserCircle, admin: false },
  ];

  if (isAdmin || isCEO) {
    navItems.push({ name: 'Admin Overview', path: '/admin', icon: LayoutDashboard, admin: true });
    navItems.push({ name: 'All Meetings', path: '/admin/meetings', icon: Calendar, admin: true });
    navItems.push({ name: 'User Management', path: '/admin/users', icon: Users, admin: true });
    navItems.push({ name: 'System Settings', path: '/admin/settings', icon: Settings, admin: true });
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-bg-dark flex flex-col justify-between py-8 px-6 text-white border-r border-brand-gold/20 z-50">
      <div className="space-y-10 overflow-y-auto hidden-scrollbar">
        <div className="flex items-center space-x-3 sticky top-0 bg-bg-dark z-10 pt-2 pb-4">
          <Link to="/" className="w-10 h-10 bg-gradient-to-br from-brand-gold to-brand-red rounded-[8px] flex items-center justify-center font-serif text-2xl font-bold text-white shadow-lg shadow-brand-gold/20 hover:scale-110 transition-transform">
            B
          </Link>
          <Link to="/">
            <h1 className="text-2xl font-serif tracking-tight text-brand-gold font-bold hover:opacity-80 transition-opacity">Berrionaire</h1>
          </Link>
        </div>

        <div className="space-y-8">
          <nav className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-4 mb-4">Personal</h3>
            {navItems.filter(i => !i.admin).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-[12px] transition-all group ${
                    isActive 
                      ? 'bg-white/10 text-brand-gold' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-gold' : 'text-white/40 group-hover:text-white'}`} />
                  <span className="font-medium flex-1">{item.name}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {(isAdmin || isCEO) && (
            <nav className="space-y-2 pb-10">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-purple px-4 mb-4">Administration</h3>
              {navItems.filter(i => i.admin).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-[12px] transition-all group ${
                      isActive 
                        ? 'bg-brand-purple/20 text-white border border-brand-purple/30' 
                        : 'text-white/60 hover:text-brand-purple'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-purple text-opacity-100' : 'text-white/40 group-hover:text-brand-purple text-opacity-70'}`} />
                    <span className={`font-medium flex-1 ${isActive ? 'font-bold' : ''}`}>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>

      <div className="p-4 bg-brand-purple/20 rounded-[16px] border border-brand-purple/30">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full border-2 border-brand-gold overflow-hidden bg-brand-purple flex items-center justify-center">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold">{profile?.name?.charAt(0) || 'B'}</span>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate text-white">{profile?.name || 'Member'}</p>
            <p className="text-[10px] uppercase tracking-widest text-brand-gold font-bold truncate">
              {profile?.role?.replace('_', ' ') || 'Strategic Partner'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full bg-brand-red py-2 rounded-[8px] text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
