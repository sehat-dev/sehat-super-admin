'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  ArrowLeft, 
  Edit,
  Mail,
  Phone,

  Hash,
  Power,
  PowerOff,
  Shield,
  Activity,
  TrendingUp,
  FileText,
  MapPin,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import { superAdminAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

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
  profilePicture?: {
    url: string;
    publicId: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = params.id as string;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch user details
  useEffect(() => {
    if (authLoading || !isAuthenticated || !userId) {
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching user details...');
        
        // For now, we'll simulate fetching from the users list
        // In a real implementation, you would have a getUserById API call
        const response = await superAdminAPI.getAllUsers({
          page: 1,
          limit: 100,
        });
        
        const foundUser = response.data.users.find((u: User) => u._id === userId);
        
        if (foundUser) {
          setUser(foundUser);
        } else {
          setError('User not found');
        }
      } catch (err: unknown) {
        console.error('Error fetching user:', err);
        const axiosError = err as { response?: { data?: { message?: string } } };
        const errorMessage = axiosError?.response?.data?.message || 'Failed to fetch user details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, authLoading, isAuthenticated]);

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading user details...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !user) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'User not found'}
            </h3>
            <p className="text-gray-500 mb-4">
              The user you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/dashboard/users">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Users', href: '/dashboard/users' },
            { label: user.name || user.sehatId }
          ]} 
          className="mb-6"
        />

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.name || 'User Profile'}
              </h1>
              <p className="text-gray-600 mt-2">
                Sehat ID: {user.sehatId}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </Button>
            <Button variant={user.isActive ? "outline" : "default"}>
              {user.isActive ? (
                <>
                  <PowerOff className="h-4 w-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <Power className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </Button>
          </div>
        </div>

        {/* User Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Profile Picture and Basic Info */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="h-24 w-24 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {user.profilePicture?.url ? (
                    <img 
                      src={user.profilePicture.url} 
                      alt={user.name || 'User'} 
                      className="h-24 w-24 object-cover rounded-lg"
                    />
                  ) : (
                    <User className="h-12 w-12 text-blue-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {user.name || 'Not provided'}
                </h3>
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user.sehatId}</span>
                </div>
                <div className="space-y-2">
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <div>
                    <Badge variant={user.isEmailVerified ? "default" : "outline"}>
                      {user.isEmailVerified ? 'Email Verified' : 'Email Unverified'}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-4">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Statistics */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.isActive ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {user.isEmailVerified ? 'Yes' : 'No'}
                  </div>
                  <div className="text-sm text-gray-600">Email Verified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {user.lastLogin ? 'Yes' : 'No'}
                  </div>
                  <div className="text-sm text-gray-600">Has Logged In</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">Email Address</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Phone Number</div>
                    <div className="text-sm text-gray-600">{user.phoneNumber}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Address Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.address ? (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Full Address</div>
                    <div className="text-sm text-gray-600">
                      {user.address.street}<br />
                      {user.address.city}, {user.address.state} {user.address.zipCode}<br />
                      {user.address.country}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No address information</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Reset Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                View Organizations
              </Button>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>System Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">User ID:</span>
                <span className="font-mono text-gray-900">{user._id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Login:</span>
                <span className="text-gray-900">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400 mt-1">Activity tracking coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
