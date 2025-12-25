'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { superAdminAPI } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Trash2,
  Edit,
} from 'lucide-react';

interface Booking {
  _id: string;
  bookingId: string;
  userId: {
    _id: string;
    sehatId: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
  };
  serviceType: string;
  serviceDetails: {
    packageName?: string;
    serviceName?: string;
    serviceCategory?: string;
    testsIncluded?: string[];
    description?: string;
  };
  slotDateTime: string;
  location: {
    address: string;
    pincode: string;
    city?: string;
    state?: string;
    landmark?: string;
  };
  locationType: 'at-home' | 'care-center';
  patientDetails: {
    name: string;
    age: number;
    gender: string;
    phone: string;
    email?: string;
  };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  cancellationReason?: string;
  cancelledAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [params.id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await superAdminAPI.getBookingById(params.id as string);
      setBooking(response.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (status: string) => {
    try {
      await superAdminAPI.updateBookingStatus(params.id as string, status);
      fetchBooking();
      alert('Booking status updated successfully');
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    }
  };

  const cancelBooking = async () => {
    const reason = prompt('Enter cancellation reason (optional):');
    if (reason !== null) {
      try {
        await superAdminAPI.cancelBooking(params.id as string, reason || undefined);
        fetchBooking();
        alert('Booking cancelled successfully');
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking');
      }
    }
  };

  const deleteBooking = async () => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }
    try {
      await superAdminAPI.deleteBooking(params.id as string);
      router.push('/dashboard/bookings');
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      confirmed: 'text-blue-600 bg-blue-50 border-blue-200',
      completed: 'text-green-600 bg-green-50 border-green-200',
      cancelled: 'text-red-600 bg-red-50 border-red-200',
    };
    return colors[status] || '';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const breadcrumbItems = [
    { label: 'Bookings', href: '/dashboard/bookings' },
    { label: booking?.bookingId || 'Details', href: '#' }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading booking details...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-600">Booking not found</p>
            <Button onClick={() => router.push('/dashboard/bookings')} className="mt-4">
              Back to Bookings
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Breadcrumbs */}
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-gray-600 mt-2">Booking ID: {booking.bookingId}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <>
                {booking.status === 'pending' && (
                  <Button onClick={() => updateBookingStatus('confirmed')}>
                    Confirm Booking
                  </Button>
                )}
                {booking.status === 'confirmed' && (
                  <Button onClick={() => updateBookingStatus('completed')}>
                    Mark as Completed
                  </Button>
                )}
                <Button variant="outline" onClick={cancelBooking} className="text-red-600">
                  Cancel Booking
                </Button>
              </>
            )}
            <Button variant="outline" onClick={deleteBooking} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Booking Status</span>
                  <Badge className={getStatusBadge(booking.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(booking.status)}
                      <span className="capitalize">{booking.status}</span>
                    </div>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Slot Date & Time</p>
                      <p className="font-medium">{formatDate(booking.slotDateTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium text-lg">₹{booking.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Created At</p>
                      <p className="font-medium">{formatDate(booking.createdAt)}</p>
                    </div>
                  </div>
                  {booking.cancelledAt && (
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-400" />
                      <div>
                        <p className="text-sm text-gray-600">Cancelled At</p>
                        <p className="font-medium">{formatDate(booking.cancelledAt)}</p>
                      </div>
                    </div>
                  )}
                  {booking.completedAt && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <div>
                        <p className="text-sm text-gray-600">Completed At</p>
                        <p className="font-medium">{formatDate(booking.completedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Service Type</p>
                    <p className="font-medium capitalize">{booking.serviceType?.replace('_', ' ') || 'N/A'}</p>
                  </div>
                  {booking.serviceDetails.packageName && (
                    <div>
                      <p className="text-sm text-gray-600">Package Name</p>
                      <p className="font-medium">{booking.serviceDetails.packageName}</p>
                    </div>
                  )}
                  {booking.serviceDetails.serviceName && (
                    <div>
                      <p className="text-sm text-gray-600">Service Name</p>
                      <p className="font-medium">{booking.serviceDetails.serviceName}</p>
                    </div>
                  )}
                  {booking.serviceDetails.description && (
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="font-medium">{booking.serviceDetails.description}</p>
                    </div>
                  )}
                  {booking.serviceDetails.testsIncluded && booking.serviceDetails.testsIncluded.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Tests Included</p>
                      <ul className="list-disc list-inside space-y-1">
                        {booking.serviceDetails.testsIncluded.map((test, index) => (
                          <li key={index} className="text-sm">{test}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{booking.location.address}</p>
                      {booking.location.landmark && (
                        <p className="text-sm text-gray-500">Landmark: {booking.location.landmark}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pincode</p>
                    <p className="font-medium">{booking.location.pincode}</p>
                  </div>
                  {(booking.location.city || booking.location.state) && (
                    <div>
                      <p className="text-sm text-gray-600">City, State</p>
                      <p className="font-medium">
                        {booking.location.city || 'N/A'}
                        {booking.location.city && booking.location.state && ', '}
                        {booking.location.state || ''}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Location Type</p>
                    <Badge variant="outline" className="mt-1">
                      {booking.locationType === 'at-home' ? 'At Home' : 'Care Center'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {booking.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{booking.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Cancellation Reason */}
            {booking.cancellationReason && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Cancellation Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{booking.cancellationReason}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{booking.userId?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sehat ID</p>
                    <p className="font-medium font-mono text-sm">{booking.userId?.sehatId}</p>
                  </div>
                  {booking.userId?.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{booking.userId.email}</p>
                      </div>
                    </div>
                  )}
                  {booking.userId?.phoneNumber && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{booking.userId.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{booking.patientDetails.name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium">{booking.patientDetails.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium capitalize">{booking.patientDetails.gender}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{booking.patientDetails.phone}</p>
                    </div>
                  </div>
                  {booking.patientDetails.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{booking.patientDetails.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

