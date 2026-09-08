/* eslint-disable */
// @ts-nocheck
export const INSTRUCTOR_NAV = [
  { path: '/instructor', label: 'Home', category: 'Overview' },
  { path: '/instructor/profile', label: 'Cadre Profile', category: 'Overview' },
  { path: '/instructor/lesson-plan', label: 'Training Plan', category: 'Cadre Modules' },
  { path: '/instructor/lecture-overview', label: 'Lecture Overview', category: 'Cadre Modules' },
  { path: '/instructor/question-bank', label: 'Question Bank', category: 'Cadre Modules' },
  { path: '/instructor/examination', label: 'Assessments', category: 'Cadre Modules' },
  { path: '/instructor/marks', label: 'Evaluation & Scores', category: 'Competencies' },
  { path: '/instructor/course-analytics', label: 'Cohort Analytics', category: 'Competencies' },
  { path: '/instructor/trainee-analytics', label: 'Skill Gap Analytics', category: 'Competencies' },
  { path: '/instructor/create-course', label: '+ New Module', highlight: true },
];

export const DIRECTORATE_NAV = [
  { path: '/directorate', label: 'Directorate Capacity Dashboard' },
];

// Alias for backward compat
export const ADMIN_NAV = DIRECTORATE_NAV;

export const HOD_NAV = [
  { path: '/hod', label: 'Division Dashboard' },
];

export const TRAINEE_NAV = [
  { path: '/trainee', label: 'Competency & Training Dashboard' },
  { path: '/trainee/credentials', label: 'Verifiable Credentials' },
  { path: '/trainee/lecture-vault', label: 'Course Library' },
];

export const REGISTRAR_NAV = [
  { path: '/registrar', label: 'Administration' },
];

export const EXAM_CONTROLLER_NAV = [
  { path: '/exam-controller', label: 'Assessments Cell' },
];

export const STATCAP_ADMIN_NAV = [
  { path: '/statcap-admin', label: 'MoSPI National Hub' },
];

export const DIRECTOR_NAV = [
  { path: '/principal', label: 'Director General' },
];

export const PRINCIPAL_NAV = DIRECTOR_NAV;

export const getNavForRole = (role) => {
  const map = {
    trainee: TRAINEE_NAV,
    student: TRAINEE_NAV,
    instructor: INSTRUCTOR_NAV,
    teacher: INSTRUCTOR_NAV,
    director: DIRECTORATE_NAV,
    admin: DIRECTORATE_NAV,
    hod: HOD_NAV,
    registrar: REGISTRAR_NAV,
    examController: EXAM_CONTROLLER_NAV,
    statcapAdmin: STATCAP_ADMIN_NAV,
    principal: DIRECTOR_NAV,
  };
  return map[role] || TRAINEE_NAV;
};
