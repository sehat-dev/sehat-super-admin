import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { RefreshCw } from 'lucide-react';

export default function UsersLoading() {
  const breadcrumbItems = [
    { label: 'Users' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                  <div>
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
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

        {/* Users Table */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
