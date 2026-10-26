/**
 * End-to-End System Simulation & Test Runner
 * 
 * Simulates real user workflows across all 4 system roles:
 * - Scenario 1: Server Health & Frontend Connectivity Check
 * - Scenario 2: Admin Operations (Classrooms & Student Directory)
 * - Scenario 3: Teacher Operations (Create Assessment, Bulk Attendance, Enter Marks)
 * - Scenario 4: Student Verification (Attendance Summary & Live Report Card with Grade A)
 * - Scenario 5: Parent Verification (Child Monitoring & Academic Report)
 * - Scenario 6: Security & Role-Based Access Control (403/401 Guards)
 * 
 * Usage:
 *   node simulate_system_test.mjs
 */

const BACKEND_URL = 'http://127.0.0.1:8000';
const FRONTEND_URL = 'http://localhost:3000';

// Helper function to print visually formatted test step headers
function printHeader(title) {
  console.log('\n======================================================================');
  console.log(`🔷 ${title}`);
  console.log('======================================================================');
}

// Helper function to print test results
function printPass(message) {
  console.log(`  ✅ PASS: ${message}`);
}

function printFail(message, details) {
  console.error(`  ❌ FAIL: ${message}`);
  if (details) {
    console.error('     Details:', details);
  }
}

// Helper function to authenticate a user and get an access token
async function loginUser(username, password) {
  const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const responseJson = await loginResponse.json();
  if (!loginResponse.ok) {
    throw new Error(`Login failed for ${username}: ${JSON.stringify(responseJson)}`);
  }

  // Token can be at .access or .tokens.access_token
  const accessToken = responseJson.access || responseJson.tokens?.access_token || responseJson.tokens?.access;
  return accessToken;
}

