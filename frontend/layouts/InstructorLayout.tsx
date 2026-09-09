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

const INSTRUCTOR_GREETINGS = [
  "National Statistical Systems Training Academy (NSSTA),",
  "Welcome back to the MoSPI Course Director Hub,",
  "Strengthening capacity building across India's statistical infrastructure,",
  "Formulating official survey methodologies and competency assessments,",
  "Empowering Indian Statistical Service (ISS) officers,"
];

const InstructorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [greetingBase] = useState(() => INSTRUCTOR_GREETINGS[Math.floor(Math.random() * INSTRUCTOR_GREETINGS.length)]);
  const [greeting, setGreeting] = useState(greetingBase + " Instructor.");
  const { setPageContext } = useCopilotContext();
  const [instructorName, setInstructorName] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchInstructorData = async (user) => {
      // Pre-cache Google account avatar so Profile page loads instantly
      const gAvatar = extractGoogleAvatarUrl(user);
      if (gAvatar) {
        cacheTeacherAvatar(gAvatar);
      }

      let iName = "Instructor";
      try {
        const { data: userData } = await supabase.from('users').select('full_name').eq('id', user.id).maybeSingle();
        if (userData && userData.full_name) {
          iName = userData.full_name.split(' ')[0];
        } else if (user.user_metadata?.full_name) {
          iName = user.user_metadata.full_name.split(' ')[0];
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }

      if (mounted) {
        setInstructorName(iName);
        setGreeting(`${greetingBase} ${iName}.`);
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
            instructorName: iName, 
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
          console.log("No courses found for this instructor.");
        }
      } catch (err) {
        console.error("Error loading course:", err);
      }
      if (mounted) setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchInstructorData(session.user);
      } else if (mounted) {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only re-fetch on actual sign-in events, NOT on TOKEN_REFRESHED
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          fetchInstructorData(session.user);
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

  const title = course ? course.subjectName : `Welcome to StatCap${instructorName ? `, ${instructorName}!` : '!'}`;
  const subtitle = course ? greeting : "";

  const headerActions = course && (location.pathname === '/instructor') ? (
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

export default InstructorLayout;
