'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { MenuCategory, MenuItem } from '@/lib/types';

export default function MenuManagement() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (data.success && data.data) {
        setCategories(data.data.categories || []);
        if (data.data.categories?.length > 0 && !activeCategory) {
          setActiveCategory(data.data.categories[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (item: Partial<MenuItem>) => {
    if (!activeCategory) return;
    setSaving(true);

    try {
      const res = await fetch('/api/menu/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: activeCategory, item }),
      });

      if (res.ok) {
        await fetchMenu();
        setShowAddItem(false);
      }
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateItem = async (item: MenuItem) => {
    if (!activeCategory) return;
    setSaving(true);

    try {
      const res = await fetch('/api/menu/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: activeCategory,
          itemId: item.id,
          updates: item,
        }),
      });

      if (res.ok) {
        await fetchMenu();
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!activeCategory || !confirm('Delete this item?')) return;

    try {
      const res = await fetch(
        `/api/menu/items?categoryId=${activeCategory}&itemId=${itemId}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        await fetchMenu();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleAddCategory = async (category: Partial<MenuCategory>) => {
    setSaving(true);

    try {
      const res = await fetch('/api/menu/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });

      if (res.ok) {
        await fetchMenu();
        setShowAddCategory(false);
      }
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Delete this category and all its items?')) return;

    try {
      const res = await fetch(`/api/menu/categories?id=${categoryId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchMenu();
        if (activeCategory === categoryId) {
          setActiveCategory(categories[0]?.id || null);
        }
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const currentCategory = categories.find((c) => c.id === activeCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 font-headline text-xl animate-pulse">
          Loading menu...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl text-[#1a1a1a]">Menu Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="bg-blue-600 text-white font-headline tracking-wider px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            IMPORT
          </button>
          <button
            onClick={() => setShowAddCategory(true)}
            className="bg-[#C41E3A] text-white font-headline tracking-wider px-4 py-2 rounded hover:bg-[#a01830] transition-colors"
          >
            + ADD CATEGORY
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 bg-white p-4 rounded-lg shadow-sm">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center gap-1">
            <button
              onClick={() => setActiveCategory(category.id)}
              className={`font-headline tracking-wider px-4 py-2 rounded transition-colors ${
                activeCategory === category.id
                  ? 'bg-[#C41E3A] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name.toUpperCase()}
            </button>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="text-gray-400 hover:text-red-500 p-1"
              title="Delete category"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Items List */}
      {currentCategory && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-headline text-2xl tracking-wider">
                {currentCategory.name.toUpperCase()}
              </h2>
              {currentCategory.description && (
                <p className="text-gray-500">{currentCategory.description}</p>
              )}
            </div>
            <button
              onClick={() => setShowAddItem(true)}
              className="bg-green-600 text-white font-headline tracking-wider px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              + ADD ITEM
            </button>
          </div>

          <div className="divide-y">
            {currentCategory.items?.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No items in this category yet. Add your first item!
              </div>
            ) : (
              currentCategory.items?.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 flex items-center gap-4 hover:bg-gray-50 ${
                    item.available === false ? 'opacity-50' : ''
                  }`}
                >
                  {/* Item Image Thumbnail */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-headline text-lg">{item.name}</h3>
                      {item.image && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                          Has Image
                        </span>
                      )}
                      {item.popular && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">
                          Popular
                        </span>
                      )}
                      {item.featured && (
                        <span className="bg-[#C41E3A] text-white text-xs px-2 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                      {item.available === false && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                          Unavailable
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-gray-500 text-sm mt-1 truncate">{item.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="font-headline text-xl text-[#C41E3A]">
                      ${item.price.toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <ItemModal
          onClose={() => setShowAddItem(false)}
          onSave={handleAddItem}
          saving={saving}
        />
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <ItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleUpdateItem}
          saving={saving}
        />
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <CategoryModal
          onClose={() => setShowAddCategory(false)}
          onSave={handleAddCategory}
          saving={saving}
        />
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={async () => {}}
          saving={saving}
        />
      )}

      {/* Import Modal */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            setShowImport(false);
            fetchMenu();
          }}
        />
      )}
    </div>
  );
}

// Item Modal Component
function ItemModal({
  item,
  onClose,
  onSave,
  saving,
}: {
  item?: MenuItem;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState<Partial<MenuItem>>(
    item || {
      name: '',
      description: '',
      price: 0,
      popular: false,
      featured: false,
      available: true,
      image: '',
    }
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('itemId', formData.id || formData.name?.toLowerCase().replace(/\s+/g, '-') || 'item');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();

      if (data.success) {
        setFormData({ ...formData, image: data.data.url });
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!formData.image) return;

    // Optionally delete from Vercel Blob
    try {
      await fetch(`/api/upload?url=${encodeURIComponent(formData.image)}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting image:', error);
    }

    setFormData({ ...formData, image: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: formData.id || formData.name?.toLowerCase().replace(/\s+/g, '-') || '',
      name: formData.name || '',
      description: formData.description,
      price: Number(formData.price) || 0,
      popular: formData.popular,
      featured: formData.featured,
      available: formData.available,
      image: formData.image,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-md w-full p-6 my-8">
        <h2 className="font-headline text-2xl mb-4">
          {item ? 'EDIT ITEM' : 'ADD NEW ITEM'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block font-headline text-sm text-gray-600 mb-2">
              PHOTO
            </label>
            <div className="flex items-start gap-4">
              {/* Image Preview */}
              <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                {formData.image ? (
                  <Image
                    src={formData.image}
                    alt="Preview"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="image-upload"
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">{formData.image ? 'Change Photo' : 'Upload Photo'}</span>
                      </>
                    )}
                  </label>
                  {formData.image && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">JPEG, PNG, WebP, or AVIF. Max 5MB.</p>
                {uploadError && (
                  <p className="text-xs text-red-600 mt-1">{uploadError}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-headline text-sm text-gray-600 mb-1">
              NAME *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:border-[#C41E3A] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-headline text-sm text-gray-600 mb-1">
              DESCRIPTION
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:border-[#C41E3A] focus:outline-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block font-headline text-sm text-gray-600 mb-1">
              PRICE *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded focus:border-[#C41E3A] focus:outline-none"
              required
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.popular || false}
                onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                className="w-4 h-4 accent-[#C41E3A]"
              />
              <span className="text-sm">Popular</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured || false}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 accent-[#C41E3A]"
              />
              <span className="text-sm">Featured</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.available !== false}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="w-4 h-4 accent-[#C41E3A]"
              />
              <span className="text-sm">Available</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 px-4 py-2 bg-[#C41E3A] text-white rounded hover:bg-[#a01830] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : item ? 'Update' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Category Modal Component
function CategoryModal({
  category,
  onClose,
  onSave,
  saving,
}: {
  category?: MenuCategory;
  onClose: () => void;
  onSave: (category: Partial<MenuCategory>) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState<Partial<MenuCategory>>(
    category || {
      name: '',
      description: '',
      icon: 'utensils',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="font-headline text-2xl mb-4">
          {category ? 'EDIT CATEGORY' : 'ADD NEW CATEGORY'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-headline text-sm text-gray-600 mb-1">
              NAME *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:border-[#C41E3A] focus:outline-none"
              required
              placeholder="e.g., Appetizers"
            />
          </div>

          <div>
            <label className="block font-headline text-sm text-gray-600 mb-1">
              DESCRIPTION
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:border-[#C41E3A] focus:outline-none"
              rows={2}
              placeholder="e.g., Start your meal off right"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-[#C41E3A] text-white rounded hover:bg-[#a01830] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : category ? 'Update' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Import Modal Component
function ImportModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: {
      categoriesImported: number;
      itemsImported: number;
      totalCategories: number;
      totalItems: number;
    };
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);

      const res = await fetch('/api/menu/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setResult({
          success: true,
          message: `Successfully imported ${data.data.itemsImported} items in ${data.data.categoriesImported} categories!`,
          data: data.data,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Import failed',
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      setResult({
        success: false,
        message: 'Failed to import menu',
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = (format: 'json' | 'csv') => {
    window.open(`/api/menu/import?format=${format}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline text-2xl">IMPORT MENU</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Download Templates */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Download a template to get started:</p>
          <div className="flex gap-3">
            <button
              onClick={() => downloadTemplate('json')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="text-sm font-medium">JSON Template</span>
            </button>
            <button
              onClick={() => downloadTemplate('csv')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="text-sm font-medium">CSV Template</span>
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block font-headline text-sm text-gray-600 mb-2">
            SELECT FILE
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ) : (
              <>
                <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600">Click to select a JSON or CSV file</p>
                <p className="text-sm text-gray-400 mt-1">or drag and drop</p>
              </>
            )}
          </div>
        </div>

        {/* Import Mode */}
        <div className="mb-6">
          <label className="block font-headline text-sm text-gray-600 mb-2">
            IMPORT MODE
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="merge"
                checked={mode === 'merge'}
                onChange={(e) => setMode(e.target.value as 'merge')}
                className="w-4 h-4 accent-[#C41E3A]"
              />
              <div>
                <span className="font-medium">Merge</span>
                <p className="text-xs text-gray-500">Add new items, update existing</p>
              </div>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="replace"
                checked={mode === 'replace'}
                onChange={(e) => setMode(e.target.value as 'replace')}
                className="w-4 h-4 accent-[#C41E3A]"
              />
              <div>
                <span className="font-medium">Replace</span>
                <p className="text-xs text-gray-500">Replace entire menu</p>
              </div>
            </label>
          </div>
        </div>

        {/* Result Message */}
        {result && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div>
                <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.message}
                </p>
                {result.data && (
                  <p className="text-sm text-green-600 mt-1">
                    Total: {result.data.totalCategories} categories, {result.data.totalItems} items
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {result?.success ? (
            <button
              onClick={onSuccess}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!file || importing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </>
                ) : (
                  'Import Menu'
                )}
              </button>
            </>
          )}
        </div>

        {/* Format Help */}
        <div className="mt-6 pt-6 border-t">
          <details className="text-sm">
            <summary className="font-headline text-gray-600 cursor-pointer hover:text-gray-900">
              FORMAT GUIDE
            </summary>
            <div className="mt-3 space-y-3 text-gray-600">
              <div>
                <p className="font-medium text-gray-900">JSON Format:</p>
                <pre className="bg-gray-50 p-2 rounded mt-1 text-xs overflow-x-auto">
{`{
  "categories": [{
    "name": "Breakfast",
    "items": [{
      "name": "Pancakes",
      "price": 9.99,
      "popular": true
    }]
  }]
}`}
                </pre>
              </div>
              <div>
                <p className="font-medium text-gray-900">CSV Format:</p>
                <pre className="bg-gray-50 p-2 rounded mt-1 text-xs overflow-x-auto">
{`category,name,description,price,popular,featured
Breakfast,Pancakes,Fluffy buttermilk,9.99,true,false`}
                </pre>
              </div>
              <p className="text-xs text-gray-500">
                Supported tags: <code>popular</code>, <code>featured</code>, <code>available</code>
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
