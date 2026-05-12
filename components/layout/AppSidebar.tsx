'use client';

import { 
  Home, 
  BookOpen, 
  Users, 
  Calendar, 
  Settings, 
  LogOut 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// Import the primitives from the file you just gave me
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Define navigation based on the user's role
  const navigation = [
    { name: "Dashboard", href: `/${user?.role}/dashboard`, icon: Home },
    { name: "Courses", href: `/${user?.role}/courses`, icon: BookOpen },
    // Add logic here to filter by role...
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 font-bold text-xl">
        Bells Allocation
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>Application</SidebarGroupContent>
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenuButton onClick={logout} className="text-red-500">
          <LogOut />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}