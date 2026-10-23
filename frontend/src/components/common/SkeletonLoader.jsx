/**
 * Reusable Skeleton Loader Component
 * 
 * Displays animated pulsing placeholder blocks while content is being fetched.
 * Provides a much smoother, more professional user experience than abrupt spinners.
 * 
 * PROPS:
 * - type: 'table', 'card', 'profile', 'lines' (default: 'lines')
 * - count: Number of placeholder items to generate (default: 3)
 */
import React from 'react';

export default function SkeletonLoader({ type = 'lines', count = 3 }) {
  // Generate an array of indices [0, 1, 2, ...] based on count
  const placeholderItems = [];
  for (let i = 0; i < count; i++) {
    placeholderItems.push(i);
  }

  // -------------------------------------------------------------
  // Type 1: Table Rows Skeleton
  // -------------------------------------------------------------
  if (type === 'table') {
    return (
      <div className="w-full divide-y divide-gray-100 animate-pulse">
        {placeholderItems.map(function (itemIndex) {
          return (
            <div key={itemIndex} className="p-4 flex items-center justify-between gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
              <div className="h-4 bg-gray-200 rounded w-1/5" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
            </div>
          );
        })}
      </div>
    );
  }

  // -------------------------------------------------------------
  // Type 2: Card Grid Skeleton
  // -------------------------------------------------------------
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {placeholderItems.map(function (itemIndex) {
          return (
            <div
              key={itemIndex}
              className="bg-white p-6 rounded-xl border border-gray-200 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              </div>
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          );
        })}
      </div>
    );
  }

  // -------------------------------------------------------------
  // Type 3: Profile Cards Skeleton
  // -------------------------------------------------------------
  if (type === 'profile') {
    return (
      <div className="space-y-3 animate-pulse">
        {placeholderItems.map(function (itemIndex) {
          return (
            <div
              key={itemIndex}
              className="p-4 bg-white rounded-xl border border-gray-200 flex items-center space-x-4"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // -------------------------------------------------------------
  // Type 4: Simple Text Lines (Default)
  // -------------------------------------------------------------
  return (
    <div className="space-y-3 p-4 animate-pulse">
      {placeholderItems.map(function (itemIndex) {
        return (
          <div
            key={itemIndex}
            className="h-4 bg-gray-200 rounded w-full"
            style={{ width: `${Math.max(40, 100 - itemIndex * 15)}%` }}
          />
        );
      })}
    </div>
  );
}
