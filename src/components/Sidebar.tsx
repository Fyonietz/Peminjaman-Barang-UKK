// src/components/Sidebar.tsx
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, X } from 'lucide-react';
import { sidebarItems, type SidebarItem } from '../config/sidebar';

interface SidebarProps {
  onClose?: () => void;
  open?: boolean;
}

export default function Sidebar({ onClose, open }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Read current user role from localStorage session
  const sessionData = localStorage.getItem('campgear');
  const userRole = sessionData ? JSON.parse(sessionData)?.user?.role : null;
  const userName = sessionData ? JSON.parse(sessionData)?.user?.nama : 'CampGear';

  const handleLogout = () => {
    localStorage.removeItem('campgear');
    navigate('/login', { replace: true });
  };

  // Filter top-level items by role
  const filteredItems = sidebarItems.filter((item) => {
    if (!item.roles) return true;
    return userRole && item.roles.includes(userRole as any);
  });

  const SidebarContent = (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="avatar-placeholder">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div>
          <h1 className="text-base font-bold text-white">{userRole === 'Petugas' ? 'Petugas Panel' : 'Admin Panel'}</h1>
          <p className="text-xs text-[#a0c2a6] font-medium">{userName}</p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden"
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#a0c2a6', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        {filteredItems.map((item, index) => {
          if (item.children) {
            const visibleChildren = item.children.filter(
              (child) => !child.roles || (userRole && child.roles.includes(userRole as any))
            );
            if (visibleChildren.length === 0) return null;

            const hasActiveChild = visibleChildren.some((c) => c.path === location.pathname);

            return (
              <SidebarGroupKey
                key={item.label || index}
                item={{ ...item, children: visibleChildren }}
                hasActiveChild={hasActiveChild}
                onClose={onClose}
              />
            );
          }

          return (
            <NavLink
              key={item.label || item.path || index}
              to={item.path || '#'}
              end
              onClick={onClose}
              className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
            >
              <span className="icon">
                <item.icon size={20} />
              </span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <button onClick={() => { handleLogout(); onClose?.(); }} className="logout-button">
        <span className="icon"><LogOut size={20} /></span>
        Logout
      </button>
    </div>
  );

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <div className="relative z-50 h-full">{SidebarContent}</div>
        </div>
      )}

      <div className="hidden lg:block h-full">{SidebarContent}</div>
    </>
  );
}

function SidebarGroupKey({ item, hasActiveChild, onClose }: { item: SidebarItem; hasActiveChild: boolean; onClose?: () => void }) {
  const [open, setOpen] = useState(hasActiveChild);

  return (
    <div>
      <button onClick={() => setOpen((prev) => !prev)} className={`nav-button ${hasActiveChild ? 'active' : ''}`}>
        <span className="icon">
          <item.icon size={20} />
        </span>
        <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
        <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      {open && (
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {item.children?.map((child, index) => (
            <NavLink
              key={child.label || child.path || index}
              to={child.path || '#'}
              end
              onClick={onClose}
              className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
              style={{ paddingLeft: '3.2rem' }}
            >
              <span className="icon">
                <child.icon size={18} />
              </span>
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
