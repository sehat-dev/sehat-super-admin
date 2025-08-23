'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main content area */}
      <div className="lg:pl-64">
        <main className="min-h-screen p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 