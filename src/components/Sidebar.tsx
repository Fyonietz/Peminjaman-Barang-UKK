 // src/components/Sidebar.tsx
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, X } from 'lucide-react';
import { sidebarItems, type SidebarItem } from '../config/sidebar';
import { cn } from '../lib/utils';
import '../index.css';

interface SidebarProps {
  onClose?: () => void;
  open?: boolean;
}

function SidebarLink({ item, nested = false, onClose }: { item: SidebarItem; nested?: boolean; onClose?: () => void }) {
  return (
    <NavLink
      to={item.path || '#'}
      end
      onClick={onClose}
      // NavLink automatically applies the 'active' class when the route matches
      className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
      style={nested ? { paddingLeft: '3.5rem' } : {}}
    >
      <span className="icon">
        <item.icon size={20} />
      </span>
      {item.label}
    </NavLink>
  );
}

function SidebarGroup({ item, onClose }: { item: SidebarItem; onClose?: () => void }) {
  const location = useLocation();
  const hasActiveChild = item.children?.some((c) => c.path === location.pathname);
  const [open, setOpen] = useState(!!hasActiveChild);

  return (
    <div>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`nav-button ${hasActiveChild ? 'active' : ''}`}
      >
        <span className="icon">
          <item.icon size={20} />
        </span>
        <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
        <ChevronDown
          size={16}
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>
      {open && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {item.children!.map((child, index) => (
            <SidebarLink key={child.label || child.path || index} item={child} nested onClose={onClose} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ onClose, open }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    navigate('/login', { replace: true });
  };

  // This core content strictly uses the .sidebar and .nav-button classes from index.css
  const SidebarContent = (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="avatar-placeholder">
          {/* Default SVG avatar to match the mockup */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h1>Admin Panel</h1>

        {/* Mobile close button inside the header */}
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

      <nav className="nav-menu">
        {sidebarItems.map((item, index) =>
          item.children ? (
            <SidebarGroup key={item.label || index} item={item} onClose={onClose} />
          ) : (
            <SidebarLink key={item.label || item.path || index} item={item} onClose={onClose} />
          )
        )}
      </nav>

      <button onClick={() => { handleLogout(); onClose?.(); }} className="logout-button">
        <span className="icon"><LogOut size={20} /></span>
        Logout
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <div className="relative z-50 h-full">
            {SidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar (hidden on small screens via Tailwind) */}
      <div className="hidden lg:block h-full">
        {SidebarContent}
      </div>
    </>
  );
}
