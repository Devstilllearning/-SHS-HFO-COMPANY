import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/useNotifications';
import { LogIn, User, LayoutDashboard, Settings, Bell } from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, isCEO } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <nav className="sticky top-0 z-50 bg-bg-dark text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-110">
                <img 
                  src="/logo.png" 
                  alt="Berrionaire Logo" 
                  className="w-full h-full object-contain drop-shadow-md"
                  onError={(e) => {
                    // Fallback if logo.png is missing
                    e.currentTarget.src = 'https://api.iconify.design/noto:strawberry.svg';
                  }}
                />
              </div>
              <span className="text-2xl font-serif font-bold text-brand-gold tracking-tight">
                Berrionaire
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="hover:text-brand-gold transition-colors">Home</Link>
            <Link to="/about" className="hover:text-brand-gold transition-colors">About</Link>
            <Link to="/team" className="hover:text-brand-gold transition-colors">Team</Link>
            <Link to="/schedule" className="hover:text-brand-gold transition-colors">Schedule</Link>
            
            {user ? (
              <div className="flex items-center space-x-6">
                <Link to="/dashboard/notifications" className="relative text-white/80 hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-red text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-bg-dark">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <div className="flex items-center space-x-4 border-l border-white/10 pl-6">
                  <Link to="/dashboard" className="flex items-center space-x-1 bg-brand-purple/20 px-4 py-2 rounded-full border border-brand-purple/30 hover:bg-brand-purple/40 transition-all">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  {(isAdmin || isCEO) && (
                    <Link to="/admin" className="text-brand-gold hover:opacity-80 transition-opacity">
                      <Settings className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-2 border-2 border-brand-gold text-brand-gold px-6 py-2 rounded-[8px] hover:bg-brand-gold hover:text-bg-dark transition-all font-medium">
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
