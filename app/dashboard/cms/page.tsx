"use client";

import { useState, useEffect, useCallback } from "react";
import { superAdminAPI } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, X, RefreshCw, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ContentType =
  | "dashboard_advertisement"
  | "dashboard_offers"
  | "health_mitra_banner"
  | "care_center_ad"
  | "child_care_qa"
  | "child_care_health_tips"
  | "pregnancy_care_food"
  | "pregnancy_care_articles"
  | "pregnancy_care_qa"
  | "pregnancy_care_medicines"
  | "pregnancy_care_exercise"
  | "pregnancy_care_hospitals"
  | "pregnancy_care_mothers_health";

interface CMSContent {
  _id: string;
  contentType: ContentType;
  content: unknown[]; // Array of items matching local structure
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "dashboard_advertisement", label: "Dashboard Advertisement" },
  { value: "dashboard_offers", label: "Dashboard Offers" },
  { value: "health_mitra_banner", label: "Health Mitra Banner" },
  { value: "care_center_ad", label: "Care Center Ad" },
  { value: "child_care_qa", label: "Child Care Q&A" },
  { value: "child_care_health_tips", label: "Child Care Health Tips" },
  { value: "pregnancy_care_food", label: "Pregnancy Care - Food" },
  { value: "pregnancy_care_articles", label: "Pregnancy Care - Articles" },
  { value: "pregnancy_care_qa", label: "Pregnancy Care - Q&A" },
  { value: "pregnancy_care_medicines", label: "Pregnancy Care - Medicines" },
  { value: "pregnancy_care_exercise", label: "Pregnancy Care - Exercise" },
  { value: "pregnancy_care_hospitals", label: "Pregnancy Care - Hospitals" },
  {
    value: "pregnancy_care_mothers_health",
    label: "Pregnancy Care - Mothers Health",
  },
];

export default function CMSPage() {
  const [contents, setContents] = useState<CMSContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<CMSContent | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const fetchContents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await superAdminAPI.getAllCMSContent({});
      if (response.success) {
        setContents(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching CMS content:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const handleEdit = (content: CMSContent) => {
    setSelectedContent(content);
    setJsonContent(JSON.stringify(content.content, null, 2));
    setJsonError(null);
    setIsDialogOpen(true);
  };

  const handleCreate = (contentType: ContentType) => {
    setSelectedContent(null);
    setJsonContent("[]");
    setJsonError(null);
    setIsDialogOpen(true);
    // Temporarily set content type in state for create
    setSelectedContent({
      _id: "",
      contentType,
      content: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as CMSContent);
  };

  const validateJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        setJsonError("Content must be a JSON array");
        return false;
      }
      setJsonError(null);
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid JSON";
      setJsonError(`Invalid JSON: ${errorMessage}`);
      return false;
    }
  };

  const handleSave = async () => {
    if (!selectedContent) return;

    if (!validateJSON(jsonContent)) {
      return;
    }

    try {
      const parsedContent = JSON.parse(jsonContent);

      const data = {
        contentType: selectedContent.contentType,
        content: parsedContent,
        isActive: selectedContent.isActive,
      };

      if (selectedContent._id) {
        // Update existing
        await superAdminAPI.updateCMSContent(selectedContent._id, data);
      } else {
        // Create new
        await superAdminAPI.createCMSContent(data);
      }
      setIsDialogOpen(false);
      fetchContents();
    } catch (error: unknown) {
      console.error("Error saving content:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to save content: ${errorMessage}`);
    }
  };

  const toggleActive = async (content: CMSContent) => {
    try {
      await superAdminAPI.updateCMSContent(content._id, {
        isActive: !content.isActive,
      });
      fetchContents();
    } catch (error) {
      console.error("Error toggling active status:", error);
      alert("Failed to update status");
    }
  };

  // Get content for a specific type or create placeholder
  const getContentForType = (contentType: ContentType): CMSContent | null => {
    return contents.find((c) => c.contentType === contentType) || null;
  };

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>CMS Management</h1>
            <p className='text-gray-600 mt-1'>
              Manage content arrays for each section. Edit JSON arrays that
              match local data structure.
            </p>
          </div>
          <Button variant='outline' onClick={fetchContents}>
            <RefreshCw className='w-4 h-4 mr-2' />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className='text-center py-12'>Loading...</div>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {CONTENT_TYPES.map((type) => {
              const content = getContentForType(type.value);
              const itemCount = content?.content?.length || 0;

              return (
                <Card key={type.value}>
                  <CardHeader>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <CardTitle className='text-lg mb-2'>
                          {type.label}
                        </CardTitle>
                        <div className='flex items-center gap-2'>
                          {content && (
                            <Badge
                              variant={
                                content.isActive ? "default" : "secondary"
                              }>
                              {content.isActive ? "Active" : "Inactive"}
                            </Badge>
                          )}
                          <Badge variant='outline'>
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      {content && (
                        <div className='text-sm text-gray-600'>
                          <p>
                            Last updated:{" "}
                            {new Date(content.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      <div className='flex gap-2'>
                        {content && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => toggleActive(content)}>
                            {content.isActive ? (
                              <>
                                <EyeOff className='w-4 h-4 mr-1' />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className='w-4 h-4 mr-1' />
                                Activate
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            content
                              ? handleEdit(content)
                              : handleCreate(type.value)
                          }
                          className='flex-1'>
                          {content ? "Edit" : "Create"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>
                {selectedContent?._id
                  ? `Edit ${
                      CONTENT_TYPES.find(
                        (t) => t.value === selectedContent?.contentType
                      )?.label
                    }`
                  : `Create ${
                      CONTENT_TYPES.find(
                        (t) => t.value === selectedContent?.contentType
                      )?.label
                    }`}
              </DialogTitle>
              <DialogDescription>
                Edit the JSON array content. The array should match the local
                data structure exactly.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label>Content Type</Label>
                <div className='mt-1 p-2 bg-gray-100 rounded-md text-sm font-medium'>
                  {CONTENT_TYPES.find(
                    (t) => t.value === selectedContent?.contentType
                  )?.label || selectedContent?.contentType}
                </div>
              </div>
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <Label>Content (JSON Array)</Label>
                  {jsonError && (
                    <span className='text-sm text-red-600'>{jsonError}</span>
                  )}
                </div>
                <Textarea
                  value={jsonContent}
                  onChange={(e) => {
                    setJsonContent(e.target.value);
                    if (jsonError) validateJSON(e.target.value);
                  }}
                  placeholder='[]'
                  rows={20}
                  className='font-mono text-sm'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Enter a valid JSON array. Each item in the array should match
                  the structure used in the app.
                </p>
              </div>
              {selectedContent && (
                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    id='isActive'
                    checked={selectedContent.isActive}
                    onChange={(e) =>
                      setSelectedContent({
                        ...selectedContent,
                        isActive: e.target.checked,
                      })
                    }
                    className='w-4 h-4'
                  />
                  <Label htmlFor='isActive'>Active</Label>
                </div>
              )}
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsDialogOpen(false);
                    setJsonError(null);
                  }}>
                  <X className='w-4 h-4 mr-2' />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className='w-4 h-4 mr-2' />
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
