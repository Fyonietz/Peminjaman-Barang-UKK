// src/config/sidebar.ts
import {
  LayoutDashboard,
  Users,
  Wrench,
  FolderUser,
  Clock,
  List,
  UserCheck,
  FileCheck,
  RotateCcw,
  FileSpreadsheet,
  FolderTree,
  Boxes,
  Compass,
  ClipboardList
} from 'lucide-react';

export interface SidebarItem {
  label: string;
  path?: string;
  icon: any;
  roles?: ('Admin' | 'Petugas' | 'Peminjam')[];
  children?: SidebarItem[];
}

export const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['Admin', 'Petugas'],
  },
  {
    label: 'Users',
    icon: Users,
    roles: ['Admin'],
    children: [
      {
        label: 'Peminjam',
        path: '/dashboard/users/peminjam',
        icon: FolderUser,
        roles: ['Admin'],
      },
      {
        label: 'Petugas',
        path: '/dashboard/users/petugas',
        icon: UserCheck,
        roles: ['Admin'],
      },
    ],
  },
  {
    label: 'Barang',
    icon: Wrench,
    roles: ['Admin'],
    children: [
      {
        label: 'Kategori',
        path: '/dashboard/barang/kategori',
        icon: FolderTree,
        roles: ['Admin'],
      },
      {
        label: 'Daftar Barang',
        path: '/dashboard/barang',
        icon: List,
        roles: ['Admin'],
      },
      {
        label: 'Unit Barang',
        path: '/dashboard/barang/unit',
        icon: Boxes,
        roles: ['Admin'],
      },
    ],
  },
  {
    label: 'Katalog Alat',
    path: '/dashboard/katalog',
    icon: Compass,
    roles: ['Peminjam'],
  },
  {
    label: 'Peminjaman Saya',
    path: '/dashboard/peminjaman-saya',
    icon: ClipboardList,
    roles: ['Peminjam'],
  },
  {
    label: 'Persetujuan Peminjaman',
    path: '/dashboard/peminjaman',
    icon: FileCheck,
    roles: ['Petugas'],
  },
  {
    label: 'Pengembalian & Monitor',
    path: '/dashboard/pengembalian',
    icon: RotateCcw,
    roles: ['Petugas'],
  },
  {
    label: 'Cetak Laporan',
    path: '/dashboard/laporan',
    icon: FileSpreadsheet,
    roles: ['Petugas'],
  },
  {
    label: 'Log Aktivitas',
    path: '/dashboard/logs',
    icon: Clock,
    roles: ['Admin'],
  },
];
