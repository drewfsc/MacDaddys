'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  category: 'food' | 'interior' | 'team' | 'exterior';
  order: number;
  createdAt: string;
}

interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  image?: string;
}

const categories = ['food', 'interior', 'team', 'exterior'] as const;

export default function GalleryManagement() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bulk selection state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState<typeof categories[number]>('food');
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Menu items for "Set as menu photo" feature
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('');
  const [settingMenuPhoto, setSettingMenuPhoto] = useState(false);

  // Image rotation state
  const [pendingRotation, setPendingRotation] = useState<number>(0);
  const [isRotating, setIsRotating] = useState(false);

  // Upload form state
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadCategory, setUploadCategory] = useState<typeof categories[number]>('interior');

  useEffect(() => {
    fetchGallery();
    fetchMenuItems();
  }, []);

  const fetchGallery = async () => {
    try {
      // Cache-bust to ensure fresh data after uploads
      const res = await fetch(`/api/gallery?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setImages(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (data.success && data.data?.categories) {
        // Flatten all menu items with their category info
        const items: MenuItem[] = [];
        for (const category of data.data.categories) {
          for (const item of category.items || []) {
            items.push({
              id: item.id,
              name: item.name,
              categoryId: category.id,
              categoryName: category.name,
              image: item.image,
            });
          }
        }
        setMenuItems(items);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  // Filtered images (computed before functions that use it)
  // Also filter out any images with invalid/missing URLs to prevent broken placeholders
  const validImages = images.filter((img) => img.url && img.url.trim() !== '');
  const filteredImages = filter === 'all'
    ? validImages
    : validImages.filter((img) => img.category === filter);

  // Toggle image selection
  const toggleImageSelection = (imageId: string) => {
    setSelectedImages((prev) => {
      const next = new Set(prev);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }
      return next;
    });
  };

  // Select/deselect all visible images
  const toggleSelectAll = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredImages.map((img) => img.id)));
    }
  };

  // Bulk update category
  const handleBulkCategorize = async () => {
    if (selectedImages.size === 0) return;

    setBulkUpdating(true);
    const totalSelected = selectedImages.size;

    // Optimistic UI: update local state immediately
    setImages((prevImages) =>
      prevImages.map((img) =>
        selectedImages.has(img.id)
          ? { ...img, category: bulkCategory }
          : img
      )
    );

    let successCount = 0;
    for (const imageId of selectedImages) {
      try {
        const res = await fetch('/api/gallery', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: imageId, category: bulkCategory }),
        });
        if (res.ok) successCount++;
      } catch (error) {
        console.error(`Failed to update ${imageId}:`, error);
      }
    }

    setSelectedImages(new Set());
    setSelectMode(false);
    setBulkUpdating(false);

    if (successCount < totalSelected) {
      showToast(`Updated ${successCount} of ${totalSelected} images`, 'error');
    } else {
      showToast(`Updated ${successCount} image${successCount > 1 ? 's' : ''} to "${bulkCategory}"`, 'success');
    }
  };

  // Bulk delete selected images
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;

    const confirmed = await confirm({
      title: 'DELETE SELECTED IMAGES',
      message: `Are you sure you want to delete ${selectedImages.size} image${selectedImages.size > 1 ? 's' : ''}? This action cannot be undone.`,
      confirmText: 'DELETE ALL',
      cancelText: 'CANCEL',
      confirmStyle: 'danger',
    });

    if (!confirmed) return;

    setBulkDeleting(true);
    const totalSelected = selectedImages.size;

    // Optimistic UI: remove from local state immediately
    const previousImages = images;
    setImages((prev) => prev.filter((img) => !selectedImages.has(img.id)));

    try {
      // Single API call to delete all selected images
      const res = await fetch('/api/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedImages) }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`Successfully deleted ${data.deletedCount} image${data.deletedCount > 1 ? 's' : ''}`, 'success');
      } else {
        // Rollback on failure
        setImages(previousImages);
        showToast(`Failed to delete images: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      // Rollback on error
      setImages(previousImages);
      console.error('Bulk delete error:', error);
      showToast('Failed to delete images', 'error');
    }

    setSelectedImages(new Set());
    setSelectMode(false);
    setBulkDeleting(false);
  };

  // Set image as menu item photo
  const handleSetAsMenuPhoto = async () => {
    if (!editingImage || !selectedMenuItem) return;

    // Find the selected menu item to get its categoryId
    const menuItem = menuItems.find((item) => item.id === selectedMenuItem);
    if (!menuItem) {
      showToast('Menu item not found', 'error');
      return;
    }

    setSettingMenuPhoto(true);
    try {
      const res = await fetch('/api/menu/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: menuItem.categoryId,
          itemId: selectedMenuItem,
          updates: { image: editingImage.url },
        }),
      });

      if (res.ok) {
        await fetchMenuItems();
        showToast(`Image assigned to "${menuItem.name}"`, 'success');

        // Prompt to update gallery description with menu item name
        const shouldUpdateDescription = await confirm({
          title: 'UPDATE DESCRIPTION',
          message: `Would you like to update this gallery image's description to match the menu item name?\n\n"${menuItem.name}"`,
          confirmText: 'YES, UPDATE',
          cancelText: 'NO THANKS',
        });

        if (shouldUpdateDescription) {
          // Update the gallery image's alt text
          const galleryRes = await fetch('/api/gallery', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: editingImage.id,
              alt: menuItem.name,
            }),
          });

          if (galleryRes.ok) {
            // Update local state
            setEditingImage({ ...editingImage, alt: menuItem.name });
            await fetchGallery();
            showToast('Description updated', 'success');
          }
        }

        setSelectedMenuItem('');
      } else {
        const data = await res.json();
        showToast(`Failed to set menu photo: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error setting menu photo:', error);
      showToast('Failed to set menu photo', 'error');
    } finally {
      setSettingMenuPhoto(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    try {
      // Build a single FormData with all files for batch upload
      const formData = new FormData();
      formData.append('category', uploadCategory);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        formData.append('files', file);
        // Use custom alt if single file, otherwise use filename
        const altText = files.length === 1 && uploadAlt
          ? uploadAlt
          : file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        formData.append('alts', altText);
      }

      setUploadProgress({ current: files.length, total: files.length });

      const res = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      await fetchGallery();
      setUploadAlt('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (data.success) {
        const count = data.count || 1;
        showToast(`Successfully uploaded ${count} image${count > 1 ? 's' : ''}`, 'success');
      } else {
        showToast(`Upload failed: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload images', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'DELETE IMAGE',
      message: 'Are you sure you want to delete this image? This action cannot be undone.',
      confirmText: 'DELETE',
      cancelText: 'CANCEL',
      confirmStyle: 'danger',
    });

    if (!confirmed) return;

    // Optimistic UI: remove from local state immediately
    const previousImages = images;
    setImages((prev) => prev.filter((img) => img.id !== id));

    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Image deleted successfully', 'success');
      } else {
        // Rollback on failure
        setImages(previousImages);
        showToast('Failed to delete image', 'error');
      }
    } catch (error) {
      // Rollback on error
      setImages(previousImages);
      console.error('Delete error:', error);
      showToast('Failed to delete image', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!editingImage) return;

    try {
      // If there's a pending rotation, handle it first
      if (pendingRotation !== 0) {
        await handleRotateAndSave();
        return;
      }

      // Optimistic UI: update local state immediately
      // Explicitly preserve all fields, only update alt and category
      setImages((prevImages) =>
        prevImages.map((img) =>
          img.id === editingImage.id
            ? {
                id: img.id,
                url: img.url,
                alt: editingImage.alt,
                category: editingImage.category,
                order: img.order,
                createdAt: img.createdAt,
              }
            : img
        )
      );

      const previousEditingImage = editingImage;
      setEditingImage(null);
      setPendingRotation(0);

      const res = await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: previousEditingImage.id,
          alt: previousEditingImage.alt,
          category: previousEditingImage.category,
        }),
      });

      if (res.ok) {
        showToast('Image updated successfully', 'success');
      } else {
        showToast('Failed to update image', 'error');
      }
    } catch (error) {
      console.error('Update error:', error);
      showToast('Failed to update image', 'error');
    }
  };

  // Rotate image using canvas and save
  const handleRotateAndSave = async () => {
    if (!editingImage || pendingRotation === 0) return;

    setIsRotating(true);

    try {
      // Load the image
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = editingImage.url;
      });

      // Create canvas with rotated dimensions
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // For 90/270 rotation, swap width and height
      const isVerticalRotation = pendingRotation === 90 || pendingRotation === 270;
      canvas.width = isVerticalRotation ? img.height : img.width;
      canvas.height = isVerticalRotation ? img.width : img.height;

      // Move to center, rotate, then draw image centered
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((pendingRotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to create blob'));
          },
          'image/jpeg',
          0.92
        );
      });

      // Upload rotated image
      const formData = new FormData();
      formData.append('file', blob, 'rotated.jpg');
      formData.append('imageId', editingImage.id);

      const res = await fetch('/api/gallery/rotate', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        const newImageData = data.data;

        // Also update alt/category if changed
        if (editingImage.alt !== newImageData.alt || editingImage.category !== newImageData.category) {
          await fetch('/api/gallery', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: editingImage.id,
              alt: editingImage.alt,
              category: editingImage.category,
            }),
          });
          // Update local data with edited values
          newImageData.alt = editingImage.alt;
          newImageData.category = editingImage.category;
        }

        // Update local state directly with new URL to avoid caching issues
        setImages((prevImages) =>
          prevImages.map((img) =>
            img.id === editingImage.id
              ? { ...img, url: newImageData.url, alt: newImageData.alt, category: newImageData.category }
              : img
          )
        );

        setEditingImage(null);
        setPendingRotation(0);
        showToast('Image rotated successfully', 'success');
      } else {
        showToast(`Failed to rotate: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Rotation error:', error);
      showToast('Failed to rotate image', 'error');
    } finally {
      setIsRotating(false);
    }
  };

  // Rotate left (counter-clockwise)
  const rotateLeft = () => {
    setPendingRotation((prev) => (prev - 90 + 360) % 360);
  };

  // Rotate right (clockwise)
  const rotateRight = () => {
    setPendingRotation((prev) => (prev + 90) % 360);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 font-headline text-xl animate-pulse">
          Loading gallery...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl text-[#1a1a1a]">Gallery Management</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-500">{validImages.length} images</span>
          <button
            onClick={() => {
              setSelectMode(!selectMode);
              setSelectedImages(new Set());
            }}
            className={`font-headline text-sm tracking-wider px-4 py-2 rounded transition-colors ${
              selectMode
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border'
            }`}
          >
            {selectMode ? 'CANCEL' : 'SELECT'}
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectMode && (
        <div className="bg-gray-800 text-white rounded-lg p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSelectAll}
              className="font-headline text-sm tracking-wider px-3 py-1 rounded border border-white/30 hover:bg-white/10 transition-colors"
            >
              {selectedImages.size === filteredImages.length ? 'DESELECT ALL' : 'SELECT ALL'}
            </button>
            <span className="text-gray-300">
              {selectedImages.size} of {filteredImages.length} selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value as typeof categories[number])}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-[#C41E3A]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={handleBulkCategorize}
              disabled={selectedImages.size === 0 || bulkUpdating || bulkDeleting}
              className="font-headline text-sm tracking-wider px-4 py-2 bg-[#C41E3A] rounded hover:bg-[#a01830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {bulkUpdating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  UPDATING...
                </>
              ) : (
                'SET CATEGORY'
              )}
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedImages.size === 0 || bulkUpdating || bulkDeleting}
              className="font-headline text-sm tracking-wider px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {bulkDeleting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  DELETING...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  DELETE
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="font-headline text-xl tracking-wider mb-4">UPLOAD NEW IMAGE</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block font-headline text-sm text-gray-600 mb-1">CATEGORY</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as typeof categories[number])}
              className="w-full px-3 py-2 border rounded focus:border-[#C41E3A] focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block font-headline text-sm text-gray-600 mb-1">DESCRIPTION</label>
            <input
              type="text"
              value={uploadAlt}
              onChange={(e) => setUploadAlt(e.target.value)}
              placeholder="e.g., Classic burger and fries"
              className="w-full px-3 py-2 border rounded focus:border-[#C41E3A] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-headline text-sm text-gray-600 mb-1">IMAGE</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
              id="gallery-upload"
            />
            <label
              htmlFor="gallery-upload"
              className={`flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#C41E3A] text-white rounded cursor-pointer hover:bg-[#a01830] transition-colors ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {uploadProgress && uploadProgress.total > 1
                    ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...`
                    : 'Uploading...'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Select Images
                </>
              )}
            </label>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">JPEG, PNG, WebP, or AVIF. Max 10MB each. Select multiple files for bulk upload.</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`font-headline text-sm tracking-wider px-4 py-2 rounded transition-colors ${
              filter === cat
                ? 'bg-[#C41E3A] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">No images yet. Upload your first image above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div
              key={`${image.id}-${image.url}`}
              className={`bg-white rounded-lg shadow-sm overflow-hidden group relative ${
                selectMode ? 'cursor-pointer' : ''
              } ${selectedImages.has(image.id) ? 'ring-2 ring-[#C41E3A]' : ''}`}
              onClick={selectMode ? () => toggleImageSelection(image.id) : undefined}
            >
              {/* Selection Checkbox */}
              {selectMode && (
                <div className="absolute top-2 left-2 z-10">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedImages.has(image.id)
                        ? 'bg-[#C41E3A] border-[#C41E3A]'
                        : 'bg-white/80 border-gray-400'
                    }`}
                  >
                    {selectedImages.has(image.id) && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              )}
              <div className="relative aspect-square">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />
                {!selectMode && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setEditingImage(image);
                        setPendingRotation(0);
                      }}
                      className="p-2 bg-white rounded-full mr-2 hover:bg-gray-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="p-2 bg-white rounded-full hover:bg-red-50"
                    >
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div className="p-3">
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded mb-1">
                  {image.category}
                </span>
                <p className="text-sm text-gray-600 truncate">{image.alt}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-headline text-2xl mb-4">EDIT IMAGE</h2>

            <div className="relative aspect-video mb-4 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={editingImage.url}
                alt={editingImage.alt}
                fill
                sizes="400px"
                className="object-contain transition-transform duration-300"
                style={{ transform: `rotate(${pendingRotation}deg)` }}
              />
            </div>

            {/* Rotation Controls */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={rotateLeft}
                disabled={isRotating}
                className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Rotate left (counter-clockwise)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span className="font-headline text-sm">ROTATE LEFT</span>
              </button>
              <button
                onClick={rotateRight}
                disabled={isRotating}
                className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Rotate right (clockwise)"
              >
                <span className="font-headline text-sm">ROTATE RIGHT</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>
            {pendingRotation !== 0 && (
              <p className="text-center text-sm text-gray-500 mb-4">
                Rotation: {pendingRotation}° (will be applied on save)
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block font-headline text-sm text-gray-600 mb-1">DESCRIPTION</label>
                <input
                  type="text"
                  value={editingImage.alt}
                  onChange={(e) => setEditingImage({ ...editingImage, alt: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:border-[#C41E3A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-headline text-sm text-gray-600 mb-1">CATEGORY</label>
                <select
                  value={editingImage.category}
                  onChange={(e) => setEditingImage({ ...editingImage, category: e.target.value as typeof categories[number] })}
                  className="w-full px-3 py-2 border rounded focus:border-[#C41E3A] focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Set as Menu Item Photo */}
              <div className="border-t pt-4 mt-4">
                <label className="block font-headline text-sm text-gray-600 mb-1">SET AS MENU ITEM PHOTO</label>
                <p className="text-xs text-gray-400 mb-2">Assign this image to a menu item</p>
                <div className="flex gap-2">
                  <select
                    value={selectedMenuItem}
                    onChange={(e) => setSelectedMenuItem(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded focus:border-[#C41E3A] focus:outline-none text-sm"
                  >
                    <option value="">Select a menu item...</option>
                    {menuItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.categoryName} - {item.name} {item.image ? '(has photo)' : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSetAsMenuPhoto}
                    disabled={!selectedMenuItem || settingMenuPhoto}
                    className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {settingMenuPhoto ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Assign
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingImage(null);
                  setSelectedMenuItem('');
                  setPendingRotation(0);
                }}
                disabled={isRotating}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isRotating}
                className="flex-1 px-4 py-2 bg-[#C41E3A] text-white rounded hover:bg-[#a01830] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isRotating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Rotating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
