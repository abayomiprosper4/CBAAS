'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home,
  User,
  Settings,
  LogOut,
  GraduationCap
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

export default function LecturerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/auth/lecturer');
  };

  const navItems = [
    { path: '/lecturer', icon: Home, label: 'Dashboard' },
    { path: '/lecturer/profile', icon: User, label: 'Profile' },
    { path: '/lecturer/preferences', icon: Settings, label: 'Preferences' },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" variant="sidebar" className="border-r border-slate-200">
        <SidebarHeader className="border-b border-slate-50">
          <div className="flex items-center gap-3 p-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bells-green shadow-sm">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold text-bells-dark-blue leading-none mb-1">Lecturer Portal</span>
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
                      className={pathname === item.path 
                        ? "data-[active=true]:bg-bells-green data-[active=true]:text-white hover:bg-bells-green hover:text-white" 
                        : "text-slate-600 hover:bg-bells-green/10 hover:text-bells-green"
                      }
                    >
                      <Link href={item.path}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-slate-50">
          <div className="flex flex-col gap-4 p-2">
            <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bells-gold text-white text-sm font-medium">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'L'}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium text-slate-900 truncate">{user?.name || 'Lecturer'}</span>
                <span className="text-xs text-slate-500 truncate">{user?.email}</span>
              </div>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="w-full justify-start border-slate-200 hover:bg-slate-50 hover:text-red-600 transition-colors group-data-[collapsible=icon]:px-2"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-slate-50 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-md px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-bells-dark-blue">
              {navItems.find(item => item.path === pathname)?.label || 'Lecturer'}
            </span>
          </div>
        </header>
        
        {/* Main Page Content */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}