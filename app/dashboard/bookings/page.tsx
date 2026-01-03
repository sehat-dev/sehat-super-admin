"use client";

import { useState, useEffect, useCallback } from "react";
import { superAdminAPI } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Search,
  RefreshCw,
  Eye,
  Calendar,
  Hash,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";

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
  };
  slotDateTime: string;
  location: {
    address: string;
    pincode: string;
    city?: string;
    state?: string;
  };
  locationType: "at-home" | "care-center";
  patientDetails: {
    name: string;
    age: number;
    gender: string;
    phone: string;
    email?: string;
  };
  status: "pending" | "confirmed" | "completed" | "cancelled";
  amount: number;
  cancellationReason?: string;
  cancelledAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalBookings: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: 10,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (serviceTypeFilter !== "all") {
        params.serviceType = serviceTypeFilter;
      }

      const response = await superAdminAPI.getAllBookings(params);
      setBookings(response.data.bookings || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, serviceTypeFilter]);

  const fetchStats = async () => {
    try {
      const response = await superAdminAPI.getBookingStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await superAdminAPI.updateBookingStatus(bookingId, status);
      fetchBookings();
      fetchStats();
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to update booking status");
    }
  };

  const cancelBooking = async (bookingId: string, reason?: string) => {
    try {
      const reasonPrompt =
        reason || prompt("Enter cancellation reason (optional):");
      if (reasonPrompt !== null) {
        await superAdminAPI.cancelBooking(bookingId, reasonPrompt || undefined);
        fetchBookings();
        fetchStats();
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking");
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this booking? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await superAdminAPI.deleteBooking(bookingId);
      fetchBookings();
      fetchStats();
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking");
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [fetchBookings]);

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      pending: "outline",
      confirmed: "default",
      completed: "default",
      cancelled: "secondary",
    };
    const colors: Record<string, string> = {
      pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
      confirmed: "text-blue-600 bg-blue-50 border-blue-200",
      completed: "text-green-600 bg-green-50 border-green-200",
      cancelled: "text-red-600 bg-red-50 border-red-200",
    };
    return {
      variant: variants[status] || "outline",
      color: colors[status] || "",
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className='h-4 w-4' />;
      case "confirmed":
        return <CheckCircle className='h-4 w-4' />;
      case "completed":
        return <CheckCircle className='h-4 w-4' />;
      case "cancelled":
        return <XCircle className='h-4 w-4' />;
      default:
        return <AlertCircle className='h-4 w-4' />;
    }
  };

  const breadcrumbItems = [{ label: "Bookings", href: "/dashboard/bookings" }];

  return (
    <DashboardLayout>
      <div className='p-6'>
        {/* Breadcrumbs */}
        <Breadcrumb items={breadcrumbItems} className='mb-6' />

        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Bookings Dashboard
            </h1>
            <p className='text-gray-600 mt-2'>
              Manage and view all bookings in the system
            </p>
          </div>
          <Button
            onClick={() => {
              fetchBookings();
              fetchStats();
            }}
            variant='outline'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Bookings
              </CardTitle>
              <Calendar className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.totalBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Pending</CardTitle>
              <AlertCircle className='h-4 w-4 text-yellow-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>
                {stats.pending}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Confirmed</CardTitle>
              <CheckCircle className='h-4 w-4 text-blue-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {stats.confirmed}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Completed</CardTitle>
              <CheckCircle className='h-4 w-4 text-green-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {stats.completed}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Cancelled</CardTitle>
              <XCircle className='h-4 w-4 text-red-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {stats.cancelled}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Revenue
              </CardTitle>
              <DollarSign className='h-4 w-4 text-purple-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-600'>
                ₹{stats.totalRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                  <Input
                    placeholder='Search by Booking ID, User ID, Patient Name, Phone...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <div className='flex gap-2'>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                  <option value='all'>All Status</option>
                  <option value='pending'>Pending</option>
                  <option value='confirmed'>Confirmed</option>
                  <option value='completed'>Completed</option>
                  <option value='cancelled'>Cancelled</option>
                </select>
                <select
                  value={serviceTypeFilter}
                  onChange={(e) => setServiceTypeFilter(e.target.value)}
                  className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                  <option value='all'>All Services</option>
                  <option value='care_center'>Care Center</option>
                  <option value='health_mitra'>Health Mitra</option>
                  <option value='health_checkup'>Health Checkup</option>
                  <option value='lab_test'>Lab Test</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='flex items-center justify-center py-8'>
                <RefreshCw className='h-6 w-6 animate-spin text-gray-400' />
                <span className='ml-2 text-gray-600'>Loading bookings...</span>
              </div>
            ) : bookings.length === 0 ? (
              <div className='text-center py-8'>
                <Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-600'>No bookings found</p>
              </div>
            ) : (
              <>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b'>
                        <th className='text-left py-3 px-4 font-medium text-gray-700'>
                          Booking ID
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-700'>
                          User
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-700'>
                          Service
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-700'>
                          Patient
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-700'>
                          Slot Date/Time
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-700'>
                          Location
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-700'>
                          Amount
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-700'>
                          Status
                        </th>
                        <th className='text-left py-3 px-4 font-medium text-gray-700'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => {
                        const statusBadge = getStatusBadge(booking.status);
                        return (
                          <tr
                            key={booking._id}
                            className='border-b hover:bg-gray-50'>
                            <td className='py-3 px-4'>
                              <div className='flex items-center space-x-2'>
                                <Hash className='h-4 w-4 text-gray-400' />
                                <span className='font-mono text-sm'>
                                  {booking.bookingId}
                                </span>
                              </div>
                            </td>
                            <td className='py-3 px-4'>
                              <div className='flex flex-col'>
                                <span className='font-medium text-sm'>
                                  {booking.userId?.name ||
                                    booking.userId?.sehatId ||
                                    "N/A"}
                                </span>
                                <span className='text-xs text-gray-500'>
                                  {booking.userId?.sehatId}
                                </span>
                              </div>
                            </td>
                            <td className='py-3 px-4'>
                              <div className='flex flex-col'>
                                <span className='font-medium text-sm'>
                                  {booking.serviceDetails?.packageName ||
                                    booking.serviceDetails?.serviceName ||
                                    booking.serviceType}
                                </span>
                                <span className='text-xs text-gray-500 capitalize'>
                                  {booking.serviceType?.replace("_", " ") ||
                                    "N/A"}
                                </span>
                              </div>
                            </td>
                            <td className='py-3 px-4'>
                              <div className='flex flex-col'>
                                <span className='font-medium text-sm'>
                                  {booking.patientDetails.name}
                                </span>
                                <span className='text-xs text-gray-500'>
                                  {booking.patientDetails.age} yrs,{" "}
                                  {booking.patientDetails.gender}
                                </span>
                              </div>
                            </td>
                            <td className='py-3 px-4'>
                              <div className='flex items-center space-x-2'>
                                <Clock className='h-4 w-4 text-gray-400' />
                                <div className='flex flex-col'>
                                  <span className='text-sm'>
                                    {formatDateOnly(booking.slotDateTime)}
                                  </span>
                                  <span className='text-xs text-gray-500'>
                                    {new Date(
                                      booking.slotDateTime
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className='py-3 px-4'>
                              <div className='flex items-center space-x-2'>
                                <MapPin className='h-4 w-4 text-gray-400' />
                                <div className='flex flex-col'>
                                  <span className='text-sm'>
                                    {booking.location.pincode}
                                  </span>
                                  <span className='text-xs text-gray-500 capitalize'>
                                    {booking.locationType?.replace("-", " ") ||
                                      "N/A"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className='py-3 px-4'>
                              <div className='flex items-center space-x-2'>
                                <DollarSign className='h-4 w-4 text-gray-400' />
                                <span className='font-medium'>
                                  ₹{booking.amount.toLocaleString()}
                                </span>
                              </div>
                            </td>
                            <td className='py-3 px-4'>
                              <Badge
                                variant={statusBadge.variant as "default" | "secondary" | "outline"}
                                className={statusBadge.color}>
                                <div className='flex items-center space-x-1'>
                                  {getStatusIcon(booking.status)}
                                  <span className='capitalize'>
                                    {booking.status}
                                  </span>
                                </div>
                              </Badge>
                            </td>
                            <td className='py-3 px-4'>
                              <div className='flex space-x-2'>
                                <Link
                                  href={`/dashboard/bookings/${booking._id}`}>
                                  <Button size='sm' variant='outline'>
                                    <Eye className='h-4 w-4' />
                                  </Button>
                                </Link>
                                {booking.status !== "cancelled" &&
                                  booking.status !== "completed" && (
                                    <>
                                      {booking.status === "pending" && (
                                        <Button
                                          size='sm'
                                          variant='outline'
                                          onClick={() =>
                                            updateBookingStatus(
                                              booking._id,
                                              "confirmed"
                                            )
                                          }>
                                          Confirm
                                        </Button>
                                      )}
                                      {booking.status === "confirmed" && (
                                        <Button
                                          size='sm'
                                          variant='outline'
                                          onClick={() =>
                                            updateBookingStatus(
                                              booking._id,
                                              "completed"
                                            )
                                          }>
                                          Complete
                                        </Button>
                                      )}
                                      <Button
                                        size='sm'
                                        variant='outline'
                                        onClick={() =>
                                          cancelBooking(booking._id)
                                        }
                                        className='text-red-600 hover:text-red-700'>
                                        Cancel
                                      </Button>
                                    </>
                                  )}
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() => deleteBooking(booking._id)}
                                  className='text-red-600 hover:text-red-700'>
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && (
                  <div className='flex items-center justify-between mt-6'>
                    <div className='text-sm text-gray-600'>
                      Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
                      {Math.min(
                        pagination.currentPage * 10,
                        pagination.totalBookings
                      )}{" "}
                      of {pagination.totalBookings} bookings
                    </div>
                    <div className='flex space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={!pagination.hasPrevPage}
                        onClick={() => setCurrentPage(currentPage - 1)}>
                        Previous
                      </Button>
                      <span className='px-3 py-2 text-sm'>
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={!pagination.hasNextPage}
                        onClick={() => setCurrentPage(currentPage + 1)}>
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
