"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Plus,
  Search,
  Edit,
  Trash2,
  Power,
  PowerOff,
  IndianRupee,
} from "lucide-react";
import Link from "next/link";
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
import { Textarea } from "@/components/ui/textarea";

interface ServicePackage {
  _id: string;
  packageId: string;
  serviceType: "care_center" | "health_mitra" | "health_checkup" | "lab_test";
  name: string;
  description: string;
  testsIncluded: string[];
  servicesIncluded: string[];
  price: number;
  originalPrice: number;
  category: string;
  subCategory?: string;
  duration?: number;
  preparationInstructions?: string[];
  tags?: string[];
  popularity: number;
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

export default function ServicePackagesPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [totalPackages, setTotalPackages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(
    null
  );
  const [formData, setFormData] = useState<any>({
    packageId: "",
    serviceType: "",
    name: "",
    description: "",
    testsIncluded: "",
    servicesIncluded: "",
    price: "",
    originalPrice: "",
    category: "",
    subCategory: "",
    duration: "",
    preparationInstructions: "",
    tags: "",
    popularity: "0",
    isActive: true,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch service packages from API
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await superAdminAPI.getAllServicePackages({
          page: 1,
          limit: 100,
          search: searchTerm || undefined,
          serviceType:
            serviceTypeFilter !== "all" ? serviceTypeFilter : undefined,
          isActive:
            statusFilter !== "all" ? statusFilter === "active" : undefined,
        });

        setPackages(response.data.packages);
        setTotalPackages(response.data.pagination.total);
      } catch (err: unknown) {
        console.error("Error fetching service packages:", err);
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        const errorMessage =
          axiosError?.response?.data?.message ||
          "Failed to fetch service packages";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [
    searchTerm,
    serviceTypeFilter,
    statusFilter,
    authLoading,
    isAuthenticated,
  ]);

  const handleCreate = () => {
    setSelectedPackage(null);
    setFormData({
      packageId: "",
      serviceType: "",
      name: "",
      description: "",
      testsIncluded: "",
      servicesIncluded: "",
      price: "",
      originalPrice: "",
      category: "",
      subCategory: "",
      duration: "",
      preparationInstructions: "",
      tags: "",
      popularity: "0",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (pkg: ServicePackage) => {
    setSelectedPackage(pkg);
    setFormData({
      packageId: pkg.packageId,
      serviceType: pkg.serviceType,
      name: pkg.name,
      description: pkg.description,
      testsIncluded: pkg.testsIncluded.join("\n"),
      servicesIncluded: pkg.servicesIncluded.join("\n"),
      price: pkg.price.toString(),
      originalPrice: pkg.originalPrice.toString(),
      category: pkg.category,
      subCategory: pkg.subCategory || "",
      duration: pkg.duration?.toString() || "",
      preparationInstructions: pkg.preparationInstructions?.join("\n") || "",
      tags: pkg.tags?.join(", ") || "",
      popularity: pkg.popularity.toString(),
      isActive: pkg.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const packageData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice:
          parseFloat(formData.originalPrice) || parseFloat(formData.price),
        testsIncluded: formData.testsIncluded
          .split("\n")
          .filter((s: string) => s.trim()),
        servicesIncluded: formData.servicesIncluded
          .split("\n")
          .filter((s: string) => s.trim()),
        preparationInstructions: formData.preparationInstructions
          ? formData.preparationInstructions
              .split("\n")
              .filter((s: string) => s.trim())
          : [],
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((s: string) => s.trim())
              .filter((s: string) => s)
          : [],
        popularity: parseInt(formData.popularity) || 0,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        subCategory: formData.subCategory || undefined,
      };

      if (selectedPackage) {
        await superAdminAPI.updateServicePackage(
          selectedPackage._id,
          packageData
        );
      } else {
        await superAdminAPI.createServicePackage(packageData);
      }

      setIsDialogOpen(false);
      // Refresh the list
      window.location.reload();
    } catch (err: any) {
      console.error("Error saving service package:", err);
      alert(err.response?.data?.message || "Failed to save service package");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service package?")) {
      return;
    }

    try {
      await superAdminAPI.deleteServicePackage(id);
      window.location.reload();
    } catch (err: any) {
      console.error("Error deleting service package:", err);
      alert(err.response?.data?.message || "Failed to delete service package");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await superAdminAPI.toggleServicePackageStatus(id);
      window.location.reload();
    } catch (err: any) {
      console.error("Error toggling status:", err);
      alert(err.response?.data?.message || "Failed to update status");
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
              <p className='text-gray-600'>Loading service packages...</p>
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
          items={[
            { label: "Service Packages", href: "/dashboard/service-packages" },
          ]}
          className='mb-6'
        />

        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Service Packages
            </h1>
            <p className='text-gray-600 mt-2'>
              Manage service packages and pricing for all service types
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className='flex items-center space-x-2'>
            <Plus className='h-4 w-4' />
            <span>Create Package</span>
          </Button>
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
                    placeholder='Search packages...'
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
            <CardTitle>Service Packages ({totalPackages})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {packages.map((pkg) => (
                <div
                  key={pkg._id}
                  className='border rounded-lg p-4 hover:bg-gray-50'>
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <h3 className='text-lg font-semibold'>{pkg.name}</h3>
                        <Badge variant={pkg.isActive ? "default" : "secondary"}>
                          {pkg.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant='outline'>
                          {
                            SERVICE_TYPES.find(
                              (t) => t.value === pkg.serviceType
                            )?.label
                          }
                        </Badge>
                        <Badge variant='outline'>{pkg.category}</Badge>
                      </div>
                      <p className='text-gray-600 mb-2'>{pkg.description}</p>
                      <div className='flex items-center gap-4 text-sm'>
                        <div className='flex items-center gap-1'>
                          <IndianRupee className='h-4 w-4' />
                          <span className='font-semibold text-lg'>
                            {pkg.price}
                          </span>
                          {pkg.originalPrice > pkg.price && (
                            <span className='text-gray-400 line-through ml-2'>
                              {pkg.originalPrice}
                            </span>
                          )}
                        </div>
                        {pkg.duration && (
                          <span className='text-gray-500'>
                            Duration: {pkg.duration} min
                          </span>
                        )}
                        <span className='text-gray-500'>
                          Popularity: {pkg.popularity}
                        </span>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEdit(pkg)}>
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleToggleStatus(pkg._id)}>
                        {pkg.isActive ? (
                          <PowerOff className='h-4 w-4' />
                        ) : (
                          <Power className='h-4 w-4' />
                        )}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDelete(pkg._id)}
                        className='text-red-600 hover:text-red-700'>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {packages.length === 0 && (
                <div className='text-center py-12'>
                  <ShoppingCart className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>No service packages found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>
                {selectedPackage
                  ? "Edit Service Package"
                  : "Create Service Package"}
              </DialogTitle>
              <DialogDescription>
                {selectedPackage
                  ? "Update the service package details"
                  : "Add a new service package"}
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>Package ID *</Label>
                  <Input
                    value={formData.packageId}
                    onChange={(e) =>
                      setFormData({ ...formData, packageId: e.target.value })
                    }
                    disabled={!!selectedPackage}
                    placeholder='e.g., HC-BASIC-001'
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
              </div>
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder='Service package name'
                />
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder='Service package description'
                  rows={3}
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
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>Category *</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder='e.g., Basic, Comprehensive'
                  />
                </div>
                <div>
                  <Label>Sub Category</Label>
                  <Input
                    value={formData.subCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, subCategory: e.target.value })
                    }
                    placeholder='Optional sub category'
                  />
                </div>
              </div>
              <div>
                <Label>Tests Included (one per line)</Label>
                <Textarea
                  value={formData.testsIncluded}
                  onChange={(e) =>
                    setFormData({ ...formData, testsIncluded: e.target.value })
                  }
                  placeholder='Test 1&#10;Test 2&#10;Test 3'
                  rows={4}
                />
              </div>
              <div>
                <Label>Services Included (one per line)</Label>
                <Textarea
                  value={formData.servicesIncluded}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      servicesIncluded: e.target.value,
                    })
                  }
                  placeholder='Service 1&#10;Service 2&#10;Service 3'
                  rows={4}
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type='number'
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder='e.g., 60'
                  />
                </div>
                <div>
                  <Label>Popularity</Label>
                  <Input
                    type='number'
                    value={formData.popularity}
                    onChange={(e) =>
                      setFormData({ ...formData, popularity: e.target.value })
                    }
                    placeholder='0-100'
                  />
                </div>
              </div>
              <div>
                <Label>Preparation Instructions (one per line)</Label>
                <Textarea
                  value={formData.preparationInstructions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preparationInstructions: e.target.value,
                    })
                  }
                  placeholder='Instruction 1&#10;Instruction 2'
                  rows={3}
                />
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder='tag1, tag2, tag3'
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {selectedPackage ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
