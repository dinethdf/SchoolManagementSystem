/**
 * Teacher Attendance Page
 * 
 * Allows teachers to:
 * 1. Select a classroom/batch from their assigned or available classes.
 * 2. Select a date (defaults to today).
 * 3. Review currently marked attendance or load all enrolled students.
 * 4. Toggle attendance status (Present, Absent, Late, Excused) for each student.
 * 5. Submit bulk attendance to the backend API.
 */

import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AttendanceStatusButton from '../../components/common/AttendanceStatusButton';
import { fetchClasses } from '../../api/classes';
import { fetchStudents } from '../../api/students';
import { fetchClassAttendance, bulkMarkAttendance } from '../../api/attendance';

export default function AttendancePage() {
  // -------------------------------------------------------------
  // Component State
  // -------------------------------------------------------------
  const [classList, setClassList] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to today's date in YYYY-MM-DD format
    const todayObject = new Date();
    return todayObject.toISOString().split('T')[0];
  });

  const [studentRoster, setStudentRoster] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: 'present' | 'absent' | ... }
  const [remarksMap, setRemarksMap] = useState({}); // { studentId: 'remarks text' }

  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // -------------------------------------------------------------
  // Effect 1: Load classes on initial mount
  // -------------------------------------------------------------
  useEffect(() => {
    async function loadInitialClasses() {
      try {
        setIsLoadingClasses(true);
        const responseData = await fetchClasses();
        // Classes can be an array directly or inside responseData.classes
        let extractedClasses = [];
        if (Array.isArray(responseData)) {
          extractedClasses = responseData;
        } else if (responseData && Array.isArray(responseData.classes)) {
          extractedClasses = responseData.classes;
        }

        setClassList(extractedClasses);

        // Auto-select the first class if available
        if (extractedClasses.length > 0) {
          setSelectedClassId(String(extractedClasses[0].id));
        }
      } catch (fetchError) {
        setFeedbackMessage({
          type: 'error',
          text: 'Failed to load school classes. Please check connection.',
        });
      } finally {
        setIsLoadingClasses(false);
      }
    }

    loadInitialClasses();
  }, []);

  // -------------------------------------------------------------
  // Effect 2: When selectedClassId or selectedDate changes, load students and existing records
  // -------------------------------------------------------------
  useEffect(() => {
    if (!selectedClassId) {
      return;
    }

    async function loadClassRosterAndAttendance() {
      try {
        setIsLoadingStudents(true);
        setFeedbackMessage(null);

        // Step A: Fetch all students
        const studentsResponse = await fetchStudents();
        let allStudents = [];
        if (Array.isArray(studentsResponse)) {
          allStudents = studentsResponse;
        } else if (studentsResponse && Array.isArray(studentsResponse.students)) {
          allStudents = studentsResponse.students;
        }

        // Filter students enrolled in the currently selected class
        const targetClassIdNumber = Number(selectedClassId);
        const enrolledStudents = [];
        for (let i = 0; i < allStudents.length; i++) {
          const studentItem = allStudents[i];
          const studentClassId = studentItem.enrolled_class?.id || studentItem.enrolled_class;
          if (Number(studentClassId) === targetClassIdNumber) {
            enrolledStudents.push(studentItem);
          }
        }
        setStudentRoster(enrolledStudents);

        // Step B: Fetch any attendance already marked for this date
        const existingAttendanceResponse = await fetchClassAttendance(selectedClassId, selectedDate);
        const existingRecords = existingAttendanceResponse?.attendance || [];

        // Build default attendance map (default to 'present' if not marked)
        const newAttendanceMap = {};
        const newRemarksMap = {};

        for (let i = 0; i < enrolledStudents.length; i++) {
          const studentProfileId = enrolledStudents[i].id;
          newAttendanceMap[studentProfileId] = 'present'; // Default
          newRemarksMap[studentProfileId] = '';
        }

        // Overlay existing recorded statuses
        for (let j = 0; j < existingRecords.length; j++) {
          const record = existingRecords[j];
          const recordStudentId = record.student;
          if (newAttendanceMap[recordStudentId] !== undefined) {
            newAttendanceMap[recordStudentId] = record.status;
            newRemarksMap[recordStudentId] = record.remarks || '';
          }
        }

        setAttendanceMap(newAttendanceMap);
        setRemarksMap(newRemarksMap);
      } catch (loadError) {
        setFeedbackMessage({
          type: 'error',
          text: 'Failed to load student roster or attendance data.',
        });
      } finally {
        setIsLoadingStudents(false);
      }
    }

    loadClassRosterAndAttendance();
  }, [selectedClassId, selectedDate]);

  // -------------------------------------------------------------
  // Handler: Change single student status
  // -------------------------------------------------------------
  function handleStatusChange(studentId, newStatus) {
    setAttendanceMap((prevMap) => ({
      ...prevMap,
      [studentId]: newStatus,
    }));
  }

  // -------------------------------------------------------------
  // Handler: Change single student remark
  // -------------------------------------------------------------
  function handleRemarksChange(studentId, newRemarkText) {
    setRemarksMap((prevRemarks) => ({
      ...prevRemarks,
      [studentId]: newRemarkText,
    }));
  }

  // -------------------------------------------------------------
  // Handler: Mark all students present with one click
  // -------------------------------------------------------------
  function handleMarkAllPresent() {
    const updatedMap = {};
    for (let i = 0; i < studentRoster.length; i++) {
      updatedMap[studentRoster[i].id] = 'present';
    }
    setAttendanceMap(updatedMap);
  }

  // -------------------------------------------------------------
  // Handler: Submit Bulk Attendance to Backend
  // -------------------------------------------------------------
  async function handleSubmitAttendance() {
    if (!selectedClassId) {
      setFeedbackMessage({ type: 'error', text: 'Please select a class.' });
      return;
    }

    if (studentRoster.length === 0) {
      setFeedbackMessage({ type: 'error', text: 'No students enrolled in this class to mark.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedbackMessage(null);

      // Build the list of student attendance entries
      const attendanceListPayload = [];
      for (let i = 0; i < studentRoster.length; i++) {
        const studentProfileId = studentRoster[i].id;
        attendanceListPayload.push({
          student: studentProfileId,
          status: attendanceMap[studentProfileId] || 'present',
          remarks: remarksMap[studentProfileId] || '',
        });
      }

      const bulkPayload = {
        school_class: Number(selectedClassId),
        date: selectedDate,
        attendance_list: attendanceListPayload,
      };

      const saveResponse = await bulkMarkAttendance(bulkPayload);

      setFeedbackMessage({
        type: 'success',
        text: saveResponse.message || 'Attendance saved successfully!',
      });
    } catch (saveError) {
      const errorMessage = saveError?.response?.data?.error || 'Failed to record attendance. Please try again.';
      setFeedbackMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Class Attendance"
        description="Select a class and date to mark or review daily student attendance."
        action={
          <Button
            variant="primary"
            onClick={handleSubmitAttendance}
            isLoading={isSubmitting}
            disabled={studentRoster.length === 0 || isLoadingStudents}
          >
            Save Attendance
          </Button>
        }
      />

      {/* Feedback Messages (Success / Error) */}
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

      {/* Control Bar: Class Selector & Date Picker */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
          {/* Class Dropdown */}
          <div className="flex-1">
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={isLoadingClasses || isSubmitting}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-800"
            >
              {classList.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name} ({classItem.academic_year})
                </option>
              ))}
            </select>
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-800"
            />
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="self-end md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllPresent}
            disabled={studentRoster.length === 0 || isLoadingStudents || isSubmitting}
          >
            Mark All Present
          </Button>
        </div>
      </div>

      {/* Students Table Section */}
      <SectionCard
        title={`Student Roster (${studentRoster.length} enrolled)`}
        description="Set attendance status and optional notes for each student."
      >
        {isLoadingStudents ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner text="Loading students roster..." />
          </div>
        ) : studentRoster.length === 0 ? (
          <EmptyState
            title="No students found in this class"
            description="There are currently no students enrolled in the selected class batch."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3">Admission #</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Teacher Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentRoster.map((studentItem) => {
                  const studentId = studentItem.id;
                  const studentFullName =
                    studentItem.user?.first_name || studentItem.user?.last_name
                      ? `${studentItem.user?.first_name} ${studentItem.user?.last_name}`
                      : studentItem.user?.username || `Student #${studentId}`;

                  const currentStatus = attendanceMap[studentId] || 'present';
                  const currentRemark = remarksMap[studentId] || '';

                  return (
                    <tr key={studentId} className="hover:bg-slate-50/60 transition-colors">
                      {/* Admission Number */}
                      <td className="px-4 py-3.5 font-mono text-xs font-medium text-slate-600">
                        {studentItem.admission_number || 'N/A'}
                      </td>

                      {/* Student Name */}
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        {studentFullName}
                      </td>

                      {/* Status Toggle Buttons */}
                      <td className="px-4 py-3.5 text-center">
                        <AttendanceStatusButton
                          selectedStatus={currentStatus}
                          onStatusChange={(newStatus) => handleStatusChange(studentId, newStatus)}
                          isDisabled={isSubmitting}
                        />
                      </td>

                      {/* Remarks Field */}
                      <td className="px-4 py-3.5">
                        <input
                          type="text"
                          placeholder="Optional note..."
                          value={currentRemark}
                          onChange={(e) => handleRemarksChange(studentId, e.target.value)}
                          disabled={isSubmitting}
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 focus:outline-none"
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
  );
}
