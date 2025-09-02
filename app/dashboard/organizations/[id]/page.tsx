'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  ArrowLeft, 
  Edit,
  Mail,
  Phone,
  MapPin,
  Users,
  
  Hash,
  Power,
  PowerOff,
  
  FileText,
  Activity,
  TrendingUp,
  Shield,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { superAdminAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Organization {
  id: string;
  organizationId: string;
  name: string;
  logo?: string;
  email: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  maxUsers: number;
  maxDoctors: number;
  currentUsers: number;
  currentDoctors: number;
  isActive: boolean;
  createdAt: string;
}

export default function OrganizationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const organizationId = params.id as string;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch organization details
  useEffect(() => {
    if (authLoading || !isAuthenticated || !organizationId) {
      return;
    }

    const fetchOrganization = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching organization details...');
        
        // For now, we'll simulate fetching from the organizations list
        // In a real implementation, you would have a getOrganizationById API call
        const response = await superAdminAPI.getAllOrganizations({
          page: 1,
          limit: 100,
        });
        
        const org = response.data.organizations.find((org: Organization) => org.id === organizationId);
        
        if (org) {
          setOrganization(org);
        } else {
          setError('Organization not found');
        }
      } catch (err: unknown) {
        console.error('Error fetching organization:', err);
        const axiosError = err as { response?: { data?: { message?: string } } };
        const errorMessage = axiosError?.response?.data?.message || 'Failed to fetch organization details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [organizationId, authLoading, isAuthenticated]);

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
              <p className="text-gray-600">Loading organization details...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !organization) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Organization not found'}
            </h3>
            <p className="text-gray-500 mb-4">
              The organization you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/dashboard/organizations">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Organizations
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
            { label: 'Organizations', href: '/dashboard/organizations' },
            { label: organization.name }
          ]} 
          className="mb-6"
        />

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
           
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
              <p className="text-gray-600 mt-2">
                Organization ID: {organization.organizationId}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Organization
            </Button>
            <Button variant={organization.isActive ? "outline" : "default"}>
              {organization.isActive ? (
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

        {/* Organization Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Logo and Basic Info */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="h-24 w-24 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {organization.logo ? (
                    <img 
                      src={organization.logo} 
                      alt={organization.name} 
                      className="h-24 w-24 object-cover rounded-lg"
                    />
                  ) : (
                    <Building2 className="h-12 w-12 text-blue-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{organization.name}</h3>
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{organization.organizationId}</span>
                </div>
                <Badge variant={organization.isActive ? "default" : "secondary"} className="mb-4">
                  {organization.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <div className="text-sm text-gray-500">
                  Created on {new Date(organization.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Organization Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{organization.currentUsers}</div>
                  <div className="text-sm text-gray-600">Current Users</div>
                  <div className="text-xs text-gray-500">
                    {Math.round((organization.currentUsers / organization.maxUsers) * 100)}% of {organization.maxUsers}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{organization.currentDoctors}</div>
                  <div className="text-sm text-gray-600">Current Doctors</div>
                  <div className="text-xs text-gray-500">
                    {Math.round((organization.currentDoctors / organization.maxDoctors) * 100)}% of {organization.maxDoctors}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{organization.maxUsers}</div>
                  <div className="text-sm text-gray-600">Max Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{organization.maxDoctors}</div>
                  <div className="text-sm text-gray-600">Max Doctors</div>
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
                  <div className="text-sm text-gray-600">{organization.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">Phone Number</div>
                  <div className="text-sm text-gray-600">{organization.phoneNumber}</div>
                </div>
              </div>
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
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Full Address</div>
                  <div className="text-sm text-gray-600">
                    {organization.address.street}<br />
                    {organization.address.city}, {organization.address.state} {organization.address.zipCode}<br />
                    {organization.address.country}
                  </div>
                </div>
              </div>
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
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Manage Doctors
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Organization Settings
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
                <span className="text-gray-600">Organization ID:</span>
                <span className="font-mono text-gray-900">{organization.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">
                  {new Date(organization.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <Badge variant={organization.isActive ? "default" : "secondary"}>
                  {organization.isActive ? 'Active' : 'Inactive'}
                </Badge>
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
