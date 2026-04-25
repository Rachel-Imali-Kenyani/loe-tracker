import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Clock, Bell, Settings, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'DASHBOARD', path: '/' },
  { icon: Clock, label: 'TIME LOGS', path: '/time-logs' },
  { icon: Bell, label: 'NOTIFICATIONS', path: '/notifications' }
];

export function Sidebar() {
  const { signOut, user, userId } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Unable to sign out', error);
    }
  };

  return (
    <aside className="w-[260px] bg-surface-container border-r border-outline-variant h-screen flex flex-col fixed top-0 left-0 z-10">
      <div className="p-6 border-b border-outline-variant">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center"></div>
          <div>
            <h1 className="text-xl text-primary m-0 tracking-tight font-bold">LoE Tracker</h1>
          </div>
        </div>
      </div>

      <div className="py-6 flex-1 overflow-y-auto">
        <h2 className="px-6 text-[0.7rem] text-on-surface-variant tracking-widest mb-4 font-bold uppercase">MAIN MENU</h2>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `group flex items-center gap-4 py-3 px-6 text-sm font-semibold transition-all border-l-[3px] ${isActive ? 'active text-primary bg-primary/10 border-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}
            >
              <item.icon className="transition-opacity opacity-70 group-hover:opacity-100 group-[.active]:opacity-100" size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-outline-variant space-y-4">
        <div className="rounded-2xl border border-outline-variant bg-surface-variant/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserRound size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-on-surface">{user?.email ?? 'Signed in'}</p>
              <p className="truncate text-xs text-on-surface-variant">{userId ?? 'No user id'}</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <NavLink 
            to="/settings" 
            className={({ isActive }) => `group flex items-center gap-4 py-3 px-6 text-sm font-semibold transition-all border-l-[3px] ${isActive ? 'active text-primary bg-primary/10 border-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}
          >
            <Settings className="transition-opacity opacity-70 group-hover:opacity-100 group-[.active]:opacity-100" size={20} />
            <span>SETTINGS</span>
          </NavLink>
        </nav>

        <button
          type="button"
          className="flex w-full items-center gap-4 rounded-xl px-6 py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface"
          onClick={handleSignOut}
        >
          <LogOut size={20} />
          <span>SIGN OUT</span>
        </button>
      </div>
    </aside>
  );
}
