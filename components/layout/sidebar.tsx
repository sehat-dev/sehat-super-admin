"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Settings,
  BarChart3,
  FileText,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  Activity,
  TrendingUp,
  Calendar,
  HelpCircle,
  Building2,
  Plus,
  Eye,
  Search,
  ChevronDown,
  ChevronRight,
  Stethoscope,
} from "lucide-react";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface SidebarGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SidebarItem[];
  badge?: string;
}

const sidebarItems: (SidebarItem | SidebarGroup)[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Organizations",
    icon: Building2,
    items: [
      {
        title: "Create",
        href: "/dashboard/organizations/create",
        icon: Plus,
      },
      {
        title: "View All",
        href: "/dashboard/organizations",
        icon: Eye,
      },
    ],
  },
  {
    title: "Users",
    icon: Users,
    items: [
      {
        title: "View All",
        href: "/dashboard/users",
        icon: Eye,
      },
      {
        title: "Search",
        href: "/dashboard/users/search",
        icon: Search,
      },
    ],
  },
  {
    title: "Doctors",
    icon: Stethoscope,
    items: [
      {
        title: "View All",
        href: "/dashboard/doctors",
        icon: Eye,
      },
      {
        title: "Search",
        href: "/dashboard/doctors/search",
        icon: Search,
      },
    ],
  },
  {
    title: "Bookings",
    href: "/dashboard/bookings",
    icon: Calendar,
  },

  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupTitle)
        ? prev.filter((title) => title !== groupTitle)
        : [...prev, groupTitle]
    );
  };

  const isGroupExpanded = (groupTitle: string) =>
    expandedGroups.includes(groupTitle);

  const SidebarContent = () => (
    <div className='flex flex-col h-full bg-white border-r border-gray-200'>
      {/* Header */}
      <div className='flex items-center justify-between p-6 border-b border-gray-200'>
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "space-x-3"
          )}>
          <div className='flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg'>
            <Shield className='h-6 w-6 text-white' />
          </div>
          {!isCollapsed && (
            <div>
              <span className='text-xl font-bold text-gray-900'>Sehat</span>
              <p className='text-xs text-gray-500'>Super Admin</p>
            </div>
          )}
        </div>
        {/* <Button
          variant='ghost'
          size='sm'
          onClick={toggleSidebar}
          className='hidden lg:flex hover:bg-gray-100'>
          <Menu className='h-4 w-4' />
        </Button> */}
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-4 space-y-2 overflow-y-auto'>
        <div className='space-y-1'>
          {sidebarItems.map((item) => {
            // Check if it's a group
            if ("items" in item) {
              const group = item as SidebarGroup;
              const isExpanded = isGroupExpanded(group.title);
              const hasActiveChild = group.items.some(
                (subItem) => pathname === subItem.href
              );

              return (
                <div key={group.title}>
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className={cn(
                      "flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      hasActiveChild
                        ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}>
                    <div className='flex items-center space-x-3'>
                      <group.icon className='h-5 w-5' />
                      {!isCollapsed && (
                        <div className='flex items-center justify-between flex-1'>
                          <span>{group.title}</span>
                          {group.badge && (
                            <span className='bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium'>
                              {group.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {!isCollapsed &&
                      (isExpanded ? (
                        <ChevronDown className='h-4 w-4 transition-transform duration-200' />
                      ) : (
                        <ChevronRight className='h-4 w-4 transition-transform duration-200' />
                      ))}
                  </button>

                  {/* Group items */}
                  {!isCollapsed && isExpanded && (
                    <div className='ml-8 mt-2 space-y-1'>
                      {group.items.map((subItem) => {
                        const isActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                              isActive
                                ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}>
                            <subItem.icon className='h-4 w-4' />
                            <span>{subItem.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Regular item
            const regularItem = item as SidebarItem;
            const isActive = pathname === regularItem.href;

            return (
              <Link
                key={regularItem.href}
                href={regularItem.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}>
                <regularItem.icon className='h-5 w-5' />
                {!isCollapsed && (
                  <div className='flex items-center justify-between flex-1'>
                    <span>{regularItem.title}</span>
                    {regularItem.badge && (
                      <span className='bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium'>
                        {regularItem.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className='p-4 border-t border-gray-200 bg-gray-50'>
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "space-x-3"
          )}>
          <div className='h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center'>
            <User className='h-5 w-5 text-white' />
          </div>
          {!isCollapsed && (
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {user?.name || "Super Admin"}
              </p>
              <p className='text-xs text-gray-500 truncate'>
                {user?.email || "admin@sehat.com"}
              </p>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className='mt-3 space-y-1'>
            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-start text-sm hover:bg-gray-100'
              onClick={() => {
                /* Add profile action */
              }}>
              <User className='h-4 w-4 mr-2' />
              Profile
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-start text-sm hover:bg-gray-100'
              onClick={() => {
                /* Add help action */
              }}>
              <HelpCircle className='h-4 w-4 mr-2' />
              Help
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50'
              onClick={logout}>
              <LogOut className='h-4 w-4 mr-2' />
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center space-x-3'>
            <div className='flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg'>
              <Shield className='h-6 w-6 text-white' />
            </div>
            <div>
              <span className='text-xl font-bold text-gray-900'>Sehat</span>
              <p className='text-xs text-gray-500'>Super Admin</p>
            </div>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={toggleMobileSidebar}
            className='hover:bg-gray-100'>
            <X className='h-4 w-4' />
          </Button>
        </div>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 lg:bg-white lg:border-r lg:border-gray-200",
          isCollapsed && "lg:w-16"
        )}>
        <SidebarContent />
      </div>

      {/* Mobile menu button */}
      <div className='lg:hidden fixed top-4 left-4 z-50'>
        <Button
          variant='outline'
          size='sm'
          onClick={toggleMobileSidebar}
          className='bg-white shadow-lg border-gray-200'>
          <Menu className='h-4 w-4' />
        </Button>
      </div>
    </>
  );
}
