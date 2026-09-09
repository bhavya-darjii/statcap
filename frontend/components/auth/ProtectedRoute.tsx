import { useState, useEffect, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import AuthLoadingScreen from '../shared/AuthLoadingScreen';
import NotFoundPage from '../../pages/shared/NotFoundPage';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  fallback?: ReactNode;
}

const ROLE_PATHS: Record<string, string> = {
  admin:          '/directorate',
  director:       '/directorate',
  student:        '/trainee',
  trainee:        '/trainee',
  hod:            '/hod',
  registrar:      '/registrar',
  setup:          '/setup',
  statcapAdmin:   '/statcap-admin',
  examController: '/exam-controller',
  parent:         '/parent',
  teacher:        '/instructor',
  instructor:     '/instructor',
  pending:        '/trainee',
};

const isRoleAuthorized = (userRole: string, allowedRoles: string[]): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (allowedRoles.includes(userRole)) return true;

  // Cross-compatibility between MoSPI roles and legacy layout routes
  const normalized = userRole.toLowerCase();
  if ((normalized === 'trainee' || normalized === 'pending' || normalized === 'student') && 
      (allowedRoles.includes('student') || allowedRoles.includes('trainee') || allowedRoles.includes('pending'))) {
    return true;
  }
  if ((normalized === 'instructor' || normalized === 'teacher') && 
      (allowedRoles.includes('teacher') || allowedRoles.includes('instructor'))) {
    return true;
  }
  if ((normalized === 'director' || normalized === 'admin' || normalized === 'statcapadmin') && 
      (allowedRoles.includes('admin') || allowedRoles.includes('director') || allowedRoles.includes('statcapAdmin'))) {
    return true;
  }

  return false;
};

const getResolvedRole = (user: { id?: string; email?: string; user_metadata?: Record<string, any> } | null, docRole?: string): string => {
  if (docRole && docRole !== 'pending') return docRole;
  if (user?.user_metadata?.user_type) return user.user_metadata.user_type;
  if (user?.user_metadata?.role) return user.user_metadata.role;

  const email = (user?.email || '').toLowerCase();
  if (email.includes('director') || email.includes('admin')) return 'director';
  if (email.includes('instructor') || email.includes('teacher') || email.includes('nssta')) return 'instructor';
  if (email.includes('trainee') || email.includes('student')) return 'trainee';

  const cached = localStorage.getItem('cachedUserRole');
  if (cached) return cached;

  return 'trainee';
};

const ProtectedRoute = ({ children, allowedRoles, fallback }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  // null = not authenticated, false = wrong role, User object = authenticated & authorized
  const [user, setUser] = useState<object | null | false>(undefined as unknown as null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async (session: { user?: { id: string; email?: string; user_metadata?: Record<string, any> } } | null) => {
      if (session?.user) {
        let docRole: string | undefined;
        try {
          const { data: userDoc } = await supabase
            .from('users')
            .select('user_type')
            .eq('id', session.user.id)
            .maybeSingle();

          if (userDoc?.user_type) {
            docRole = userDoc.user_type;
          }
        } catch {
          // Handled by getResolvedRole
        }

        const resolvedRole = getResolvedRole(session.user, docRole);

        if (mounted) {
          setUserRole(resolvedRole);
          localStorage.setItem('cachedUserRole', resolvedRole);
          const authorized = isRoleAuthorized(resolvedRole, allowedRoles || []);
          setUser(authorized ? session.user : false);
        }
      } else {
        if (mounted) setUser(null);
      }
      if (mounted) {
        setLoading(false);
        setInitialized(true);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAuth(session as Parameters<typeof checkAuth>[0]);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAuth(session as Parameters<typeof checkAuth>[0]);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [allowedRoles]);

  // Show skeleton while role is being verified — no blank screen
  if (loading || !initialized) return fallback ?? <AuthLoadingScreen />;

  // Not authenticated — redirect to login
  if (user === null) {
    return <Navigate to="/" replace />;
  }

  // Wrong role — redirect to their own role portal
  if (user === false) {
    const destination = (userRole && ROLE_PATHS[userRole]) || '/trainee';
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
