'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface HeartButtonProps {
  itemId: string;
  categoryId: string;
  initialCount?: number;
  initialLiked?: boolean;
}

export default function HeartButton({
  itemId,
  categoryId,
  initialCount = 0,
  initialLiked = false,
}: HeartButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);

  const handleClick = async () => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    // Optimistic update
    setAnimating(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, categoryId }),
      });

      const data = await res.json();

      if (!data.success) {
        // Revert on error
        setLiked(wasLiked);
        setCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      }
    } catch {
      // Revert on error
      setLiked(wasLiked);
      setCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    }

    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 group transition-all ${
        status === 'loading' ? 'opacity-50' : ''
      }`}
      title={session ? (liked ? 'Remove heart' : 'Heart this dish') : 'Sign in to heart'}
    >
      <span
        className={`relative transition-transform ${
          animating ? 'scale-125' : 'scale-100'
        }`}
      >
        {liked ? (
          <svg
            className="w-6 h-6 text-[#C41E3A] drop-shadow"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-gray-400 group-hover:text-[#C41E3A] transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        )}
      </span>
      {count > 0 && (
        <span
          className={`text-sm font-headline ${
            liked ? 'text-[#C41E3A]' : 'text-gray-500'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
