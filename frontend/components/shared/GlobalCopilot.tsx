/* eslint-disable */
// @ts-nocheck
import { useLocation } from 'react-router-dom';
import StatCapCopilot from './StatCapCopilot';

const HIDE_COPILOT_PATHS = ['/', '/pending', '/setup'];

const ROLE_BASE_PATHS = {
  admin: ['/directorate', '/admin', '/statcap-admin'],
  director: ['/directorate', '/admin'],
  statcapAdmin: ['/statcap-admin'],
  hod: ['/hod'],
  student: ['/trainee', '/student'],
  trainee: ['/trainee', '/student'],
  parent: ['/parent'],
  registrar: ['/registrar'],
  examController: ['/exam-controller'],
  teacher: ['/instructor', '/teacher'],
  instructor: ['/instructor', '/teacher'],
  principal: ['/principal'],
};

const GlobalCopilot = ({ userRole }) => {
  const location = useLocation();

  if (HIDE_COPILOT_PATHS.includes(location.pathname)) return null;
  if (!userRole || userRole === 'setup') return null;

  // Hide copilot if user is on a 404 or an unauthorized role page
  const allowedPrefixes = ROLE_BASE_PATHS[userRole];
  if (allowedPrefixes && !allowedPrefixes.some(prefix => location.pathname.startsWith(prefix))) {
    return null;
  }
  
  return <StatCapCopilot userRole={userRole} />;
};

export default GlobalCopilot;
