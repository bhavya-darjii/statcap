/* eslint-disable */
// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ActiveLecture, RoadmapSidebar } from '../../components/instructor/CourseChecklist';
import HomePageSkeleton from '../../components/skeletons/HomePageSkeleton';
import { generateLecturePresentation } from '../../services/aiService';
import { downloadLecturePresentation } from '../../utils/presentationExport';
import { savePresentationHistory } from '../../services/dataService';
import GlassSelect from '../../components/shared/GlassSelect';
import './InstructorHome.css';

const collectLectures = (roadmap) => {
  if (!roadmap) return [];
  if (Array.isArray(roadmap)) return roadmap;
  return Object.entries(roadmap).flatMap(([division, lectures]) =>
    (lectures || []).map((l) => ({ ...l, division }))
  );
};

const GENERATION_STEPS = [
  { label: 'Analyzing lecture topics & checklistâ€¦', duration: 4000 },
  { label: 'Structuring slide sequenceâ€¦',           duration: 5000 },
  { label: 'Writing concept explanationsâ€¦',         duration: 7000 },
  { label: 'Crafting analogies & examplesâ€¦',        duration: 6000 },
  { label: 'Adding real-world applicationsâ€¦',       duration: 5000 },
  { label: 'Writing speaker notesâ€¦',                duration: 6000 },
  { label: 'Generating presentation fileâ€¦',         duration: 3000 },
];

const PptCard = ({ course, currentLecture }) => {
  const lectures = collectLectures(course?.roadmap);
  const [selectedId, setSelectedId] = useState(() => {
    const l = currentLecture || lectures[0];
    return l ? `${l.division || 'A'}-${l.lectureNum || 0}` : '';
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  // glass-dropdown open state (replaces the old ppt-card__select native <select>)
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    let interval;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Standard way to trigger browser warning
    };
    if (loading) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
      window.addEventListener('beforeunload', handleBeforeUnload);
    } else {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [loading]);

  // Step through generation stages
  useEffect(() => {
    if (!loading) {
      setStepIndex(0);
      setProgress(0);
      return;
    }
    const totalDuration = GENERATION_STEPS.reduce((a, s) => a + s.duration, 0);
    let elapsed = 0;
    const timers = [];
    GENERATION_STEPS.forEach((step, i) => {
      const t = setTimeout(() => setStepIndex(i), elapsed);
      timers.push(t);
      elapsed += step.duration;
    });
    let progressElapsed = 0;
    const progressInterval = setInterval(() => {
      progressElapsed += 200;
      setProgress(Math.min(92, Math.round((progressElapsed / totalDuration) * 100)));
    }, 200);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(progressInterval);
    };
  }, [loading]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    if (dropOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropOpen]);

  const selectedLecture = lectures.find(
    (l) => `${l.division || 'A'}-${l.lectureNum || 0}` === selectedId
  ) || currentLecture || lectures[0];

  const handleGenerate = async () => {
    if (!selectedLecture || loading || done) return;
    setLoading(true);
    setTimer(0);
    setDone(false);
    setError('');
    try {
      const response = await generateLecturePresentation({
        subjectName: course?.subjectName,
        lecture: selectedLecture,
        overview: selectedLecture?.lecturePreparation || null,
        teachingStyle: 'Conceptual',
        course: {
          modules: course?.modules || [],
          lessonPlan: course?.lessonPlan || null,
        },
      });
      if (response?.error) {
        setError('API OVERLOADED â€” RETRY');
      } else {
        await downloadLecturePresentation(response, {
          subjectName: course?.subjectName,
          lectureTitle: selectedLecture.title,
        });
        await savePresentationHistory(course, selectedLecture, response);
        setProgress(100);
        await new Promise(r => setTimeout(r, 400));
        setDone(true);
        setTimeout(() => setDone(false), 3500);
      }
    } catch (err) {
      console.error(err);
      if (err.message && err.message.includes('fetch')) {
        setError('NETWORK ERROR â€” CHECK CONNECTION');
      } else {
        setError('SERVER ERROR â€” RETRY');
      }
    }
    setLoading(false);
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const currentStep = GENERATION_STEPS[stepIndex];

  const btnLabel = loading
    ? 'GENERATING...'
    : done ? 'DOWNLOADED' : error ? error : 'GENERATE PRESENTATION';

  const selectedLabel = selectedLecture
    ? `Div ${selectedLecture.division || 'A'} â€” Lecture ${selectedLecture.lectureNum}: ${selectedLecture.title}`
    : 'Select a lecture';

  return (
    <div className="ppt-card glass-card">
      <div className="ppt-card__header">
        <h3>Generate Lecture Presentation</h3>
        <p>Select a lecture and generate a complete, content-rich PowerPoint with real-world examples, definitions, and speaker notes â€” ready to deliver.</p>
      </div>

      <div className="ppt-card__body">
        {lectures.length > 0 ? (
          <>
            {!loading && (
              <GlassSelect
                direction="up"
                value={selectedId}
                onChange={(id) => {
                  setSelectedId(id);
                  setError('');
                }}
                options={lectures.map((l) => ({
                  value: `${l.division || 'A'}-${l.lectureNum || 0}`,
                  label: `Div ${l.division || 'A'} â€” Lecture ${l.lectureNum}: ${l.title}`,
                }))}
              />
            )}

            {loading && (
              <div className="ppt-progress-panel">
                <div className="ppt-progress-panel__header">
                  <span className="ppt-progress-panel__step-label">{currentStep?.label}</span>
                  <span className="ppt-progress-panel__timer">{formatTime(timer)}</span>
                </div>
                <div className="ppt-progress-bar-track">
                  <div className="ppt-progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="ppt-progress-panel__steps">
                  {GENERATION_STEPS.map((s, i) => (
                    <span
                      key={i}
                      className={`ppt-step-dot${
                        i < stepIndex ? ' ppt-step-dot--done' :
                        i === stepIndex ? ' ppt-step-dot--active' : ''
                      }`}
                      title={s.label}
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              className={`glass-btn glass-btn--primary ppt-card__btn${loading ? ' glass-btn--loading' : ''}${done ? ' glass-btn--done' : ''}`}
              onClick={handleGenerate}
              disabled={loading || done}
            >
              {loading && <span className="ppt-spinner" />}
              {btnLabel}
            </button>
          </>
        ) : (
          <p className="ppt-card__empty">Add lectures to your roadmap to generate a presentation.</p>
        )}
      </div>
    </div>
  );
};

const InstructorHome = () => {
  const { course, setCourse, currentLecture, setCurrentLecture, loading } = useOutletContext();
  const navigate = useNavigate();

  if (loading) {
    return <HomePageSkeleton />;
  }

  if (!course) {
    return (
      <div className="teacher-home-empty">
        <div className="empty-content">
          <div className="empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h2>Welcome to your Digital Classroom!</h2>
          <p>It looks like you don't have any active courses yet. Let's get started by creating your very first course.</p>
          <button className="statcap-btn" onClick={() => navigate('/instructor/create-course')}>
            Create a Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="teacher-home-grid">
        <ActiveLecture
          course={course}
          setCourse={setCourse}
          currentLecture={currentLecture}
          setCurrentLecture={setCurrentLecture}
        />
        <aside className="sidebar">
          <PptCard course={course} currentLecture={currentLecture} />
          <RoadmapSidebar course={course} currentLecture={currentLecture} />
        </aside>
      </div>
    </>
  );
};

export default InstructorHome;
