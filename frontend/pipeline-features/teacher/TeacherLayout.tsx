/* eslint-disable */
// @ts-nocheck
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { INSTRUCTOR_NAV } from '../config/navigation';
import { useCopilotContext } from '../context/CopilotContext';
import { extractGoogleAvatarUrl, cacheTeacherAvatar } from '../utils/avatarUtils';
import { preloadCoursePresentationHistory } from '../utils/presentationHistoryUtils';
import UnifiedLayout from './UnifiedLayout';
import { extractFirstName } from '../utils/nameUtils';

const TEACHER_GREETINGS = [
  "National Statistical Systems Training Academy (NSSTA),",
  "Welcome back to the MoSPI Course Director Hub,",
  "Strengthening capacity building across India's statistical infrastructure,",
  "Formulating official survey methodologies and competency assessments,",
  "Empowering Indian Statistical Service (ISS) officers,"
];

const TeacherLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [greetingBase] = useState(() => TEACHER_GREETINGS[Math.floor(Math.random() * TEACHER_GREETINGS.length)]);
  const [greeting, setGreeting] = useState(greetingBase + " Instructor.");
  const { setPageContext } = useCopilotContext();
  const [teacherName, setTeacherName] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchTeacherData = async (user) => {
      // Pre-cache Google account avatar so Profile page loads instantly
      const gAvatar = extractGoogleAvatarUrl(user);
      if (gAvatar) {
        cacheTeacherAvatar(gAvatar);
      }

      let tName = "Teacher";
      try {
        const { data: userData } = await supabase.from('users').select('full_name').eq('id', user.id).single();
        if (userData && userData.full_name) {
          tName = extractFirstName(userData.full_name);
        } else if (user.user_metadata?.full_name) {
          tName = extractFirstName(user.user_metadata.full_name);
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }

      if (mounted) {
        setTeacherName(tName);
        setGreeting(`${greetingBase} ${tName}.`);
      }

      try {
        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .eq('teacher_id', user.id)
          .limit(1);
        
        if (coursesData && coursesData.length > 0) {
          const docData = coursesData[0];
          const courseData = { 
            teacherName: tName, 
            subjectName: docData.name || docData.subjectName,
            lessonPlan: docData.lesson_plan || docData.lessonPlan,
            totalLectures: docData.total_lectures || docData.totalLectures,
            examPatterns: docData.exam_patterns || docData.examPatterns,
            ...docData 
          };
          if (mounted) {
            setCourse(courseData);
            setPageContext({ course: courseData });
            // Preload presentation history for instant 0ms access in Lecture Overview
            preloadCoursePresentationHistory(courseData.id);
            
            let allLectures = [];
            if (courseData.roadmap && !Array.isArray(courseData.roadmap)) {
              Object.entries(courseData.roadmap).forEach(([div, lecs]) => {
                lecs.forEach(l => allLectures.push({ ...l, division: div }));
              });
            } else if (Array.isArray(courseData.roadmap)) {
              allLectures = courseData.roadmap.map(l => ({ ...l, division: "A" }));
            }

            allLectures.sort((a, b) => new Date(a.fullIsoDate || 0) - new Date(b.fullIsoDate || 0));
            const nextUp = allLectures.find(l => !l.isCompleted) || allLectures[allLectures.length - 1];
            setCurrentLecture(nextUp);
          }
        } else {
          console.log("No courses found for this teacher.");
        }
      } catch (err) {
        console.error("Error loading course:", err);
      }
      if (mounted) setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchTeacherData(session.user);
      } else if (mounted) {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only re-fetch on actual sign-in events, NOT on TOKEN_REFRESHED
      // TOKEN_REFRESHED fires every few minutes and would cause an infinite request loop
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          fetchTeacherData(session.user);
        } else if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="statcap-page-shell"><div className="skeleton-base" style={{ height: '32px', width: '280px', borderRadius: '8px', marginBottom: '8px' }} /></div>;
  }

  const title = course ? course.subjectName : `Welcome to StatCap${teacherName ? `, ${teacherName}!` : '!'}`;
  const subtitle = course ? greeting : "";

  const headerActions = course && (location.pathname === '/instructor' || location.pathname === '/teacher') ? (
    <div className="progress-badge">
      {(Array.isArray(course?.roadmap) ? course?.roadmap : Object.values(course?.roadmap || {}).flat()).filter(l => l.isCompleted).length} / {(course?.totalLectures || 0) * (course?.divisions?.length || 1)} Lectures Done
    </div>
  ) : null;

  return (
    <UnifiedLayout 
      title={title} 
      subtitle={subtitle} 
      navItems={INSTRUCTOR_NAV}
      headerActions={headerActions}
    >
      <Outlet context={{ course, setCourse, currentLecture, setCurrentLecture, loading }} />
    </UnifiedLayout>
  );
};

export default TeacherLayout;
