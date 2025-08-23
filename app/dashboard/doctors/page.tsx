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
  Stethoscope,
  Award,
  Clock
} from 'lucide-react';

interface Doctor {
  _id: string;
  doctorId: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  specialization?: string;
  licenseNumber?: string;
  experience?: number;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalDoctors: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function DoctorsPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    activeDoctors: 0,
    inactiveDoctors: 0,
    verifiedDoctors: 0,
    unverifiedDoctors: 0,
    recentDoctors: 0,
  });

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (specializationFilter !== 'all') {
        params.specialization = specializationFilter;
      }

      const response = await superAdminAPI.getAllDoctors(params);
      setDoctors(response.data.doctors);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await superAdminAPI.getDoctorStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const toggleDoctorStatus = async (doctorId: string) => {
    try {
      await superAdminAPI.toggleDoctorStatus(doctorId);
      // Refresh the doctors list
      fetchDoctors();
      fetchStats();
    } catch (error) {
      console.error('Error toggling doctor status:', error);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter, specializationFilter]);

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

  const breadcrumbItems = [
    { label: 'Doctors' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
            <p className="text-gray-600">Manage and view all doctors in the system</p>
          </div>
          <Button onClick={() => { fetchDoctors(); fetchStats(); }} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Doctors</p>
                  <p className="text-2xl font-bold">{stats.totalDoctors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Doctors</p>
                  <p className="text-2xl font-bold">{stats.activeDoctors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserX className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Inactive Doctors</p>
                  <p className="text-2xl font-bold">{stats.inactiveDoctors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-2xl font-bold">{stats.verifiedDoctors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Unverified</p>
                  <p className="text-2xl font-bold">{stats.unverifiedDoctors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Recent (30d)</p>
                  <p className="text-2xl font-bold">{stats.recentDoctors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by Doctor ID, email, name, phone, license, or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Specializations</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctors Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading doctors...</span>
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-8">
                <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No doctors found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Doctor ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Specialization</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">License</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Experience</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Verified</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((doctor) => (
                        <tr key={doctor._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Hash className="h-4 w-4 text-gray-400" />
                              <span className="font-mono text-sm">{doctor.doctorId}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">
                              {doctor.name || 'Not provided'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{doctor.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Stethoscope className="h-4 w-4 text-gray-400" />
                              <span>{doctor.specialization || 'Not specified'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Award className="h-4 w-4 text-gray-400" />
                              <span>{doctor.licenseNumber || 'Not provided'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>{doctor.experience ? `${doctor.experience} years` : 'Not specified'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={doctor.isActive ? "default" : "secondary"}>
                              {doctor.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={doctor.isEmailVerified ? "default" : "outline"}>
                              {doctor.isEmailVerified ? 'Verified' : 'Unverified'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{formatDate(doctor.createdAt)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleDoctorStatus(doctor._id)}
                              >
                                {doctor.isActive ? 'Deactivate' : 'Activate'}
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
                      {Math.min(pagination.currentPage * 10, pagination.totalDoctors)} of{' '}
                      {pagination.totalDoctors} doctors
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
