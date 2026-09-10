/* eslint-disable */
// @ts-nocheck
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import MeshBackground from './components/shared/MeshBackground';
import GlobalCopilot from './components/shared/GlobalCopilot';
import { CopilotProvider } from './context/CopilotContext';
import AuthLoadingScreen from './components/shared/AuthLoadingScreen';
import { extractGoogleAvatarUrl, cacheTeacherAvatar } from './utils/avatarUtils';

import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import TraineeDashboardSkeleton from './components/skeletons/TraineeDashboardSkeleton';
import NotFoundPage from './pages/shared/NotFoundPage';

// ── Layouts ──────────────────────────────────────────────────────────────────
import TraineeLayout from './layouts/TraineeLayout';
import InstructorLayout from './layouts/InstructorLayout';
import DirectorateLayout from './layouts/DirectorateLayout';

// ── Trainee pages ─────────────────────────────────────────────────────────────
import TraineeDashboard from './pages/trainee/TraineeDashboard';
import LectureVault from './pages/trainee/LectureVault';
import TraineeCredentialsPage from './pages/trainee/TraineeCredentialsPage';
import TraineeAssessmentsPage from './pages/trainee/TraineeAssessmentsPage';

// ── Instructor pages ──────────────────────────────────────────────────────────
import InstructorHome from './pages/instructor/InstructorHome';
import LessonPlanPage from './pages/instructor/LessonPlanPage';
import QuestionBankPage from './pages/instructor/QuestionBankPage';
import ExaminationPage from './pages/instructor/ExaminationPage';
import ExaminationEditor from './pages/instructor/ExaminationEditor';
import CourseGeneratorPage from './pages/instructor/CourseGeneratorPage';
import AssessmentGeneratorPage from './pages/instructor/AssessmentGeneratorPage';
import LectureOverview from './pages/instructor/LectureOverview';
import CourseAnalytics from './pages/instructor/CourseAnalytics';
import InstructorProfile from './pages/instructor/InstructorProfile';
import MarksDashboard from './pages/instructor/MarksDashboard';
import EditMarks from './pages/instructor/EditMarks';
import TraineeAnalytics from './pages/instructor/TraineeAnalytics';

// ── Directorate pages ─────────────────────────────────────────────────────────
import DirectorateDashboard from './pages/directorate/DirectorateDashboard';

// ── Auth ──────────────────────────────────────────────────────────────────────
import PendingPage from './pages/auth/PendingPage';

function App() {
  const [authResolved, setAuthResolved] = useState(false);
  const [initialUser, setInitialUser] = useState(undefined);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    let mounted = true;

    const checkUser = async (session) => {
      if (!session?.user) {
        if (mounted) {
          setInitialUser(null);
          setUserRole(null);
          localStorage.removeItem('cachedUserRole');
          setAuthResolved(true);
        }
        return;
      }

      const user = session.user;
      const gAvatar = extractGoogleAvatarUrl(user);
      if (gAvatar) cacheTeacherAvatar(gAvatar);

      let docRole: string | undefined;
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', user.id)
          .maybeSingle();
        if (userData?.user_type) docRole = userData.user_type;
      } catch (e) { /* fallback */ }

      let role = 'trainee';
      if (docRole && docRole !== 'pending') {
        role = docRole;
      } else if (user.user_metadata?.user_type) {
        role = user.user_metadata.user_type;
      } else if (user.user_metadata?.role) {
        role = user.user_metadata.role;
      } else {
        const email = (user.email || '').toLowerCase();
        if (email.includes('director') || email.includes('admin')) role = 'director';
        else if (email.includes('instructor') || email.includes('teacher') || email.includes('nssta')) role = 'instructor';
        else role = localStorage.getItem('cachedUserRole') || 'trainee';
      }

      if (mounted) {
        setInitialUser(user);
        setUserRole(role);
        localStorage.setItem('cachedUserRole', role);
        setAuthResolved(true);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => checkUser(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUser(session);
    });

    return () => { mounted = false; subscription?.unsubscribe(); };
  }, []);

  const RootRedirect = () => {
    if (!initialUser) return <LoginPage />;
    if (!userRole) return <AuthLoadingScreen />;
    const role = userRole.toLowerCase();
    if (role === 'director' || role === 'admin') return <Navigate to="/directorate" replace />;
    if (role === 'instructor' || role === 'teacher') return <Navigate to="/instructor" replace />;
    return <Navigate to="/trainee" replace />;
  };

  return (
    <Router>
      <CopilotProvider>
        <div className="app-layout">
          <div className="mesh-background-wrapper">
            <MeshBackground />
          </div>

          {authResolved ? (
            <div className="content-layer">
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<RootRedirect />} />

                {/* ── Trainee Officer (ISS / SSS / FOD) ── */}
                <Route path="/trainee" element={
                  <ProtectedRoute allowedRoles={['trainee', 'pending']} fallback={<TraineeDashboardSkeleton />}>
                    <TraineeLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<TraineeDashboard />} />
                  <Route path="assessments" element={<TraineeAssessmentsPage />} />
                  <Route path="credentials" element={<TraineeCredentialsPage />} />
                  <Route path="lecture-vault" element={<LectureVault />} />
                  <Route path="lecture-vault/:subjectSlug" element={<LectureVault />} />
                </Route>

                {/* ── NSSTA Instructor / Course Director ── */}
                <Route path="/instructor" element={
                  <ProtectedRoute allowedRoles={['instructor', 'teacher']}>
                    <InstructorLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/instructor/create-course" replace />} />
                  <Route path="lesson-plan" element={<LessonPlanPage />} />
                  <Route path="question-bank" element={<QuestionBankPage />} />
                  <Route path="examination" element={<ExaminationPage />} />
                  <Route path="examination/:examId" element={<ExaminationEditor />} />
                  <Route path="examination/editor" element={<ExaminationEditor />} />
                  <Route path="lecture-overview" element={<LectureOverview />} />
                  <Route path="lecture-overview/:lectureId" element={<LectureOverview />} />
                  <Route path="course-analytics" element={<CourseAnalytics />} />
                  <Route path="profile" element={<InstructorProfile />} />
                  <Route path="marks" element={<MarksDashboard />} />
                  <Route path="marks/edit" element={<MarksDashboard />} />
                  <Route path="marks/edit/:examId" element={<EditMarks />} />
                  <Route path="trainee-analytics" element={<TraineeAnalytics />} />
                  <Route path="trainee-risk" element={<TraineeAnalytics />} />
                  <Route path="create-course" element={<CourseGeneratorPage />} />
                  <Route path="assessment-generator" element={<AssessmentGeneratorPage />} />
                </Route>

                {/* ── MoSPI Directorate ── */}
                <Route path="/directorate" element={
                  <ProtectedRoute allowedRoles={['director', 'admin']}>
                    <DirectorateLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<DirectorateDashboard />} />
                </Route>

                {/* ── Pending Approval ── */}
                <Route path="/pending" element={
                  <ProtectedRoute allowedRoles={['pending']} fallback={<AuthLoadingScreen />}>
                    <PendingPage />
                  </ProtectedRoute>
                } />

                {/* Catch-all */}
                <Route path="*" element={initialUser ? <NotFoundPage userRole={userRole} /> : <Navigate to="/" replace />} />
              </Routes>

              {userRole !== 'pending' && <GlobalCopilot userRole={userRole} />}
            </div>
          ) : (
            <div className="content-layer">
              <AuthLoadingScreen />
            </div>
          )}
        </div>
      </CopilotProvider>
    </Router>
  );
}

export default App;
