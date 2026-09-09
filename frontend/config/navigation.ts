/* eslint-disable */
// @ts-nocheck
export const INSTRUCTOR_NAV = [
  { path: '/instructor/create-course', label: 'Course Generator', highlight: true },
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