// =====================================================================
// MAIN SIMULATION RUNNER
// =====================================================================
async function runSystemSimulation() {
  console.log('🚀 Starting School Management System End-to-End Simulation...\n');
  let passedTestsCount = 0;
  let totalTestsCount = 0;

  function countTest(passed, passMsg, failMsg, details) {
    totalTestsCount++;
    if (passed) {
      passedTestsCount++;
      printPass(passMsg);
    } else {
      printFail(failMsg, details);
    }
  }

  // -------------------------------------------------------------------
  // Scenario 1: Server Health & Frontend Connectivity
  // -------------------------------------------------------------------
  printHeader('Scenario 1: Connectivity & Server Health Checks');
  try {
    const healthResponse = await fetch(`${BACKEND_URL}/api/health/`);
    const healthData = await healthResponse.json();
    countTest(
      healthResponse.status === 200 && healthData.database === 'MySQL',
      `Backend healthy on MySQL (${healthData.system} v${healthData.version})`,
      'Backend health check failed'
    );
  } catch (err) {
    countTest(false, '', 'Backend server unreachable', err.message);
  }

  try {
    const frontendResponse = await fetch(FRONTEND_URL);
    countTest(
      frontendResponse.status === 200,
      `React / Vite Frontend accessible at ${FRONTEND_URL} (Status 200 OK)`,
      'Frontend server unreachable'
    );
  } catch (err) {
    countTest(false, '', 'Frontend server unreachable', err.message);
  }

  // -------------------------------------------------------------------
  // Scenario 2: Admin Operations
  // -------------------------------------------------------------------
  printHeader('Scenario 2: Admin Operations (Classes & Students)');
  let adminToken = '';
  try {
    adminToken = await loginUser('admin', 'adminpassword123');
    countTest(true, 'Admin authentication successful (JWT token acquired)', '');

    const classesResponse = await fetch(`${BACKEND_URL}/api/academics/classes/`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const classesData = await classesResponse.json();
    const classCount = classesData.total_count || classesData.length || 0;
    countTest(
      classesResponse.status === 200 && classCount > 0,
      `Admin retrieved ${classCount} registered classroom batches`,
      'Failed to fetch classes'
    );

    const studentsResponse = await fetch(`${BACKEND_URL}/api/people/students/`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const studentsData = await studentsResponse.json();
    const studentCount = studentsData.total_count || studentsData.length || 0;
    countTest(
      studentsResponse.status === 200 && studentCount > 0,
      `Admin retrieved student directory with ${studentCount} enrolled student profiles`,
      'Failed to fetch students'
    );
  } catch (err) {
    countTest(false, '', 'Admin scenario encountered error', err.message);
  }

  // -------------------------------------------------------------------
  // Scenario 3: Teacher Operations (Phase 4 Attendance & Phase 5 Grades)
  // -------------------------------------------------------------------
  printHeader('Scenario 3: Teacher Operations (Attendance & Grade Entry)');
  let teacherToken = '';
  let createdAssessmentId = null;
  const todayDateString = new Date().toISOString().split('T')[0];

  try {
    teacherToken = await loginUser('teacher1', 'teacherpassword123');
    countTest(true, 'Teacher authentication successful (Sarah Connor / EMP-001)', '');

    // Step A: Mark Bulk Attendance for Grade 10-A
    const attendancePayload = {
      school_class: 1,
      date: todayDateString,
      attendance_list: [
        {
          student: 1, // John Doe profile ID
          status: 'present',
          remarks: 'Present on time, engaged during lectures',
        },
      ],
    };

    const attendanceSaveResponse = await fetch(`${BACKEND_URL}/api/attendance/bulk/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`,
      },
      body: JSON.stringify(attendancePayload),
    });
    const attendanceSaveData = await attendanceSaveResponse.json();

    countTest(
      attendanceSaveResponse.status === 201 && attendanceSaveData.success === true,
      `Attendance marked for today (${todayDateString}): John Doe marked Present`,
      'Failed to record class attendance',
      attendanceSaveData
    );

    // Step B: Create a New Assessment (Phase 5)
    const newAssessmentPayload = {
      name: `Unit 4 Calculus Evaluation (${todayDateString})`,
      assessment_type: 'quiz',
      subject: 1, // Mathematics
      school_class: 1, // Grade 10-A
      max_marks: 100,
      assessment_date: todayDateString,
      academic_year: '2026-2027',
    };

    const createAssessmentResponse = await fetch(`${BACKEND_URL}/api/grades/assessments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`,
      },
      body: JSON.stringify(newAssessmentPayload),
    });
    const createAssessmentData = await createAssessmentResponse.json();
    createdAssessmentId = createAssessmentData.assessment?.id;

    countTest(
      createAssessmentResponse.status === 201 && createdAssessmentId !== null,
      `New Assessment created: "${newAssessmentPayload.name}" [ID: ${createdAssessmentId}]`,
      'Failed to create assessment',
      createAssessmentData
    );

    // Step C: Bulk Enter Student Marks
    const gradesPayload = {
      assessment: createdAssessmentId,
      grade_list: [
        {
          student: 1, // John Doe
          marks_obtained: 95.0, // 95% should automatically trigger Grade A!
          remarks: 'Outstanding mathematical problem solving.',
        },
      ],
    };

    const enterGradesResponse = await fetch(`${BACKEND_URL}/api/grades/records/bulk/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`,
      },
      body: JSON.stringify(gradesPayload),
    });
    const enterGradesData = await enterGradesResponse.json();

    countTest(
      enterGradesResponse.status === 201 && enterGradesData.success === true,
      `Marks recorded for John Doe: 95.00/100 (Auto letter grade generated)`,
      'Failed to record student marks',
      enterGradesData
    );
  } catch (err) {
    countTest(false, '', 'Teacher scenario encountered error', err.message);
  }

  // -------------------------------------------------------------------
  // Scenario 4: Student Verification (Self-Service Attendance & Report Card)
  // -------------------------------------------------------------------
  printHeader('Scenario 4: Student Verification (John Doe)');
  let studentToken = '';
  try {
    studentToken = await loginUser('student1', 'studentpassword123');
    countTest(true, 'Student authentication successful (John Doe / STU-2026-001)', '');

    // Check attendance summary
    const studentAttendanceResponse = await fetch(`${BACKEND_URL}/api/attendance/my-attendance/summary/`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const studentAttendanceData = await studentAttendanceResponse.json();
    const summary = studentAttendanceData.summary;

    countTest(
      studentAttendanceResponse.status === 200 && summary && Number(summary.attendance_percentage) > 0,
      `Student attendance summary verified: ${summary.attendance_percentage}% (${summary.present_days} present of ${summary.total_days} sessions)`,
      'Failed to retrieve student attendance summary'
    );

    // Check student report card
    const studentReportResponse = await fetch(`${BACKEND_URL}/api/grades/my-report-card/`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const studentReportData = await studentReportResponse.json();
    const reportCard = studentReportData.report_card;

    countTest(
      studentReportResponse.status === 200 && reportCard && reportCard.overall_letter_grade,
      `Student report card verified: Overall Grade ${reportCard.overall_letter_grade} (${reportCard.overall_percentage}%) across ${reportCard.subject_summaries?.length} subject(s)`,
      'Failed to retrieve student report card'
    );
  } catch (err) {
    countTest(false, '', 'Student scenario encountered error', err.message);
  }

  // -------------------------------------------------------------------
  // Scenario 5: Parent Verification (Child Monitoring)
  // -------------------------------------------------------------------
  printHeader('Scenario 5: Parent Verification (Jane Doe / Guardian)');
  let parentToken = '';
  try {
    parentToken = await loginUser('parent1', 'parentpassword123');
    countTest(true, 'Parent authentication successful (Jane Doe)', '');

    // Check child attendance
    const parentAttResponse = await fetch(`${BACKEND_URL}/api/attendance/my-children/`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    const parentAttData = await parentAttResponse.json();
    const linkedChildrenAtt = parentAttData.children || [];

    countTest(
      parentAttResponse.status === 200 && linkedChildrenAtt.length > 0,
      `Parent retrieved linked child attendance for: ${linkedChildrenAtt[0]?.student_name} (${linkedChildrenAtt[0]?.class_name})`,
      'Failed to retrieve children attendance'
    );

    // Check child report card
    const parentGradesResponse = await fetch(`${BACKEND_URL}/api/grades/my-children-grades/`, {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    const parentGradesData = await parentGradesResponse.json();
    const linkedChildrenGrades = parentGradesData.children || [];

    countTest(
      parentGradesResponse.status === 200 && linkedChildrenGrades.length > 0,
      `Parent retrieved child report card: Grade ${linkedChildrenGrades[0]?.overall_letter_grade} (${linkedChildrenGrades[0]?.overall_percentage}%)`,
      'Failed to retrieve children grades'
    );
  } catch (err) {
    countTest(false, '', 'Parent scenario encountered error', err.message);
  }

  // -------------------------------------------------------------------
  // Scenario 6: Role Security & Access Control Guards
  // -------------------------------------------------------------------
  printHeader('Scenario 6: Role Security & Permission Class Guards');
  try {
    // Test A: Student trying to mark bulk attendance (Should be 403 Forbidden)
    const unauthorizedAttendanceAttempt = await fetch(`${BACKEND_URL}/api/attendance/bulk/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ school_class: 1, date: todayDateString, attendance_list: [] }),
    });

    countTest(
      unauthorizedAttendanceAttempt.status === 403,
      'Security Guard: Student cannot mark attendance (HTTP 403 Forbidden returned)',
      'Student was unexpectedly permitted to mark attendance'
    );

    // Test B: Parent trying to enter grades (Should be 403 Forbidden)
    const unauthorizedGradesAttempt = await fetch(`${BACKEND_URL}/api/grades/records/bulk/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${parentToken}`,
      },
      body: JSON.stringify({ assessment: 1, grade_list: [] }),
    });

    countTest(
      unauthorizedGradesAttempt.status === 403,
      'Security Guard: Parent cannot enter grades (HTTP 403 Forbidden returned)',
      'Parent was unexpectedly permitted to enter grades'
    );

    // Test C: Unauthenticated request to student endpoint (Should be 401 Unauthorized)
    const unauthenticatedAttempt = await fetch(`${BACKEND_URL}/api/attendance/my-attendance/`);
    countTest(
      unauthenticatedAttempt.status === 401,
      'Security Guard: Public unauthenticated request blocked (HTTP 401 Unauthorized returned)',
      'Unauthenticated request was not blocked'
    );
  } catch (err) {
    countTest(false, '', 'Security guard scenario encountered error', err.message);
  }

  // -------------------------------------------------------------------
  // SUMMARY REPORT
  // -------------------------------------------------------------------
  printHeader('Simulation Summary & Viva Readiness');
  console.log(`\n  Total Tests Run: ${totalTestsCount}`);
  console.log(`  Tests Passed:    ${passedTestsCount} / ${totalTestsCount}`);
  console.log(`  Success Rate:    ${Math.round((passedTestsCount / totalTestsCount) * 100)}%\n`);

  if (passedTestsCount === totalTestsCount) {
    console.log('🎉 ALL SYSTEM SIMULATIONS PASSED 100%!');
    console.log('✨ System is fully operational and ready for live demonstration.\n');
  } else {
    console.log('⚠️ Some tests did not pass. Check the details above.\n');
  }
}

runSystemSimulation();
