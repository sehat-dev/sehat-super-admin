'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { Button } from './button';
import { Label } from './label';
import { Upload, Crop, X, Image as ImageIcon } from 'lucide-react';

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoSelected: (logoUrl: string) => void;
  currentLogo?: string;
}

export function LogoUploadModal({ isOpen, onClose, onLogoSelected, currentLogo }: LogoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // In a real implementation, you would upload to your backend/Cloudinary here
      // For now, we'll simulate the upload and use the preview URL
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay
      
      // Convert file to base64 for demo purposes
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        onLogoSelected(base64String);
        onClose();
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, onLogoSelected, onClose]);

  const handleRemoveLogo = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl('');
    onLogoSelected('');
    onClose();
  }, [onLogoSelected, onClose]);

  const handleClose = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl('');
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5" />
            <span>Organization Logo</span>
          </DialogTitle>
          <DialogDescription>
            Upload a 1:1 aspect ratio logo for your organization. Recommended size: 400x400 pixels.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Logo Display */}
          {currentLogo && !selectedFile && (
            <div className="text-center">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Current Logo</Label>
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={currentLogo} 
                  alt="Current logo" 
                  className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          {!selectedFile && (
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 mb-4">
                PNG, JPG, GIF up to 5MB
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleUploadClick}
                className="w-full"
              >
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          )}

          {/* Preview Area */}
          {selectedFile && (
            <div className="text-center">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Logo Preview</Label>
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={previewUrl} 
                  alt="Logo preview" 
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                  <Crop className="h-8 w-8 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {selectedFile && (
            <Button 
              onClick={handleConfirm} 
              disabled={isUploading}
              className="min-w-[100px]"
            >
              {isUploading ? 'Uploading...' : 'Confirm'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
