/**
 * Reusable Data Table Component
 * 
 * Provides a consistent, accessible table layout across the application.
 * 
 * PROPS:
 * - columns: Array of column definitions:
 *     [
 *       { key: 'name', header: 'Student Name' },
 *       { key: 'grade', header: 'Grade', render: (row) => <span>Grade {row.grade}</span> }
 *     ]
 * - data: Array of data objects (e.g. students or classes)
 * - isLoading: Boolean - shows a spinner if data is still fetching
 * - emptyMessage: Text shown when data array is empty (Rule 9 requirement)
 */
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function Table({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No records found.',
}) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          {/* 1. Table Header */}
          <thead className="bg-gray-50 text-gray-700 font-semibold text-left">
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
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <LoadingSpinner message="Loading table records..." />
                </td>
              </tr>
            ) : data.length === 0 ? (
              // Case B: Rule 9 - Show empty state message when list has no items
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-sm font-medium text-gray-700">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              // Case C: Render data rows
              data.map(function (row, rowIndex) {
                return (
                  <tr
                    key={row.id || rowIndex}
                    className="hover:bg-gray-50 transition duration-150 ease-in-out"
                  >
                    {columns.map(function (column) {
                      // If column provides a custom render function, use it.
                      // Otherwise, display row[column.key].
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
