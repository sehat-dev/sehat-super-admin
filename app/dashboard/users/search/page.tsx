'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { superAdminAPI } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  Calendar,
  Hash,
  X,
  Download,
  SlidersHorizontal
} from 'lucide-react';

interface User {
  _id: string;
  sehatId: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface Filters {
  search?: string;
  status?: string;
  emailVerified?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default function SearchUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    emailVerified: '',
    dateFrom: '',
    dateTo: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await superAdminAPI.searchUsers(params);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      await superAdminAPI.toggleUserStatus(userId);
      // Refresh the users list
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      emailVerified: '',
      dateFrom: '',
      dateTo: '',
    });
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

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
            <h1 className="text-3xl font-bold text-gray-900">Search Users</h1>
            <p className="text-gray-600">Advanced search and filtering for users</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
            <Button onClick={fetchUsers} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by Sehat ID, email, name, or phone..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  />
                </div>
              </div>
              <Button onClick={applyFilters}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Advanced Filters</span>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Verification
                  </label>
                  <select
                    value={filters.emailVerified}
                    onChange={(e) => setFilters({ ...filters, emailVerified: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    <option value="true">Verified</option>
                    <option value="false">Unverified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Created From
                  </label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Created To
                  </label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-2">
                <Button variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
                <Button onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Search: {filters.search}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters({ ...filters, search: '' })}
                    />
                  </Badge>
                )}
                {filters.status && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Status: {filters.status}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters({ ...filters, status: '' })}
                    />
                  </Badge>
                )}
                {filters.emailVerified && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Email: {filters.emailVerified === 'true' ? 'Verified' : 'Unverified'}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters({ ...filters, emailVerified: '' })}
                    />
                  </Badge>
                )}
                {(filters.dateFrom || filters.dateTo) && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Date: {filters.dateFrom || 'Any'} - {filters.dateTo || 'Any'}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters({ ...filters, dateFrom: '', dateTo: '' })}
                    />
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Search Results
            {pagination && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({pagination.totalUsers} users found)
              </span>
            )}
          </h2>
          {users.length > 0 && (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>

        {/* Users Table */}
        <Card>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Searching users...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found matching your criteria</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Sehat ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Verified</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Hash className="h-4 w-4 text-gray-400" />
                              <span className="font-mono text-sm">{user.sehatId}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">
                              {user.name || 'Not provided'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{user.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{user.phoneNumber || 'Not provided'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={user.isEmailVerified ? "default" : "outline"}>
                              {user.isEmailVerified ? 'Verified' : 'Unverified'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{formatDate(user.createdAt)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleUserStatus(user._id)}
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      Showing {((pagination.currentPage - 1) * 10) + 1} to{' '}
                      {Math.min(pagination.currentPage * 10, pagination.totalUsers)} of{' '}
                      {pagination.totalUsers} users
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasPrevPage}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <span className="px-3 py-2 text-sm">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasNextPage}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
