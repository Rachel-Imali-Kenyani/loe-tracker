import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Clock } from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { icon: LayoutDashboard, label: 'DASHBOARD', path: '/' },
  { icon: Clock, label: 'TIME LOGS', path: '/time-logs' }
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon"></div>
          <div>
            <h1>LoE Tracker</h1>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <h2 className="section-title">MAIN MENU</h2>
        <nav className="nav-menu">
          {navItems.map((item) => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
              <item.icon className="nav-icon" size={20} />
                  <span>{item.label}</span>
                </NavLink>
          ))}
          </nav>
        </div>
    </aside>
  );
}
