// src/layouts/DashboardLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import '../../index.css';
import Sidebar from '../Sidebar'; // Adjust path if your Sidebar is located elsewhere

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Sidebar Component injected here */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Header (Visible only on small screens to trigger the sidebar) */}
        <header className="lg:hidden flex items-center h-16 px-4 border-b bg-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 mr-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-semibold">CampGear</span>
        </header>

        {/* Dashboard Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
