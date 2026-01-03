"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Power,
  PowerOff,
  IndianRupee,
  Save,
} from "lucide-react";
import { superAdminAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Service {
  _id: string;
  serviceId: string;
  serviceType: "care_center" | "health_mitra" | "health_checkup" | "lab_test";
  name: string;
  category?: string;
  price: number;
  originalPrice?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const SERVICE_TYPES = [
  { value: "care_center", label: "Care Center" },
  { value: "health_mitra", label: "Health Mitra" },
  { value: "health_checkup", label: "Health Checkup" },
  { value: "lab_test", label: "Lab Test" },
];

export default function ServicesPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [totalServices, setTotalServices] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<
    Record<string, { price: string; originalPrice: string }>
  >({});
  const [formData, setFormData] = useState<{
    serviceId: string;
    serviceType: string;
    name: string;
    category: string;
    price: string;
    originalPrice: string;
    isActive: boolean;
  }>({
    serviceId: "",
    serviceType: "",
    name: "",
    category: "",
    price: "",
    originalPrice: "",
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await superAdminAPI.getAllServices({
          page: 1,
          limit: 500,
          search: searchTerm || undefined,
          serviceType:
            serviceTypeFilter !== "all" ? serviceTypeFilter : undefined,
          isActive:
            statusFilter !== "all" ? statusFilter === "active" : undefined,
        });

        setServices(response.data.services);
        setTotalServices(response.data.pagination.total);
      } catch (err: unknown) {
        console.error("Error fetching services:", err);
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        const errorMessage =
          axiosError?.response?.data?.message || "Failed to fetch services";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [
    searchTerm,
    serviceTypeFilter,
    statusFilter,
    authLoading,
    isAuthenticated,
  ]);

  const handleCreate = () => {
    setSelectedService(null);
    setFormData({
      serviceId: "",
      serviceType: "",
      name: "",
      category: "",
      price: "",
      originalPrice: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setFormData({
      serviceId: service.serviceId,
      serviceType: service.serviceType,
      name: service.name,
      category: service.category || "",
      price: service.price.toString(),
      originalPrice: service.originalPrice?.toString() || "",
      isActive: service.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleBulkEdit = () => {
    setIsBulkEditMode(true);
    const initialData: Record<
      string,
      { price: string; originalPrice: string }
    > = {};
    services.forEach((service) => {
      initialData[service._id] = {
        price: service.price.toString(),
        originalPrice:
          service.originalPrice?.toString() || service.price.toString(),
      };
    });
    setBulkEditData(initialData);
  };

  const handleBulkSave = async () => {
    try {
      const updates = Object.entries(bulkEditData).map(([id, data]) => {
        const service = services.find((s) => s._id === id);
        return {
          serviceId: service?.serviceId || "",
          price: parseFloat(data.price),
          originalPrice: data.originalPrice
            ? parseFloat(data.originalPrice)
            : parseFloat(data.price),
        };
      });

      await superAdminAPI.bulkUpdateServices(updates);
      setIsBulkEditMode(false);
      setBulkEditData({});
      window.location.reload();
    } catch (err: unknown) {
      console.error("Error bulk updating services:", err);
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message
          : "Failed to update services";
      alert(errorMessage || "Failed to update services");
    }
  };

  const handleSave = async () => {
    try {
      const serviceData = {
        ...formData,
        serviceType: formData.serviceType as
          | "care_center"
          | "health_mitra"
          | "health_checkup"
          | "lab_test",
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : parseFloat(formData.price),
      };

      if (selectedService) {
        await superAdminAPI.updateService(selectedService._id, serviceData);
      } else {
        await superAdminAPI.createService(serviceData);
      }

      setIsDialogOpen(false);
      window.location.reload();
    } catch (err: unknown) {
      console.error("Error saving service:", err);
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message
          : "Failed to save service";
      alert(errorMessage || "Failed to save service");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      await superAdminAPI.deleteService(id);
      window.location.reload();
    } catch (err: unknown) {
      console.error("Error deleting service:", err);
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message
          : "Failed to delete service";
      alert(errorMessage || "Failed to delete service");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await superAdminAPI.toggleServiceStatus(id);
      window.location.reload();
    } catch (err: unknown) {
      console.error("Error toggling status:", err);
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message
          : "Failed to update status";
      alert(errorMessage || "Failed to update status");
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className='p-6'>
          <div className='flex items-center justify-center h-64'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-gray-600'>Loading...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className='p-6'>
          <div className='flex items-center justify-center h-64'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-gray-600'>Loading services...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='p-6'>
        <Breadcrumb
          items={[{ label: "Services", href: "/dashboard/services" }]}
          className='mb-6'
        />

        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Services</h1>
            <p className='text-gray-600 mt-2'>
              Manage individual service pricing (not packages)
            </p>
          </div>
          <div className='flex gap-2'>
            {!isBulkEditMode && (
              <>
                <Button
                  onClick={handleBulkEdit}
                  variant='outline'
                  className='flex items-center space-x-2'>
                  <Edit className='h-4 w-4' />
                  <span>Bulk Edit Pricing</span>
                </Button>
                <Button
                  onClick={handleCreate}
                  className='flex items-center space-x-2'>
                  <Plus className='h-4 w-4' />
                  <span>Create Service</span>
                </Button>
              </>
            )}
            {isBulkEditMode && (
              <>
                <Button
                  onClick={() => {
                    setIsBulkEditMode(false);
                    setBulkEditData({});
                  }}
                  variant='outline'>
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkSave}
                  className='flex items-center space-x-2'>
                  <Save className='h-4 w-4' />
                  <span>Save All</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-red-600'>{error}</p>
          </div>
        )}

        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <Label>Search</Label>
                <div className='relative'>
                  <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Search services...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <div>
                <Label>Service Type</Label>
                <select
                  value={serviceTypeFilter}
                  onChange={(e) => setServiceTypeFilter(e.target.value)}
                  className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                  <option value='all'>All Types</option>
                  {SERVICE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                  <option value='all'>All Status</option>
                  <option value='active'>Active</option>
                  <option value='inactive'>Inactive</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services ({totalServices})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {services.map((service) => (
                <div
                  key={service._id}
                  className='border rounded-lg p-4 hover:bg-gray-50'>
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <h3 className='text-lg font-semibold'>
                          {service.name}
                        </h3>
                        <Badge
                          variant={service.isActive ? "default" : "secondary"}>
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant='outline'>
                          {
                            SERVICE_TYPES.find(
                              (t) => t.value === service.serviceType
                            )?.label
                          }
                        </Badge>
                        {service.category && (
                          <Badge variant='outline'>{service.category}</Badge>
                        )}
                      </div>
                      <p className='text-gray-500 text-sm mb-2'>
                        ID: {service.serviceId}
                      </p>
                      {isBulkEditMode ? (
                        <div className='flex items-center gap-4'>
                          <div className='flex items-center gap-2'>
                            <Label className='w-20'>Price:</Label>
                            <Input
                              type='number'
                              value={
                                bulkEditData[service._id]?.price ||
                                service.price
                              }
                              onChange={(e) =>
                                setBulkEditData({
                                  ...bulkEditData,
                                  [service._id]: {
                                    ...bulkEditData[service._id],
                                    price: e.target.value,
                                  },
                                })
                              }
                              className='w-32'
                            />
                          </div>
                          <div className='flex items-center gap-2'>
                            <Label className='w-24'>Original:</Label>
                            <Input
                              type='number'
                              value={
                                bulkEditData[service._id]?.originalPrice ||
                                service.originalPrice ||
                                service.price
                              }
                              onChange={(e) =>
                                setBulkEditData({
                                  ...bulkEditData,
                                  [service._id]: {
                                    ...bulkEditData[service._id],
                                    originalPrice: e.target.value,
                                  },
                                })
                              }
                              className='w-32'
                            />
                          </div>
                        </div>
                      ) : (
                        <div className='flex items-center gap-1'>
                          <IndianRupee className='h-4 w-4' />
                          <span className='font-semibold text-lg'>
                            {service.price}
                          </span>
                          {service.originalPrice &&
                            service.originalPrice > service.price && (
                              <span className='text-gray-400 line-through ml-2'>
                                {service.originalPrice}
                              </span>
                            )}
                        </div>
                      )}
                    </div>
                    {!isBulkEditMode && (
                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleEdit(service)}>
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleToggleStatus(service._id)}>
                          {service.isActive ? (
                            <PowerOff className='h-4 w-4' />
                          ) : (
                            <Power className='h-4 w-4' />
                          )}
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleDelete(service._id)}
                          className='text-red-600 hover:text-red-700'>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <div className='text-center py-12'>
                  <Package className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>No services found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='max-w-lg'>
            <DialogHeader>
              <DialogTitle>
                {selectedService ? "Edit Service" : "Create Service"}
              </DialogTitle>
              <DialogDescription>
                {selectedService
                  ? "Update the service details and pricing"
                  : "Add a new service with pricing"}
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div>
                <Label>Service ID *</Label>
                <Input
                  value={formData.serviceId}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceId: e.target.value })
                  }
                  disabled={!!selectedService}
                  placeholder='e.g., cough, diabetes, infant-care'
                />
              </div>
              <div>
                <Label>Service Type *</Label>
                <select
                  value={formData.serviceType}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceType: e.target.value })
                  }
                  className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                  <option value=''>Select service type</option>
                  {SERVICE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder='Service name'
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder='Optional category'
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>Price (₹) *</Label>
                  <Input
                    type='number'
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder='0'
                  />
                </div>
                <div>
                  <Label>Original Price (₹)</Label>
                  <Input
                    type='number'
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        originalPrice: e.target.value,
                      })
                    }
                    placeholder='Same as price if not on discount'
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {selectedService ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
