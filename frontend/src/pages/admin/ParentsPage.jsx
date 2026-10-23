/**
 * Admin Guardians & Parents Management Page
 * 
 * Allows School Administrators to view registered parents and guardians
 * and their associated enrolled children.
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchParents } from '../../api/students';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import AvatarBadge from '../../components/common/AvatarBadge';

export default function ParentsPage() {
  const parentsQuery = useQuery({
    queryKey: ['adminParentsList'],
    queryFn: fetchParents,
  });

  // Extract array safely from response
  let parentList = [];
  if (Array.isArray(parentsQuery.data)) {
    parentList = parentsQuery.data;
  } else if (parentsQuery.data && Array.isArray(parentsQuery.data.parents)) {
    parentList = parentsQuery.data.parents;
  }

  const columns = [
    {
      key: 'name',
      header: 'Parent / Guardian',
      render: function (row) {
        const parentName = row.user?.full_name || row.user?.username || 'Parent';
        return (
          <div className="flex items-center space-x-3">
            <AvatarBadge name={parentName} size="small" roleColor="amber" />
            <div>
              <p className="font-bold text-gray-900 leading-tight">{parentName}</p>
              <p className="text-xs text-gray-500">{row.user?.email || 'No email'}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'relationship_to_child',
      header: 'Relationship',
      render: (row) => (
        <span className="capitalize font-medium text-gray-800">
          {row.relationship_to_child || 'Guardian'}
        </span>
      ),
    },
    {
      key: 'occupation',
      header: 'Occupation',
      render: (row) => <span>{row.occupation || 'N/A'}</span>,
    },
    {
      key: 'children',
      header: 'Linked Students',
      render: function (row) {
        const children = row.children_details || [];
        if (children.length === 0) {
          return <span className="text-xs text-gray-400">None linked</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {children.map(function (child) {
              return (
                <span
                  key={child.id}
                  className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 font-medium border border-blue-100"
                >
                  {child.user?.full_name || child.admission_number}
                </span>
              );
            })}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: () => <StatusBadge status="active" label="Verified" />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parents & Guardians"
        subtitle="Registered family contacts and linked student accounts."
        badge={`${parentList.length} Guardians`}
      />

      <Table
        columns={columns}
        data={parentList}
        isLoading={parentsQuery.isLoading}
        emptyTitle="No parents registered"
        emptyDescription="Parent and guardian accounts will appear here once linked with students."
      />
    </div>
  );
}
