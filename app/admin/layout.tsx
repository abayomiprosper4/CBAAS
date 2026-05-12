'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  BookOpen, 
  Users, 
  Dices, 
  Settings, 
  LogOut, 
  Shield 
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/auth/admin');
  };

  const baseNavItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { path: '/admin/lecturers', icon: Users, label: 'Lecturers' },
    { path: '/admin/allocations', icon: Dices, label: 'Allocations' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' }
  ];

  // Logic to inject the Admin Management link ONLY for Main Admins
  const navItems = user?.role === 'main_admin' 
    ? [
        ...baseNavItems.slice(0, 4), // Take Dashboard, Courses, Lecturers, Allocations
        { path: '/admin/manage-admins', icon: Shield, label: 'Manage Admins' }, // Injected link
        baseNavItems[4] // Settings
      ]
    : baseNavItems;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="offcanvas" variant="sidebar">
          <SidebarHeader>
            <div className="flex items-center gap-3 p-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 shadow-sm">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold text-slate-900 leading-none mb-1">Admin Panel</span>
                <span className="text-xs text-slate-500">Bells CAS</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === item.path}
                        tooltip={item.label}
                        className={pathname === item.path ? "data-[active=true]:bg-blue-600 data-[active=true]:text-white" : ""}
                      >
                        <Link href={item.path}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="flex flex-col gap-4 p-2">
              <Separator className="bg-slate-100" />
              <div className="flex items-center gap-3 px-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-sm font-medium">
                  {user?.fullName?.split(' ').map(n => n[0]).join('') || 'A'}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-medium text-slate-900 truncate">{user?.fullName || 'Admin'}</span>
                  <span className="text-xs text-slate-500 truncate">{user?.email}</span>
                </div>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                className="w-full justify-start border-slate-200 hover:bg-slate-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-slate-50">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600 lg:hidden" />
              <span className="font-semibold text-slate-900">Admin</span>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}