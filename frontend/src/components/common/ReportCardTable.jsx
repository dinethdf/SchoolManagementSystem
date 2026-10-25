/**
 * ReportCardTable Component
 * 
 * Renders an academic report card table showing performance per subject.
 * Used on Student and Parent grade view pages.
 * 
 * Props:
 * - subjectSummaries: array of { subject_name, total_assessments, average_marks, average_percentage, best_grade, overall_letter_grade }
 * - overallPercentage: number, e.g. 89.20
 * - overallLetterGrade: string, e.g. 'B'
 */

import React from 'react';
import GradeLetterBadge from './GradeLetterBadge';

export default function ReportCardTable({
  subjectSummaries = [],
  overallPercentage = 0,
  overallLetterGrade = 'N/A',
}) {
  // If no subjects have been graded yet, show a friendly empty message
  if (!subjectSummaries || subjectSummaries.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
        <p className="text-sm font-medium text-slate-600">No subject grades recorded yet.</p>
        <p className="text-xs text-slate-400 mt-1">Grades will appear here once assessments are completed and evaluated.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Overall Performance Banner */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-indigo-50/40 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Academic Performance Summary</h4>
          <p className="text-xs text-slate-500 mt-0.5">Evaluated across all registered subjects</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Overall Average: </span>
            <span className="text-base font-extrabold text-indigo-700 ml-1">{Number(overallPercentage).toFixed(1)}%</span>
          </div>
          <GradeLetterBadge grade={overallLetterGrade} size="lg" />
        </div>
      </div>

      {/* Table of Subjects */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-600 tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Subject</th>
              <th className="px-6 py-3.5 text-center">Assessments</th>
              <th className="px-6 py-3.5 text-center">Average Score</th>
              <th className="px-6 py-3.5 text-center">Percentage</th>
              <th className="px-6 py-3.5 text-center">Highest Grade</th>
              <th className="px-6 py-3.5 text-center">Overall Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subjectSummaries.map((subjectItem, index) => {
              const rowBackground = index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';

              return (
                <tr key={subjectItem.subject_name || index} className={`${rowBackground} hover:bg-indigo-50/30 transition-colors`}>
                  {/* Subject Name */}
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {subjectItem.subject_name}
                  </td>

                  {/* Number of Assessments */}
                  <td className="px-6 py-4 text-center text-slate-600 font-medium">
                    {subjectItem.total_assessments}
                  </td>

                  {/* Average Marks */}
                  <td className="px-6 py-4 text-center font-mono font-medium text-slate-700">
                    {Number(subjectItem.average_marks).toFixed(1)}
                  </td>

                  {/* Percentage Score with Progress Bar */}
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-bold text-slate-800">
                        {Number(subjectItem.average_percentage).toFixed(1)}%
                      </span>
                    </div>
                  </td>

                  {/* Best Grade */}
                  <td className="px-6 py-4 text-center">
                    <GradeLetterBadge grade={subjectItem.best_grade} size="sm" />
                  </td>

                  {/* Overall Letter Grade */}
                  <td className="px-6 py-4 text-center">
                    <GradeLetterBadge grade={subjectItem.overall_letter_grade} size="md" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
