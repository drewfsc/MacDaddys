/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
 
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import menuDataFallback from '@/data/menu.json';
import HeartButton from './HeartButton';
import { FadeIn, Stagger, StaggerItem, motion } from './animations';
import { AnimatePresence } from 'framer-motion';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  popular?: boolean;
  featured?: boolean;
  available?: boolean;
  image?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  items: MenuItem[];
}

interface DailySpecial {
  day: string;
  name: string;
  description: string;
  price: number;
  active?: boolean;
}

interface MenuData {
  categories: MenuCategory[];
  specials: {
    daily: DailySpecial[];
  };
  notices: string[];
}

// Helper to get today's day name
function getTodayIndex(specials: DailySpecial[]): number {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  const index = specials.findIndex(
    (s) => s.day.toLowerCase() === today.toLowerCase()
  );
  return index >= 0 ? index : 0;
}

// Mobile swipeable carousel component
function DailySpecialsCarousel({
  specials,
  formatPrice,
}: {
  specials: DailySpecial[];
  formatPrice: (price: number) => string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const todayIdx = getTodayIndex(specials);
    setActiveIndex(todayIdx);
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({ left: todayIdx * cardWidth, behavior: 'smooth' });
    }
  }, [specials]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth;
      const scrollLeft = scrollRef.current.scrollLeft;
      const newIndex = Math.round(scrollLeft / cardWidth);
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < specials.length) {
        setActiveIndex(newIndex);
      }
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
      setActiveIndex(index);
    }
  };

  const todayIndex = getTodayIndex(specials);

  return (
    <div className="md:hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {specials.map((special, index) => (
          <div key={special.day} className="flex-shrink-0 w-full snap-center px-4">
            <div className={`text-center py-4 ${index === todayIndex ? 'ring-2 ring-[#C41E3A] rounded-lg bg-[#2a2a2a]' : ''}`}>
              <p className="font-headline text-[#C41E3A] tracking-wider text-lg">
                {special.day}
                {index === todayIndex && (
                  <span className="ml-2 text-xs bg-[#C41E3A] text-white px-2 py-0.5 rounded-full">TODAY</span>
                )}
              </p>
              <p className="font-accent font-bold text-xl mt-2">{special.name}</p>
              <p className="text-sm text-gray-400 mt-1">{special.description}</p>
              <p className="font-headline text-2xl mt-2">{formatPrice(special.price)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {specials.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === activeIndex ? 'bg-[#C41E3A] w-4' : index === todayIndex ? 'bg-[#C41E3A]/50' : 'bg-gray-500'
            }`}
            aria-label={`Go to ${specials[index].day}`}
          />
        ))}
      </div>
      <p className="text-center text-xs text-gray-500 mt-2">Swipe to see all specials</p>
    </div>
  );
}

// Menu Item Modal Component
function MenuItemModal({
  item,
  category,
  isOpen,
  onClose,
  likeCount,
  isLiked,
}: {
  item: MenuItem | null;
  category: MenuCategory | null;
  isOpen: boolean;
  onClose: () => void;
  likeCount: number;
  isLiked: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!item) return;
    const url = `${window.location.origin}${window.location.pathname}#item-${item.id}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  if (!item || !category) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-50 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto"
          >
            {/* Image or placeholder */}
            <div className="relative h-48 md:h-64 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <span className="text-6xl">🍽️</span>
                  <p className="text-gray-400 mt-2 font-accent italic text-sm">Image coming soon</p>
                </div>
              )}
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {/* Tags */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {item.featured && (
                  <span className="bg-[#C41E3A] text-white text-xs font-headline px-3 py-1 rounded-full">
                    SIGNATURE
                  </span>
                )}
                {item.popular && (
                  <span className="bg-[#D4AF37] text-white text-xs font-headline px-3 py-1 rounded-full">
                    POPULAR
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Category badge */}
              <p className="text-xs font-headline text-[#C41E3A] tracking-wider mb-2">
                {category.name.toUpperCase()}
              </p>

              {/* Name and price */}
              <div className="flex justify-between items-start gap-4 mb-4">
                <h3 className="font-headline text-2xl md:text-3xl text-[#1a1a1a] tracking-wide">
                  {item.name}
                </h3>
                <span className="font-headline text-3xl text-[#C41E3A] whitespace-nowrap">
                  {formatPrice(item.price)}
                </span>
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-gray-600 mb-6 leading-relaxed">{item.description}</p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <HeartButton
                    itemId={item.id}
                    categoryId={category.id}
                    initialCount={likeCount}
                    initialLiked={isLiked}
                  />
                  <span className="text-sm text-gray-500">
                    {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                  </span>
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-600">Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Sticky Category Header Component
function CategoryHeader({ category, isSticky }: { category: MenuCategory; isSticky: boolean }) {
  return (
    <div
      className={`sticky top-16 md:top-20 z-30  ${
        isSticky ? 'bg-[#FFF8E7]/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="py-4 px-4 md:px-0">
        <h3 className="font-headline text-2xl md:text-3xl text-[#1a1a1a] tracking-wider">
          {category.name.toUpperCase()}
        </h3>
        {category.description && (
          <p className="font-accent text-gray-600 italic mt-1">{category.description}</p>
        )}
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-[#C41E3A] to-transparent" />
    </div>
  );
}

export default function Menu() {
  const { data: session } = useSession();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [stickyCategories, setStickyCategories] = useState<Record<string, boolean>>({});
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchMenu();
    fetchLikes();
  }, [session]);

  // Handle deep linking on mount
  useEffect(() => {
    if (!menuData || loading) return;

    const hash = window.location.hash;
    if (hash.startsWith('#item-')) {
      const itemId = hash.replace('#item-', '');
      // Find the item in categories
      for (const category of menuData.categories) {
        const item = category.items.find(i => i.id === itemId);
        if (item) {
          setSelectedItem(item);
          setSelectedCategory(category);
          break;
        }
      }
    }
  }, [menuData, loading]);

  // Update URL when modal opens/closes
  useEffect(() => {
    if (selectedItem) {
      window.history.replaceState(null, '', `#item-${selectedItem.id}`);
    } else {
      // Only remove hash if we had one for an item
      if (window.location.hash.startsWith('#item-')) {
        window.history.replaceState(null, '', window.location.pathname + '#menu');
      }
    }
  }, [selectedItem]);

  // Intersection observer for sticky headers
  useEffect(() => {
    if (!menuData) return;

    const observers: IntersectionObserver[] = [];
    const navHeight = window.innerWidth >= 768 ? 80 : 64;

    menuData.categories.forEach((category) => {
      const ref = categoryRefs.current[category.id];
      if (!ref) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          // Check if the header is at the sticky position
          const rect = entry.boundingClientRect;
          const isAtTop = rect.top <= navHeight + 10 && rect.bottom > navHeight;
          setStickyCategories(prev => ({ ...prev, [category.id]: isAtTop }));
        },
        {
          threshold: [0, 0.1, 0.5, 1],
          rootMargin: `-${navHeight}px 0px 0px 0px`,
        }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, [menuData]);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (data.success && data.data) {
        setMenuData(data.data);
      } else {
        setMenuData(menuDataFallback as unknown as MenuData);
      }
    } catch {
      setMenuData(menuDataFallback as unknown as MenuData);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikes = async () => {
    try {
      const userId = session?.user?.id || '';
      const res = await fetch(`/api/likes?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setLikeCounts(data.data.counts || {});
        setUserLikes(data.data.userLikes || []);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const handleItemClick = useCallback((item: MenuItem, category: MenuCategory) => {
    setSelectedItem(item);
    setSelectedCategory(category);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
    setSelectedCategory(null);
  }, []);

  if (loading) {
    return (
      <section id="menu" className="py-16 md:py-24 bg-[#FFF8E7]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!menuData) return null;

  const categories = menuData.categories || [];
  const specials = menuData.specials?.daily?.filter((s) => s.active !== false) || [];
  const notices = menuData.notices || [];

  return (
    <>
      <section ref={menuRef} id="menu" className="py-16 md:py-24 bg-[#FFF8E7]">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <FadeIn className="text-center mb-12">
            <h2 className="font-display text-5xl md:text-6xl text-[#1a1a1a] mb-4">Our Menu</h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-32 h-1 bg-[#C41E3A] mx-auto mb-4 origin-center"
            />
            <p className="font-accent text-xl text-gray-600 italic">Made fresh daily with love</p>
            {!session && (
              <p className="text-sm text-gray-500 mt-2">
                <a href="/login" className="text-[#C41E3A] hover:underline">Join our mailing list</a> to heart your favorite dishes!
              </p>
            )}
          </FadeIn>

          {/* Daily Specials Banner */}
          {specials.length > 0 && (
            <FadeIn delay={0.1}>
              <div className="bg-[#1a1a1a] text-white rounded-lg p-6 mb-12 retro-border">
                <h3 className="font-headline text-2xl text-[#C41E3A] tracking-wider mb-4 text-center">DAILY SPECIALS</h3>
                {/* Desktop Grid */}
                <Stagger className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {specials.map((special) => (
                    <StaggerItem key={special.day} className="text-center">
                      <p className="font-headline text-[#C41E3A] tracking-wider">{special.day}</p>
                      <p className="font-accent font-bold">{special.name}</p>
                      <p className="text-sm text-gray-400">{special.description}</p>
                      <p className="font-headline text-lg mt-1">{formatPrice(special.price)}</p>
                    </StaggerItem>
                  ))}
                </Stagger>
                {/* Mobile Swipeable Carousel */}
                <DailySpecialsCarousel specials={specials} formatPrice={formatPrice} />
              </div>
            </FadeIn>
          )}

          {/* Quick Navigation */}
          <FadeIn delay={0.2}>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 sticky top-16 md:top-20 z-40 bg-[#FFF8E7]/95 backdrop-blur-sm py-3 -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none md:static">
              {categories.map((category) => (
                <motion.a
                  key={category.id}
                  href={`#category-${category.id}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="font-headline text-sm md:text-base tracking-wider px-3 py-1.5 md:px-4 md:py-2 rounded bg-white text-[#1a1a1a] hover:bg-[#C41E3A] hover:text-white border border-[#1a1a1a] hover:border-[#C41E3A] transition-all shadow-sm"
                >
                  {category.name.toUpperCase()}
                </motion.a>
              ))}
            </div>
          </FadeIn>

          {/* All Categories */}
          {categories.map((category) => (
            <div
              key={category.id}
              id={`category-${category.id}`}
              ref={(el) => { categoryRefs.current[category.id] = el; }}
              className="mb-12 scroll-mt-32 md:scroll-mt-36"
            >
              <CategoryHeader category={category} isSticky={stickyCategories[category.id] || false} />

              {/* Items Grid */}
              <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6" fast>
                {category.items
                  ?.filter((item) => item.available !== false)
                  .map((item, index) => (
                    <StaggerItem key={item.id}>
                      <motion.div
                        id={`item-${item.id}`}
                        onClick={() => handleItemClick(item, category)}
                        whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.15)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleItemClick(item, category); }}
                        className={`w-full text-left bg-white rounded-lg p-4 md:p-6 shadow-md cursor-pointer ${
                          item.featured ? 'ring-2 ring-[#C41E3A] relative' : ''
                        }`}
                      >
                        {item.featured && (
                          <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3 + index * 0.05, type: 'spring', stiffness: 300 }}
                            className="absolute -top-3 -right-3 bg-[#C41E3A] text-white font-headline text-xs px-3 py-1 rounded-full"
                          >
                            SIGNATURE
                          </motion.div>
                        )}

                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-headline text-lg md:text-xl text-[#1a1a1a] tracking-wide">
                                {item.name}
                              </h4>
                              {item.popular && (
                                <span className="bg-[#D4AF37] text-white text-xs font-bold px-2 py-0.5 rounded">
                                  POPULAR
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-gray-600 mt-1 md:mt-2 text-sm line-clamp-2">{item.description}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className="font-headline text-xl md:text-2xl text-[#C41E3A] whitespace-nowrap">
                              {formatPrice(item.price)}
                            </span>
                            <div onClick={(e) => e.stopPropagation()}>
                              <HeartButton
                                itemId={item.id}
                                categoryId={category.id}
                                initialCount={likeCounts[item.id] || 0}
                                initialLiked={userLikes.includes(item.id)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Tap hint for mobile */}
                        <div className="mt-3 flex items-center gap-1 text-xs text-gray-400 md:hidden">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Tap for details</span>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
              </Stagger>
            </div>
          ))}

          {/* Notice */}
          {notices.length > 0 && (
            <FadeIn delay={0.3}>
              <div className="mt-12 text-center">
                <div className="inline-block bg-white rounded-lg px-6 py-4 shadow">
                  {notices.map((notice, index) => (
                    <p key={index} className="text-sm text-gray-500 italic">{notice}</p>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* Item Detail Modal */}
      <MenuItemModal
        item={selectedItem}
        category={selectedCategory}
        isOpen={!!selectedItem}
        onClose={handleCloseModal}
        likeCount={selectedItem ? likeCounts[selectedItem.id] || 0 : 0}
        isLiked={selectedItem ? userLikes.includes(selectedItem.id) : false}
      />
    </>
  );
}
