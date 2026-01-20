'use client';

import { useState } from 'react';

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'other',
    rating: 0,
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          type: 'other',
          rating: 0,
          message: '',
        });
      } else {
        setError('Failed to submit feedback. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white/5 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-headline text-2xl text-white tracking-wider mb-2">
          THANK YOU!
        </h3>
        <p className="text-gray-400 mb-4">
          Your feedback has been submitted. We appreciate you taking the time to share your thoughts!
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-[#C41E3A] hover:underline"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg p-6">
      <h3 className="font-headline text-2xl text-[#C41E3A] tracking-wider mb-4">
        SHARE YOUR EXPERIENCE
      </h3>
      <p className="text-gray-400 mb-6">
        We&apos;d love to hear from you! Your feedback helps us serve you better.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-headline text-sm text-gray-400 tracking-wider mb-1">
              NAME *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-500 focus:border-[#C41E3A] focus:outline-none"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block font-headline text-sm text-gray-400 tracking-wider mb-1">
              EMAIL *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-500 focus:border-[#C41E3A] focus:outline-none"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-headline text-sm text-gray-400 tracking-wider mb-1">
              PHONE (optional)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-500 focus:border-[#C41E3A] focus:outline-none"
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <label className="block font-headline text-sm text-gray-400 tracking-wider mb-1">
              TYPE OF FEEDBACK
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:border-[#C41E3A] focus:outline-none"
            >
              <option value="compliment" className="bg-[#1a1a1a]">Compliment</option>
              <option value="suggestion" className="bg-[#1a1a1a]">Suggestion</option>
              <option value="complaint" className="bg-[#1a1a1a]">Complaint</option>
              <option value="question" className="bg-[#1a1a1a]">Question</option>
              <option value="other" className="bg-[#1a1a1a]">Other</option>
            </select>
          </div>
        </div>

        {/* Star Rating */}
        <div>
          <label className="block font-headline text-sm text-gray-400 tracking-wider mb-2">
            RATE YOUR EXPERIENCE
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className="focus:outline-none"
              >
                <svg
                  className={`w-8 h-8 transition-colors ${
                    star <= formData.rating
                      ? 'text-yellow-400'
                      : 'text-gray-600 hover:text-yellow-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-headline text-sm text-gray-400 tracking-wider mb-1">
            YOUR MESSAGE *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-500 focus:border-[#C41E3A] focus:outline-none"
            rows={4}
            placeholder="Tell us about your experience..."
            required
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#C41E3A] text-white font-headline tracking-wider py-3 rounded hover:bg-[#a01830] transition-colors disabled:opacity-50"
        >
          {submitting ? 'SUBMITTING...' : 'SUBMIT FEEDBACK'}
        </button>
      </form>
    </div>
  );
}
