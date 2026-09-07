/* eslint-disable */
// @ts-nocheck
export const INSTRUCTOR_NAV = [
  { path: '/teacher', label: 'Home', category: 'Overview' },
  { path: '/teacher/profile', label: 'Cadre Profile', category: 'Overview' },
  { path: '/teacher/lesson-plan', label: 'Training Plan', category: 'Cadre Modules' },
  { path: '/teacher/lecture-overview', label: 'Lecture Overview', category: 'Cadre Modules' },
  { path: '/teacher/question-bank', label: 'Question Bank', category: 'Cadre Modules' },
  { path: '/teacher/examination', label: 'Assessments', category: 'Cadre Modules' },
  { path: '/teacher/marks', label: 'Evaluation & Scores', category: 'Competencies' },
  { path: '/teacher/course-analytics', label: 'Cohort Analytics', category: 'Competencies' },
  { path: '/teacher/student-analytics', label: 'Skill Gap Analytics', category: 'Competencies' },
  { path: '/teacher/create-course', label: '+ New Module', highlight: true },
];

export const TEACHER_NAV = INSTRUCTOR_NAV;

export const ADMIN_NAV = [
  { path: '/admin', label: 'Directorate Dashboard' },
];

export const HOD_NAV = [
  { path: '/hod', label: 'Division Dashboard' },
];

export const TRAINEE_NAV = [
  { path: '/student', label: 'Dashboard' },
  { path: '/student/lecture-vault', label: 'Official Training Vault' },
];

export const STUDENT_NAV = TRAINEE_NAV;

export const REGISTRAR_NAV = [
  { path: '/registrar', label: 'Administration' },
];

export const EXAM_CONTROLLER_NAV = [
  { path: '/exam-controller', label: 'Assessments Cell' },
];

export const STATCAP_ADMIN_NAV = [
  { path: '/velaar-admin', label: 'MoSPI National Hub' },
];

export const VELAAR_ADMIN_NAV = STATCAP_ADMIN_NAV;

export const DIRECTOR_NAV = [
  { path: '/principal', label: 'Director General' },
];

export const PRINCIPAL_NAV = DIRECTOR_NAV;

export const getNavForRole = (role) => {
  const map = {
    teacher: INSTRUCTOR_NAV,
    admin: ADMIN_NAV,
    hod: HOD_NAV,
    student: TRAINEE_NAV,
    registrar: REGISTRAR_NAV,
    examController: EXAM_CONTROLLER_NAV,
    velaarAdmin: STATCAP_ADMIN_NAV,
    principal: DIRECTOR_NAV,
  };
  return map[role] || [];
};
