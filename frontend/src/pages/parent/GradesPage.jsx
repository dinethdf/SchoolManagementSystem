/**
 * Parent Grades & Report Card Page
 * 
 * Allows parents to:
 * 1. View official report cards for their children.
 * 2. Review subject-wise marks, highest grades, and cumulative average.
 */

import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import ReportCardTable from '../../components/common/ReportCardTable';
import GradeLetterBadge from '../../components/common/GradeLetterBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { fetchMyChildrenGrades } from '../../api/grades';

export default function ParentGradesPage() {
  const [childrenReportCards, setChildrenReportCards] = useState([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    async function loadChildrenGrades() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await fetchMyChildrenGrades();
        const children = response?.children || [];
        setChildrenReportCards(children);
      } catch (err) {
        setErrorMessage('Failed to load child report card records.');
      } finally {
        setIsLoading(false);
      }
    }

    loadChildrenGrades();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <LoadingSpinner text="Loading academic results..." />
      </div>
    );
  }

  if (childrenReportCards.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Child Academic Grades" description="Review your child's examination results." />
        <EmptyState
          title="No grade records available"
          description="Your linked children do not have any graded assessments in the system yet."
        />
      </div>
    );
  }

  const activeReportCard = childrenReportCards[selectedChildIndex] || childrenReportCards[0];
  const overallPercentage = activeReportCard?.overall_percentage || 0;
  const overallGrade = activeReportCard?.overall_letter_grade || 'N/A';
  const subjectsList = activeReportCard?.subject_summaries || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Child Academic Performance"
        description="Inspect official report cards, subject grades, and test evaluations."
      />

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-4 rounded-xl text-sm font-medium bg-rose-50 text-rose-800 border border-rose-200">
          {errorMessage}
        </div>
      )}

      {/* Child Selector Tabs (if multiple children) */}
      {childrenReportCards.length > 1 && (
        <div className="flex border-b border-slate-200 gap-3 pb-2">
          {childrenReportCards.map((child, idx) => (
            <button
              key={child.student_admission_number || idx}
              onClick={() => setSelectedChildIndex(idx)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                selectedChildIndex === idx
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {child.student_name}
            </button>
          ))}
        </div>
      )}

      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            Academic Session: {activeReportCard.academic_year || 'Current'}
          </span>
          <h2 className="text-2xl font-black">{activeReportCard.student_name}</h2>
          <p className="text-sm text-amber-100 mt-0.5">
            Class: {activeReportCard.class_name} | Admission #: {activeReportCard.student_admission_number}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
          <div className="text-right">
            <p className="text-xs font-semibold text-amber-200 uppercase">Cumulative Score</p>
            <p className="text-2xl font-extrabold">{Number(overallPercentage).toFixed(1)}%</p>
          </div>
          <GradeLetterBadge grade={overallGrade} size="lg" />
        </div>
      </div>

      {/* Subject Breakdown Table */}
      <ReportCardTable
        subjectSummaries={subjectsList}
        overallPercentage={overallPercentage}
        overallLetterGrade={overallGrade}
      />
    </div>
  );
}
