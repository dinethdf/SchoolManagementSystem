/**
 * Reusable Data Card Component
 * 
 * Provides an education-friendly card view for individual records
 * (such as a Student Profile, Teacher Card, or Class Card).
 * 
 * PROPS:
 * - title: Primary display name (e.g. "John Doe", "Grade 10-A")
 * - subtitle: Secondary description (e.g. "Admission # STU-2026-001")
 * - avatarUrl: Optional profile picture URL
 * - roleColor: 'purple' (admin), 'emerald' (teacher), 'blue' (student), 'amber' (parent)
 * - badge: Optional status badge element or string
 * - details: Array of key-value items to display, e.g.:
 *     [ { label: 'Class', value: 'Grade 10-A' }, { label: 'Phone', value: '+123456789' } ]
 * - actions: Optional JSX element containing action buttons (View, Edit)
 */
import React from 'react';
import AvatarBadge from './AvatarBadge';

export default function DataCard({
  title,
  subtitle = null,
  avatarUrl = null,
  roleColor = 'blue',
  badge = null,
  details = [],
  actions = null,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition duration-150 ease-in-out flex flex-col justify-between">
      <div>
        {/* Top Header: Avatar + Title + Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <AvatarBadge
              name={title}
              imageUrl={avatarUrl}
              size="medium"
              roleColor={roleColor}
            />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Optional status pill badge */}
          {badge && <div>{badge}</div>}
        </div>

        {/* Middle Section: Key-Value Details */}
        {details.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
            {details.map(function (detailItem, index) {
              return (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-gray-500 font-medium">
                    {detailItem.label}:
                  </span>
                  <span className="text-gray-800 font-semibold truncate max-w-[160px]">
                    {detailItem.value || '-'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Section: Action Buttons */}
      {actions && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
}
