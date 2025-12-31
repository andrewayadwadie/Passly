import React from 'react';
import { useAuth } from '../AuthContext';
import { LogOut, Shield } from 'lucide-react';

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 h-16 flex items-center px-6 justify-between">
      <div className="flex items-center gap-2">
        <Shield className="text-primary-glow w-6 h-6 animate-pulse" />
        <span className="text-xl font-bold bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent">
          Passly
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white/60 text-sm">Hi, {user.username}</span>
        <button 
          onClick={logout}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
