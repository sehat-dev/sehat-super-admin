'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  ArrowLeft, 
  ArrowRight, 
  Check,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { superAdminAPI } from '@/lib/api';

// Step-by-step form schemas
const step1Schema = z.object({
  organizationId: z.string()
    .min(3, 'Organization ID must be at least 3 characters')
    .max(50, 'Organization ID must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Organization ID can only contain lowercase letters, numbers, and hyphens'),
  name: z.string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters'),
  logo: z.string().optional(),
});

const step2Schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number must be less than 20 characters'),
});

const step3Schema = z.object({
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  zipCode: z.string().min(3, 'ZIP code is required'),
});

const step4Schema = z.object({
  maxUsers: z.number().min(1, 'Must have at least 1 user'),
  maxDoctors: z.number().min(1, 'Must have at least 1 doctor'),
});

const step5Schema = z.object({
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;
type Step5Data = z.infer<typeof step5Schema>;

interface FormData extends Step1Data, Step2Data, Step3Data, Step4Data, Step5Data {}

const steps = [
  { id: 1, title: 'Basic Information', description: 'Organization ID and name' },
  { id: 2, title: 'Contact Details', description: 'Email and phone number' },
  { id: 3, title: 'Address', description: 'Physical address' },
  { id: 4, title: 'Capacity', description: 'User and doctor limits' },
  { id: 5, title: 'Security', description: 'Admin password' },
];

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Initialize forms with current form data
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      organizationId: formData.organizationId || '',
      name: formData.name || '',
      logo: formData.logo || '',
    },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      email: formData.email || '',
      phoneNumber: formData.phoneNumber || '',
    },
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      street: formData.street || '',
      city: formData.city || '',
      state: formData.state || '',
      country: formData.country || '',
      zipCode: formData.zipCode || '',
    },
  });

  const step4Form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      maxUsers: formData.maxUsers || 10,
      maxDoctors: formData.maxDoctors || 5,
    },
  });

  const step5Form = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      password: formData.password || '',
      confirmPassword: formData.confirmPassword || '',
    },
  });

  // Update form values when formData changes
  useEffect(() => {
    step1Form.reset({
      organizationId: formData.organizationId || '',
      name: formData.name || '',
      logo: formData.logo || '',
    });
  }, [formData.organizationId, formData.name, formData.logo]);

  useEffect(() => {
    step2Form.reset({
      email: formData.email || '',
      phoneNumber: formData.phoneNumber || '',
    });
  }, [formData.email, formData.phoneNumber]);

  useEffect(() => {
    step3Form.reset({
      street: formData.street || '',
      city: formData.city || '',
      state: formData.state || '',
      country: formData.country || '',
      zipCode: formData.zipCode || '',
    });
  }, [formData.street, formData.city, formData.state, formData.country, formData.zipCode]);

  useEffect(() => {
    step4Form.reset({
      maxUsers: formData.maxUsers || 10,
      maxDoctors: formData.maxDoctors || 5,
    });
  }, [formData.maxUsers, formData.maxDoctors]);

  useEffect(() => {
    step5Form.reset({
      password: formData.password || '',
      confirmPassword: formData.confirmPassword || '',
    });
  }, [formData.password, formData.confirmPassword]);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = async () => {
    let isValid = false;
    let stepData: Partial<FormData> = {};

    switch (currentStep) {
      case 1:
        isValid = await step1Form.trigger();
        if (isValid) {
          stepData = step1Form.getValues();
        }
        break;
      case 2:
        isValid = await step2Form.trigger();
        if (isValid) {
          stepData = step2Form.getValues();
        }
        break;
      case 3:
        isValid = await step3Form.trigger();
        if (isValid) {
          stepData = step3Form.getValues();
        }
        break;
      case 4:
        isValid = await step4Form.trigger();
        if (isValid) {
          stepData = step4Form.getValues();
        }
        break;
      case 5:
        isValid = await step5Form.trigger();
        if (isValid) {
          stepData = step5Form.getValues();
        }
        break;
    }

    if (isValid) {
      updateFormData(stepData);
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
        await handleSubmit();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get the current step's data first
      let currentStepData: Partial<FormData> = {};
      
      switch (currentStep) {
        case 1:
          currentStepData = step1Form.getValues();
          break;
        case 2:
          currentStepData = step2Form.getValues();
          break;
        case 3:
          currentStepData = step3Form.getValues();
          break;
        case 4:
          currentStepData = step4Form.getValues();
          break;
        case 5:
          currentStepData = step5Form.getValues();
          break;
      }

      // Merge with existing form data
      const finalData = { ...formData, ...currentStepData } as FormData;
      
      console.log('Final form data:', finalData); // Debug log
      
      // Transform FormData to match OrganizationData interface
      const organizationData = {
        organizationId: finalData.organizationId!,
        name: finalData.name!,
        logo: finalData.logo,
        email: finalData.email!,
        password: finalData.password!,
        phoneNumber: finalData.phoneNumber!,
        address: {
          street: finalData.street!,
          city: finalData.city!,
          state: finalData.state!,
          country: finalData.country!,
          zipCode: finalData.zipCode!,
        },
        maxUsers: finalData.maxUsers!,
        maxDoctors: finalData.maxDoctors!,
      };
      
      console.log('Organization data being sent:', { ...organizationData, password: '***' }); // Debug log
      
      // Make the API call to create the organization
      await superAdminAPI.createOrganization(organizationData);
      
      // Redirect to organizations list
      router.push('/dashboard/organizations');
    } catch (err: unknown) {
      console.error('Error creating organization:', err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError?.response?.data?.message || 'Failed to create organization. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="organizationId">Organization ID *</Label>
              <Input
                id="organizationId"
                placeholder="my-hospital"
                {...step1Form.register('organizationId')}
                className={step1Form.formState.errors.organizationId ? 'border-red-500' : ''}
              />
              {step1Form.formState.errors.organizationId && (
                <p className="text-sm text-red-500 mt-1">
                  {step1Form.formState.errors.organizationId.message}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                This will be used as the unique identifier for your organization. 
                Only lowercase letters, numbers, and hyphens are allowed.
              </p>
            </div>

            <div>
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                placeholder="My Hospital"
                {...step1Form.register('name')}
                className={step1Form.formState.errors.name ? 'border-red-500' : ''}
              />
              {step1Form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {step1Form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="logo">Logo URL (Optional)</Label>
              <Input
                id="logo"
                placeholder="https://example.com/logo.png"
                {...step1Form.register('logo')}
              />
              <p className="text-sm text-gray-500 mt-1">
                Provide a URL to your organization&apos;s logo
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@myhospital.com"
                {...step2Form.register('email')}
                className={step2Form.formState.errors.email ? 'border-red-500' : ''}
              />
              {step2Form.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {step2Form.formState.errors.email.message}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                This will be the admin email for the organization
              </p>
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                placeholder="+1-555-0123"
                {...step2Form.register('phoneNumber')}
                className={step2Form.formState.errors.phoneNumber ? 'border-red-500' : ''}
              />
              {step2Form.formState.errors.phoneNumber && (
                <p className="text-sm text-red-500 mt-1">
                  {step2Form.formState.errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                placeholder="123 Medical Center Dr"
                {...step3Form.register('street')}
                className={step3Form.formState.errors.street ? 'border-red-500' : ''}
              />
              {step3Form.formState.errors.street && (
                <p className="text-sm text-red-500 mt-1">
                  {step3Form.formState.errors.street.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="New York"
                  {...step3Form.register('city')}
                  className={step3Form.formState.errors.city ? 'border-red-500' : ''}
                />
                {step3Form.formState.errors.city && (
                  <p className="text-sm text-red-500 mt-1">
                    {step3Form.formState.errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="NY"
                  {...step3Form.register('state')}
                  className={step3Form.formState.errors.state ? 'border-red-500' : ''}
                />
                {step3Form.formState.errors.state && (
                  <p className="text-sm text-red-500 mt-1">
                    {step3Form.formState.errors.state.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  placeholder="USA"
                  {...step3Form.register('country')}
                  className={step3Form.formState.errors.country ? 'border-red-500' : ''}
                />
                {step3Form.formState.errors.country && (
                  <p className="text-sm text-red-500 mt-1">
                    {step3Form.formState.errors.country.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  placeholder="10001"
                  {...step3Form.register('zipCode')}
                  className={step3Form.formState.errors.zipCode ? 'border-red-500' : ''}
                />
                {step3Form.formState.errors.zipCode && (
                  <p className="text-sm text-red-500 mt-1">
                    {step3Form.formState.errors.zipCode.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxUsers">Maximum Users *</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  placeholder="50"
                  {...step4Form.register('maxUsers', { valueAsNumber: true })}
                  className={step4Form.formState.errors.maxUsers ? 'border-red-500' : ''}
                />
                {step4Form.formState.errors.maxUsers && (
                  <p className="text-sm text-red-500 mt-1">
                    {step4Form.formState.errors.maxUsers.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="maxDoctors">Maximum Doctors *</Label>
                <Input
                  id="maxDoctors"
                  type="number"
                  placeholder="20"
                  {...step4Form.register('maxDoctors', { valueAsNumber: true })}
                  className={step4Form.formState.errors.maxDoctors ? 'border-red-500' : ''}
                />
                {step4Form.formState.errors.maxDoctors && (
                  <p className="text-sm text-red-500 mt-1">
                    {step4Form.formState.errors.maxDoctors.message}
                  </p>
                )}
              </div>
            </div>


          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="password">Admin Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  {...step5Form.register('password')}
                  className={step5Form.formState.errors.password ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {step5Form.formState.errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {step5Form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  {...step5Form.register('confirmPassword')}
                  className={step5Form.formState.errors.confirmPassword ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {step5Form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {step5Form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Alert>
              <AlertDescription>
                This password will be used by the organization admin to log into their account. 
                Make sure to share this securely with the organization.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Organizations', href: '/dashboard/organizations' },
            { label: 'Create Organization' }
          ]} 
          className="mb-6"
        />

        {/* Page Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/dashboard/organizations">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Organizations
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Organization</h1>
            <p className="text-gray-600 mt-2">
              Set up a new healthcare organization account
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Step {currentStep}: {steps[currentStep - 1].title}</span>
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={(e) => e.preventDefault()}>
              {renderStepContent()}

              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : currentStep === 5 ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Create Organization
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 