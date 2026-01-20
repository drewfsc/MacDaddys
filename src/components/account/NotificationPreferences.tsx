'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { NotificationPreferences as PreferencesType } from '@/lib/types';

interface PreferenceToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function PreferenceToggle({ label, description, checked, onChange, disabled }: PreferenceToggleProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0">
      <div className="flex-1 pr-4">
        <h3 className="font-headline text-lg text-[#1a1a1a] tracking-wide">{label}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#C41E3A] focus:ring-offset-2 ${
          checked ? 'bg-[#C41E3A]' : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function NotificationPreferences() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<PreferencesType>({
    dailySpecials: true,
    eventsAnnouncements: true,
    feedbackReplies: true,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/user/preferences');
      const data = await res.json();

      if (data.success && data.data?.preferences) {
        setPreferences(data.data.preferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      showToast('Failed to load preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof PreferencesType, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    setSaving(true);

    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: newPreferences }),
      });

      const data = await res.json();

      if (data.success) {
        showToast('Preferences saved', 'success');
      } else {
        // Revert on error
        setPreferences(preferences);
        showToast('Failed to save preferences', 'error');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setPreferences(preferences);
      showToast('Failed to save preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="font-display text-2xl text-[#1a1a1a]">Email Notifications</h2>
        <p className="text-gray-600 mt-1">Choose what emails you&apos;d like to receive from us.</p>
      </div>

      <div className="divide-y divide-gray-200">
        <PreferenceToggle
          label="DAILY SPECIALS & PROMOTIONS"
          description="Get updates about our daily specials, seasonal menus, and exclusive deals."
          checked={preferences.dailySpecials}
          onChange={(value) => updatePreference('dailySpecials', value)}
          disabled={saving}
        />
        <PreferenceToggle
          label="EVENTS & ANNOUNCEMENTS"
          description="Be the first to know about special events, holiday hours, and diner news."
          checked={preferences.eventsAnnouncements}
          onChange={(value) => updatePreference('eventsAnnouncements', value)}
          disabled={saving}
        />
        <PreferenceToggle
          label="FEEDBACK REPLIES"
          description="Receive email notifications when we respond to your feedback."
          checked={preferences.feedbackReplies}
          onChange={(value) => updatePreference('feedbackReplies', value)}
          disabled={saving}
        />
      </div>

      {saving && (
        <p className="text-sm text-gray-500 mt-4 flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-[#C41E3A] border-t-transparent rounded-full animate-spin"></span>
          Saving...
        </p>
      )}
    </div>
  );
}
