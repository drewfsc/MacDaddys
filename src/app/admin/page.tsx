'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    menuCategories: 0,
    menuItems: 0,
    unreadFeedback: 0,
    totalFeedback: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch menu stats
      const menuRes = await fetch('/api/menu');
      const menuData = await menuRes.json();
      if (menuData.success && menuData.data) {
        const categories = menuData.data.categories?.length || 0;
        const items = menuData.data.categories?.reduce(
          (acc: number, cat: { items: unknown[] }) => acc + (cat.items?.length || 0),
          0
        ) || 0;
        setStats((prev) => ({ ...prev, menuCategories: categories, menuItems: items }));
      }

      // Fetch feedback stats
      const feedbackRes = await fetch('/api/feedback');
      const feedbackData = await feedbackRes.json();
      if (feedbackData.success && feedbackData.data) {
        const total = feedbackData.data.length;
        const unread = feedbackData.data.filter((f: { read: boolean }) => !f.read).length;
        setStats((prev) => ({ ...prev, totalFeedback: total, unreadFeedback: unread }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div>
      <h1 className="font-display text-4xl text-[#1a1a1a] mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Menu Categories */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-gray-500 tracking-wider text-sm">
              MENU CATEGORIES
            </h3>
            <svg className="w-6 h-6 text-[#C41E3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <p className="font-display text-4xl text-[#1a1a1a]">{stats.menuCategories}</p>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-gray-500 tracking-wider text-sm">
              MENU ITEMS
            </h3>
            <svg className="w-6 h-6 text-[#C41E3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="font-display text-4xl text-[#1a1a1a]">{stats.menuItems}</p>
        </div>

        {/* Unread Feedback */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-gray-500 tracking-wider text-sm">
              UNREAD FEEDBACK
            </h3>
            <svg className="w-6 h-6 text-[#C41E3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-display text-4xl text-[#1a1a1a]">
            {stats.unreadFeedback}
            {stats.unreadFeedback > 0 && (
              <span className="ml-2 text-sm bg-[#C41E3A] text-white px-2 py-1 rounded-full">
                NEW
              </span>
            )}
          </p>
        </div>

        {/* Total Feedback */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-gray-500 tracking-wider text-sm">
              TOTAL FEEDBACK
            </h3>
            <svg className="w-6 h-6 text-[#C41E3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="font-display text-4xl text-[#1a1a1a]">{stats.totalFeedback}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/menu"
          className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#C41E3A] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="font-headline text-2xl text-[#1a1a1a] tracking-wider">
                MANAGE MENU
              </h2>
              <p className="text-gray-500">Add, edit, or remove menu items</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/specials"
          className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <h2 className="font-headline text-2xl text-[#1a1a1a] tracking-wider">
                DAILY SPECIALS
              </h2>
              <p className="text-gray-500">Update your rotating specials</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/feedback"
          className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#C41E3A] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform relative">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {stats.unreadFeedback > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 text-black text-xs font-bold rounded-full flex items-center justify-center">
                  {stats.unreadFeedback}
                </span>
              )}
            </div>
            <div>
              <h2 className="font-headline text-2xl text-[#1a1a1a] tracking-wider">
                VIEW FEEDBACK
              </h2>
              <p className="text-gray-500">Read and respond to customer feedback</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
