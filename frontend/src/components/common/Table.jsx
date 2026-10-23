/**
 * Reusable Data Table Component
 * 
 * Provides a standardized, accessible table layout across the application.
 * Integrates directly with SkeletonLoader and EmptyState.
 * 
 * PROPS:
 * - columns: Array of column definitions:
 *     [
 *       { key: 'name', header: 'Student Name' },
 *       { key: 'status', header: 'Attendance', render: (row) => <StatusBadge status={row.status} /> }
 *     ]
 * - data: Array of data objects (e.g. students, classes, or attendance rows)
 * - isLoading: Boolean - shows SkeletonLoader rows while data is fetching
 * - emptyTitle: Title for EmptyState when list is empty
 * - emptyDescription: Description for EmptyState
 * - emptyActionLabel: Optional CTA button label in EmptyState
 * - onEmptyAction: Callback when CTA button is clicked
 */
import React from 'react';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';

export default function Table({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items currently available in this table.',
  emptyActionLabel = null,
  onEmptyAction = null,
}) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          {/* 1. Table Header */}
          <thead className="bg-gray-50/80 text-gray-700 font-semibold text-left">
            <tr>
              {columns.map(function (column) {
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    {column.header}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* 2. Table Body */}
          <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
            {/* Case A: Data is actively loading */}
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-4">
                  <SkeletonLoader type="table" count={4} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              // Case B: Rule 9 - Friendly EmptyState when no records exist
              <tr>
                <td colSpan={columns.length} className="p-8">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                  />
                </td>
              </tr>
            ) : (
              // Case C: Render actual data rows
              data.map(function (row, rowIndex) {
                return (
                  <tr
                    key={row.id || rowIndex}
                    className="hover:bg-indigo-50/30 transition duration-150 ease-in-out"
                  >
                    {columns.map(function (column) {
                      // If column provides a custom render function (e.g. StatusBadge, Action buttons), use it
                      let cellContent = row[column.key];
                      if (column.render && typeof column.render === 'function') {
                        cellContent = column.render(row);
                      }

                      return (
                        <td
                          key={column.key}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                        >
                          {cellContent !== null && cellContent !== undefined ? cellContent : '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
