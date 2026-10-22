/**
 * Common Pagination Control Component
 * 
 * Provides Previous / Next navigation controls and page number buttons
 * for paginated tables and lists.
 * 
 * PROPS:
 * - currentPage: Currently selected page number (1-based index)
 * - totalPages: Total number of pages available
 * - onPageChange: Callback function triggered when user clicks a page (passes newPageNumber)
 * - totalItems: Total count of items across all pages (optional)
 */
import React from 'react';
import Button from './Button';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = null,
}) {
  // If there is only 1 page or less, we don't need to display pagination controls
  if (totalPages <= 1) {
    return null;
  }

  // Generate an array of page numbers to render [1, 2, 3, ...]
  const pageNumbersList = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbersList.push(i);
  }

  // Helper function to handle previous button click
  function handlePreviousClick() {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  }

  // Helper function to handle next button click
  function handleNextClick() {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      {/* 1. Page / Record Summary */}
      <div className="text-xs text-gray-500">
        Page <span className="font-semibold text-gray-800">{currentPage}</span> of{' '}
        <span className="font-semibold text-gray-800">{totalPages}</span>
        {totalItems !== null && (
          <span className="ml-2">({totalItems} total items)</span>
        )}
      </div>

      {/* 2. Pagination Buttons */}
      <div className="flex items-center space-x-1">
        {/* Previous Page Button */}
        <Button
          variant="outline"
          size="small"
          onClick={handlePreviousClick}
          disabled={currentPage <= 1}
        >
          &larr; Prev
        </Button>

        {/* Individual Page Number Buttons */}
        {pageNumbersList.map(function (pageNumber) {
          const isCurrentActivePage = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange && onPageChange(pageNumber)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                isCurrentActivePage
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Next Page Button */}
        <Button
          variant="outline"
          size="small"
          onClick={handleNextClick}
          disabled={currentPage >= totalPages}
        >
          Next &rarr;
        </Button>
      </div>
    </div>
  );
}
