/**
 * Student Grades & Results Page
 * 
 * Allows students to:
 * 1. View their official academic report card with overall average and letter grade.
 * 2. See performance broken down per subject.
 * 3. Inspect individual assessment marks, scores, and teacher remarks.
 */

import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import ReportCardTable from '../../components/common/ReportCardTable';
import GradeLetterBadge from '../../components/common/GradeLetterBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { fetchMyReportCard, fetchMyGrades } from '../../api/grades';

export default function StudentGradesPage() {
  const [reportCardData, setReportCardData] = useState(null);
  const [individualGrades, setIndividualGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    async function loadAcademicResults() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const [reportCardRes, gradesRes] = await Promise.all([
          fetchMyReportCard(),
          fetchMyGrades(),
        ]);

        setReportCardData(reportCardRes?.report_card || null);
        setIndividualGrades(gradesRes?.grades || (Array.isArray(gradesRes) ? gradesRes : []));
      } catch (err) {
        setErrorMessage('Failed to load academic grades. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    loadAcademicResults();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <LoadingSpinner text="Compiling your report card & grades..." />
      </div>
    );
  }

  const overallPercentage = reportCardData?.overall_percentage || 0;
  const overallGrade = reportCardData?.overall_letter_grade || 'N/A';
  const subjectsList = reportCardData?.subject_summaries || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Academic Grades & Report Card"
        description="View your cumulative GPA, subject-wise evaluation, and assessment records."
      />

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-4 rounded-xl text-sm font-medium bg-rose-50 text-rose-800 border border-rose-200">
          {errorMessage}
        </div>
      )}

      {/* Top Banner: Academic Summary */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            Academic Session: {reportCardData?.academic_year || 'Current'}
          </span>
          <h2 className="text-2xl font-black">{reportCardData?.student_name || 'Student Record'}</h2>
          <p className="text-sm text-blue-100 mt-0.5">
            Class: {reportCardData?.class_name || 'Enrolled Class'} | Roll: {reportCardData?.student_admission_number || 'N/A'}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
          <div className="text-right">
            <p className="text-xs font-semibold text-blue-200 uppercase">Overall Average</p>
            <p className="text-2xl font-extrabold">{Number(overallPercentage).toFixed(1)}%</p>
          </div>
          <GradeLetterBadge grade={overallGrade} size="lg" />
        </div>
      </div>

      {/* Report Card Subject Breakdown */}
      <ReportCardTable
        subjectSummaries={subjectsList}
        overallPercentage={overallPercentage}
        overallLetterGrade={overallGrade}
      />

      {/* Detailed Individual Assessments Table */}
      <SectionCard
        title="Individual Assessment Marks"
        description={`Detailed record of all ${individualGrades.length} quizzes, exams, and assignments taken.`}
      >
        {individualGrades.length === 0 ? (
          <EmptyState
            title="No assessments completed"
            description="You do not have any graded assessments recorded in the system yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="px-5 py-3.5">Assessment Title</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5 text-center">Score</th>
                  <th className="px-5 py-3.5 text-center">Percentage</th>
                  <th className="px-5 py-3.5 text-center">Grade</th>
                  <th className="px-5 py-3.5">Teacher Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {individualGrades.map((gradeItem) => (
                  <tr key={gradeItem.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">{gradeItem.assessment_name}</td>
                    <td className="px-5 py-4 font-medium text-slate-700">{gradeItem.subject_name}</td>
                    <td className="px-5 py-4 text-center font-mono font-semibold text-slate-800">
                      {gradeItem.marks_obtained} / {gradeItem.max_marks}
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-slate-700">
                      {gradeItem.percentage}%
                    </td>
                    <td className="px-5 py-4 text-center">
                      <GradeLetterBadge grade={gradeItem.letter_grade} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 italic">
                      {gradeItem.remarks || 'No notes provided'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
