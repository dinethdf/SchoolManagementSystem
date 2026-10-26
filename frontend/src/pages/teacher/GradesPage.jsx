/**
 * Teacher Grades Management Page
 * 
 * Allows teachers to:
 * 1. View all created assessments (quizzes, midterms, finals, assignments).
 * 2. Create a new assessment with max marks, date, and subject.
 * 3. Enter student marks in bulk with live letter grade calculation.
 */

import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import GradeLetterBadge from '../../components/common/GradeLetterBadge';
import Modal from '../../components/common/Modal';
import ModalFooter from '../../components/common/ModalFooter';
import { fetchAssessments, createAssessment, bulkEnterGrades } from '../../api/grades';
import { fetchClasses, fetchSubjects } from '../../api/classes';
import { fetchStudents } from '../../api/students';

export default function TeacherGradesPage() {
  // -------------------------------------------------------------
  // Component State
  // -------------------------------------------------------------
  const [activeTab, setActiveTab] = useState('enter_marks'); // 'enter_marks' | 'assessments'
  const [assessmentsList, setAssessmentsList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);

  // Selected assessment for entering marks
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [studentRoster, setStudentRoster] = useState([]);
  const [marksMap, setMarksMap] = useState({}); // { studentId: marksNumber }
  const [remarksMap, setRemarksMap] = useState({}); // { studentId: remarkString }

  // Loading & submission state
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Create Assessment Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAssessmentData, setNewAssessmentData] = useState({
    name: '',
    assessment_type: 'quiz',
    subject: '',
    school_class: '',
    max_marks: 100,
    assessment_date: new Date().toISOString().split('T')[0],
    academic_year: '2026-2027',
  });

  // -------------------------------------------------------------
  // Effect 1: Load assessments, classes, and subjects on mount
  // -------------------------------------------------------------
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const [assessmentsRes, classesRes, subjectsRes] = await Promise.all([
          fetchAssessments(),
          fetchClasses(),
          fetchSubjects(),
        ]);

        const assessments = assessmentsRes?.assessments || (Array.isArray(assessmentsRes) ? assessmentsRes : []);
        const classes = classesRes?.classes || (Array.isArray(classesRes) ? classesRes : []);
        const subjects = subjectsRes?.subjects || (Array.isArray(subjectsRes) ? subjectsRes : []);

        setAssessmentsList(assessments);
        setClassList(classes);
        setSubjectList(subjects);

        // Auto-select first assessment
        if (assessments.length > 0) {
          setSelectedAssessmentId(String(assessments[0].id));
        }

        // Set initial modal defaults
        if (classes.length > 0 && subjects.length > 0) {
          setNewAssessmentData((prev) => ({
            ...prev,
            school_class: String(classes[0].id),
            subject: String(subjects[0].id),
          }));
        }
      } catch (err) {
        setFeedbackMessage({ type: 'error', text: 'Failed to load grade records.' });
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // -------------------------------------------------------------
  // Effect 2: When selectedAssessmentId changes, load students of that class
  // -------------------------------------------------------------
  useEffect(() => {
    if (!selectedAssessmentId) return;

    // Find the assessment object
    const currentAssessment = assessmentsList.find(
      (item) => String(item.id) === String(selectedAssessmentId)
    );
    if (!currentAssessment) return;

    async function loadStudentsForAssessment() {
      try {
        setIsLoadingStudents(true);
        setFeedbackMessage(null);

        const studentsRes = await fetchStudents();
        const allStudents = studentsRes?.students || (Array.isArray(studentsRes) ? studentsRes : []);

        // Filter students in the assessment's class
        const targetClassId = Number(currentAssessment.school_class);
        const filtered = [];
        for (let i = 0; i < allStudents.length; i++) {
          const s = allStudents[i];
          const sClassId = s.enrolled_class?.id || s.enrolled_class;
          if (Number(sClassId) === targetClassId) {
            filtered.push(s);
          }
        }
        setStudentRoster(filtered);

        // Prepopulate marks map
        const initialMarks = {};
        const initialRemarks = {};
        for (let i = 0; i < filtered.length; i++) {
          initialMarks[filtered[i].id] = '';
          initialRemarks[filtered[i].id] = '';
        }
        setMarksMap(initialMarks);
        setRemarksMap(initialRemarks);
      } catch (err) {
        setFeedbackMessage({ type: 'error', text: 'Failed to load class roster for assessment.' });
      } finally {
        setIsLoadingStudents(false);
      }
    }

    loadStudentsForAssessment();
  }, [selectedAssessmentId, assessmentsList]);

  // -------------------------------------------------------------
  // Helper: Live letter grade calculation
  // -------------------------------------------------------------
  function getLiveLetterGrade(score, maxMarks) {
    if (score === '' || score === null || isNaN(score) || !maxMarks) return null;
    const percentage = (Number(score) / Number(maxMarks)) * 100;
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  // -------------------------------------------------------------
  // Handler: Submit Bulk Marks
  // -------------------------------------------------------------
  async function handleSaveMarks() {
    if (!selectedAssessmentId) {
      setFeedbackMessage({ type: 'error', text: 'Please select an assessment.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedbackMessage(null);

      // Build grade list
      const gradeListPayload = [];
      for (let i = 0; i < studentRoster.length; i++) {
        const studentId = studentRoster[i].id;
        const enteredMarks = marksMap[studentId];
        if (enteredMarks !== '' && enteredMarks !== undefined) {
          gradeListPayload.push({
            student: studentId,
            marks_obtained: Number(enteredMarks),
            remarks: remarksMap[studentId] || '',
          });
        }
      }

      if (gradeListPayload.length === 0) {
        setFeedbackMessage({ type: 'error', text: 'Please enter marks for at least one student.' });
        setIsSubmitting(false);
        return;
      }

      const response = await bulkEnterGrades({
        assessment: Number(selectedAssessmentId),
        grade_list: gradeListPayload,
      });

      setFeedbackMessage({
        type: 'success',
        text: response.message || 'Grades recorded successfully!',
      });
    } catch (saveError) {
      const msg = saveError?.response?.data?.errors?.grade_list?.[0] || 'Failed to record grades.';
      setFeedbackMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  }

  // -------------------------------------------------------------
  // Handler: Create Assessment Modal Submit
  // -------------------------------------------------------------
  async function handleCreateAssessment(e) {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const created = await createAssessment({
        ...newAssessmentData,
        subject: Number(newAssessmentData.subject),
        school_class: Number(newAssessmentData.school_class),
        max_marks: Number(newAssessmentData.max_marks),
      });

      // Add to list and select it
      const createdObj = created.assessment || created;
      setAssessmentsList((prev) => [createdObj, ...prev]);
      setSelectedAssessmentId(String(createdObj.id));
      setIsCreateModalOpen(false);
      setFeedbackMessage({ type: 'success', text: `Assessment "${createdObj.name}" created!` });
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: 'Failed to create assessment. Check inputs.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Find active assessment details
  const activeAssessment = assessmentsList.find(
    (a) => String(a.id) === String(selectedAssessmentId)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Grades & Assessments"
        description="Create evaluation assessments and record student test scores."
        action={
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            + Create Assessment
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('enter_marks')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'enter_marks'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Enter Marks
        </button>
        <button
          onClick={() => setActiveTab('assessments')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'assessments'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Assessments Directory ({assessmentsList.length})
        </button>
      </div>

      {/* Feedback Alert */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedbackMessage.text}
        </div>
      )}

      {/* Tab 1: Enter Marks */}
      {activeTab === 'enter_marks' && (
        <div className="space-y-6">
          {/* Assessment Selector Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 w-full md:max-w-md">
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Select Assessment
              </label>
              <select
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                disabled={assessmentsList.length === 0}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {assessmentsList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {a.subject_name} ({a.class_name}) [Max: {a.max_marks}]
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="primary"
              onClick={handleSaveMarks}
              isLoading={isSubmitting}
              disabled={studentRoster.length === 0 || isLoadingStudents}
            >
              Save All Marks
            </Button>
          </div>

          {/* Student Marks Table */}
          <SectionCard
            title={`Student Mark Sheet: ${activeAssessment?.name || 'Selected Assessment'}`}
            description={`Max marks: ${activeAssessment?.max_marks || 100} | Class: ${activeAssessment?.class_name || 'N/A'}`}
          >
            {isLoadingStudents ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner text="Loading student list..." />
              </div>
            ) : studentRoster.length === 0 ? (
              <EmptyState
                title="No students enrolled"
                description="This assessment's class currently has no enrolled students."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Admission #</th>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3 text-center">Score / Max</th>
                      <th className="px-4 py-3 text-center">Grade Preview</th>
                      <th className="px-4 py-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentRoster.map((s) => {
                      const studentScore = marksMap[s.id];
                      const letterPreview = getLiveLetterGrade(
                        studentScore,
                        activeAssessment?.max_marks
                      );
                      const fullName = s.user?.first_name ? `${s.user.first_name} ${s.user.last_name}` : s.user?.username;

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3.5 font-mono text-xs">{s.admission_number}</td>
                          <td className="px-4 py-3.5 font-semibold text-slate-800">{fullName}</td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="inline-flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max={activeAssessment?.max_marks || 100}
                                step="0.5"
                                placeholder="0"
                                value={studentScore}
                                onChange={(e) =>
                                  setMarksMap((prev) => ({ ...prev, [s.id]: e.target.value }))
                                }
                                className="w-20 px-2 py-1 text-center font-bold border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
                              />
                              <span className="text-xs text-slate-400">/ {activeAssessment?.max_marks}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {letterPreview ? (
                              <GradeLetterBadge grade={letterPreview} size="sm" />
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <input
                              type="text"
                              placeholder="Feedback..."
                              value={remarksMap[s.id]}
                              onChange={(e) =>
                                setRemarksMap((prev) => ({ ...prev, [s.id]: e.target.value }))
                              }
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* Tab 2: Assessments Directory */}
      {activeTab === 'assessments' && (
        <SectionCard title="All Scheduled Assessments" description="List of all evaluations across subjects.">
          {assessmentsList.length === 0 ? (
            <EmptyState title="No assessments found" description="Click '+ Create Assessment' to schedule one." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Assessment Title</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3 text-center">Max Marks</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assessmentsList.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{a.name}</td>
                      <td className="px-4 py-3.5 capitalize text-xs font-medium text-slate-600">{a.assessment_type}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">{a.subject_name}</td>
                      <td className="px-4 py-3.5 text-slate-600">{a.class_name}</td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold">{a.max_marks}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">{a.assessment_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {/* Create Assessment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
        title="Create New Assessment"
        description="Set the assessment details before entering student marks."
        size="lg"
        isLoading={isSubmitting}
        footer={<ModalFooter onCancel={() => setIsCreateModalOpen(false)} submitFormId="create-assessment-form" submitLabel="Create Assessment" isLoading={isSubmitting} />}
      >
        <form id="create-assessment-form" onSubmit={handleCreateAssessment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assessment Title *</label>
            <input
              type="text"
              required
              value={newAssessmentData.name}
              onChange={(e) => setNewAssessmentData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Unit 3 Quiz"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
              <select
                value={newAssessmentData.assessment_type}
                onChange={(e) => setNewAssessmentData((prev) => ({ ...prev, assessment_type: e.target.value }))}
                className="w-full px-3 py-2 text-sm border rounded-lg"
              >
                <option value="quiz">Quiz</option>
                <option value="midterm">Midterm Exam</option>
                <option value="final">Final Exam</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Marks</label>
              <input
                type="number"
                min="1"
                required
                value={newAssessmentData.max_marks}
                onChange={(e) => setNewAssessmentData((prev) => ({ ...prev, max_marks: e.target.value }))}
                className="w-full px-3 py-2 text-sm border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class</label>
              <select
                value={newAssessmentData.school_class}
                onChange={(e) => setNewAssessmentData((prev) => ({ ...prev, school_class: e.target.value }))}
                className="w-full px-3 py-2 text-sm border rounded-lg"
              >
                {classList.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={newAssessmentData.subject}
                onChange={(e) => setNewAssessmentData((prev) => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 text-sm border rounded-lg"
              >
                {subjectList.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assessment Date</label>
            <input
              type="date"
              required
              value={newAssessmentData.assessment_date}
              onChange={(e) => setNewAssessmentData((prev) => ({ ...prev, assessment_date: e.target.value }))}
              className="w-full px-3 py-2 text-sm border rounded-lg"
            />
          </div>

        </form>
      </Modal>
    </div>
  );
}
