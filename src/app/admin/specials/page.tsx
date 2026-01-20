'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';

interface DailySpecial {
  day: string;
  name: string;
  description: string;
  price: number;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function SpecialsManagement() {
  const [specials, setSpecials] = useState<DailySpecial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSpecial, setEditingSpecial] = useState<DailySpecial | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    fetchSpecials();
  }, []);

  const fetchSpecials = async () => {
    try {
      // Cache-bust to ensure fresh data
      const res = await fetch(`/api/menu/specials?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setSpecials(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching specials:', error);
      showToast('Failed to load specials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecial = async (special: Partial<DailySpecial>) => {
    setSaving(true);

    // Optimistic update
    const newSpecial: DailySpecial = {
      day: special.day || '',
      name: special.name || '',
      description: special.description || '',
      price: Number(special.price) || 0,
    };
    setSpecials((prev) => [...prev, newSpecial]);
    setShowAddModal(false);

    try {
      const res = await fetch('/api/menu/specials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(special),
      });
      const data = await res.json();

      if (data.success) {
        showToast('Special added successfully!', 'success');
      } else {
        // Revert on failure
        setSpecials((prev) => prev.filter((s) => s.day !== newSpecial.day));
        setShowAddModal(true);
        showToast(data.error || 'Failed to add special', 'error');
      }
    } catch (error) {
      console.error('Error adding special:', error);
      // Revert on failure
      setSpecials((prev) => prev.filter((s) => s.day !== newSpecial.day));
      setShowAddModal(true);
      showToast('Failed to add special', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSpecial = async (special: DailySpecial) => {
    setSaving(true);

    // Store previous state for revert
    const previousSpecials = [...specials];

    // Optimistic update
    setSpecials((prev) =>
      prev.map((s) => (s.day.toLowerCase() === special.day.toLowerCase() ? special : s))
    );
    setEditingSpecial(null);

    try {
      const res = await fetch('/api/menu/specials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: special.day,
          updates: {
            name: special.name,
            description: special.description,
            price: special.price,
          },
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast('Special updated successfully!', 'success');
      } else {
        // Revert on failure
        setSpecials(previousSpecials);
        setEditingSpecial(special);
        showToast(data.error || 'Failed to update special', 'error');
      }
    } catch (error) {
      console.error('Error updating special:', error);
      // Revert on failure
      setSpecials(previousSpecials);
      setEditingSpecial(special);
      showToast('Failed to update special', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSpecial = async (day: string) => {
    const confirmed = await confirm({
      title: 'Delete Special',
      message: `Are you sure you want to delete the ${day} special?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmStyle: 'danger',
    });

    if (!confirmed) return;

    // Store previous state for revert
    const previousSpecials = [...specials];

    // Optimistic update
    setSpecials((prev) => prev.filter((s) => s.day.toLowerCase() !== day.toLowerCase()));

    try {
      const res = await fetch(`/api/menu/specials?day=${encodeURIComponent(day)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        showToast('Special deleted successfully!', 'success');
      } else {
        // Revert on failure
        setSpecials(previousSpecials);
        showToast(data.error || 'Failed to delete special', 'error');
      }
    } catch (error) {
      console.error('Error deleting special:', error);
      // Revert on failure
      setSpecials(previousSpecials);
      showToast('Failed to delete special', 'error');
    }
  };

  // Get days that don't have specials yet
  const availableDays = DAYS_OF_WEEK.filter(
    (day) => !specials.some((s) => s.day.toLowerCase() === day.toLowerCase())
  );

  // Get today's day name
  const today = DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 font-headline text-xl animate-pulse">
          Loading specials...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-[#1a1a1a]">Daily Specials</h1>
          <p className="text-gray-500 mt-1">Manage your rotating daily specials</p>
        </div>
        {availableDays.length > 0 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#C41E3A] text-white font-headline tracking-wider px-4 py-2 rounded hover:bg-[#a01830] transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            ADD SPECIAL
          </button>
        )}
      </div>

      {/* Specials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const special = specials.find(
            (s) => s.day.toLowerCase() === day.toLowerCase()
          );
          const isToday = day === today;

          return (
            <div
              key={day}
              className={`bg-white rounded-lg shadow-sm overflow-hidden ${
                isToday ? 'ring-2 ring-[#C41E3A]' : ''
              }`}
            >
              {/* Day Header */}
              <div className={`px-4 py-3 ${isToday ? 'bg-[#C41E3A] text-white' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-headline tracking-wider">
                    {day.toUpperCase()}
                  </h3>
                  {isToday && (
                    <span className="text-xs bg-white text-[#C41E3A] px-2 py-0.5 rounded-full font-bold">
                      TODAY
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              {special ? (
                <div className="p-4">
                  <h4 className="font-headline text-lg text-[#1a1a1a] mb-2">
                    {special.name}
                  </h4>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                    {special.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-headline text-xl text-[#C41E3A]">
                      ${special.price.toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingSpecial(special)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSpecial(special.day)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-gray-400 text-sm mb-3">No special set</p>
                  <button
                    onClick={() => {
                      setShowAddModal(true);
                    }}
                    className="text-[#C41E3A] hover:text-[#a01830] text-sm font-medium"
                  >
                    + Add Special
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How Daily Specials Work</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Specials are displayed on the public menu, highlighted for today</li>
              <li>The current day&apos;s special is automatically highlighted for customers</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Special Modal */}
      {showAddModal && (
        <SpecialModal
          availableDays={availableDays}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddSpecial}
          saving={saving}
        />
      )}

      {/* Edit Special Modal */}
      {editingSpecial && (
        <SpecialModal
          special={editingSpecial}
          onClose={() => setEditingSpecial(null)}
          onSave={handleUpdateSpecial}
          saving={saving}
        />
      )}
    </div>
  );
}

// Special Modal Component
function SpecialModal({
  special,
  availableDays,
  onClose,
  onSave,
  saving,
}: {
  special?: DailySpecial;
  availableDays?: string[];
  onClose: () => void;
  onSave: (special: DailySpecial) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState<Partial<DailySpecial>>(
    special || {
      day: availableDays?.[0] || '',
      name: '',
      description: '',
      price: 0,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      day: formData.day || '',
      name: formData.name || '',
      description: formData.description || '',
      price: Number(formData.price) || 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="font-headline text-2xl mb-4">
          {special ? 'EDIT SPECIAL' : 'ADD NEW SPECIAL'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Day Selection (only for new specials) */}
          {!special && availableDays && (
            <div>
              <label className="block font-headline text-sm text-gray-600 mb-1">
                DAY *
              </label>
              <select
                value={formData.day || ''}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:border-[#C41E3A] focus:outline-none"
                required
              >
                {availableDays.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Show day for editing (read-only) */}
          {special && (
            <div>
              <label className="block font-headline text-sm text-gray-600 mb-1">
                DAY
              </label>
              <p className="px-3 py-2 bg-gray-100 rounded font-medium">
                {special.day}
              </p>
            </div>
          )}

          <div>
            <label className="block font-headline text-sm text-gray-600 mb-1">
              NAME *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:border-[#C41E3A] focus:outline-none"
              placeholder="e.g., Meatloaf Monday"
              required
            />
          </div>

          <div>
            <label className="block font-headline text-sm text-gray-600 mb-1">
              DESCRIPTION *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:border-[#C41E3A] focus:outline-none"
              rows={2}
              placeholder="e.g., Homestyle meatloaf dinner with all the fixings"
              required
            />
          </div>

          <div>
            <label className="block font-headline text-sm text-gray-600 mb-1">
              PRICE *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full pl-7 pr-3 py-2 border rounded focus:border-[#C41E3A] focus:outline-none"
                placeholder="0.00"
                required
              />
            </div>
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
              {saving ? 'Saving...' : special ? 'Update' : 'Add Special'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
