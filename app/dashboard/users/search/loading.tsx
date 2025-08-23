import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { RefreshCw } from 'lucide-react';

export default function SearchUsersLoading() {
  const breadcrumbItems = [
    { label: 'Users', href: '/dashboard/users' },
    { label: 'Search' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Searching users...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
