// src/config/sidebar.ts
import {
  LayoutDashboard,
  Users,
  Wrench,
  FolderUser,
  Save,
  CornerDownLeft,
  Clock,
  Settings, // Imported extra icons for the children
  Shield,
  FileText,
  List,
ChartBarStacked,
ShelvingUnit,
UserShield,
Folder
} from 'lucide-react';

export interface SidebarItem {
  label: string;
  path?: string;
  icon: any; // Using 'any' or 'LucideIcon' depending on your setup
  children?: SidebarItem[];
}

export const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Users',
    icon: Users,
    children:[
      {
        label : 'Peminjam',
        path:'/dashboard/users/peminjam',
        icon:FolderUser
      },
      {
        label : 'Petugas',
        path:'/dashboard/users/petugas',
        icon:UserShield
      }
    ]
  },
  {
    label: 'Barang',
    icon: Wrench, // Notice we removed the 'path' here since it's now a parent toggle
    children: [
      {
        label: 'Kategori',
        path: '/dashboard/barang/kategori',
        icon: ChartBarStacked,
      },
      {
        label: 'Daftar Barang',
        path: '/dashboard/barang/',
        icon: List,
      },
      {
        label: 'Unit Barang',
        path: '/dashboard/barang/unit',
        icon: ShelvingUnit,
      }
    ]
  },
];
