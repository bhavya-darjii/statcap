/* eslint-disable */
// @ts-nocheck
// Wrapper service to connect to our secure Node.js backend.
// Every request now includes teacher context so the server can log AI usage accurately.

import { supabase } from './supabase';
import { getApiBaseUrl } from './apiConfig';

const rawBase = getApiBaseUrl();
const BASE_URL = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
const API_URL = BASE_URL.endsWith('/api') ? `${BASE_URL}/ai` : `${BASE_URL}/api/ai`;

// ─── Teacher context cache (fetched once per session) ─────────────────────────
let _cachedCtx = null;
let _pendingCourseId = '';
let _pendingSubjectName = '';

const getTeacherContext = async () => {
  if (_cachedCtx) {
    // Ensure pending updates apply if they happened while cached
    _cachedCtx.courseId = _pendingCourseId || _cachedCtx.courseId;
    _cachedCtx.subjectName = _pendingSubjectName || _cachedCtx.subjectName;
    return _cachedCtx;
  }

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return {};

  let teacherName = user.user_metadata?.full_name || '';

  try {
    if (!teacherName) {
      const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
      if (userData) {
        teacherName = userData.full_name || userData.name || userData.taught_by || '';
      }
    }
  } catch (_) { /* silent */ }

  _cachedCtx = {
    teacherId:    user.id,
    teacherEmail: user.email || '',
    teacherName,
    courseId:     _pendingCourseId,
    subjectName:  _pendingSubjectName,
  };
  return _cachedCtx;
};

// Allow other components to inject the active course/subject into context
export const setAiContextCourse = (courseId, subjectName) => {
  _pendingCourseId = courseId || '';
  _pendingSubjectName = subjectName || '';
  
  if (_cachedCtx) {
    _cachedCtx.courseId    = _pendingCourseId;
    _cachedCtx.subjectName = _pendingSubjectName;
  }
};

// Invalidate cache on sign-out
export const clearAiContext = () => { _cachedCtx = null; };

// ─── Token helper ────────────────────────────────────────────────────────────
export const getAuthToken = async () => {
  try {
    let { data: { session } } = await supabase.auth.getSession();

    // Refresh if token is expiring in under 60 seconds
    if (session?.expires_at && session.expires_at * 1000 - Date.now() < 60000) {
      try {
        const { data: refreshed } = await supabase.auth.refreshSession();
        if (refreshed?.session?.access_token) return refreshed.session.access_token;
      } catch { /* use current */ }
    }

    if (session?.access_token) return session.access_token;

    // Try refreshSession directly if session was null
    try {
      const { data: refreshed } = await supabase.auth.refreshSession();
      if (refreshed?.session?.access_token) return refreshed.session.access_token;
    } catch { /* silent */ }

    // Fallback: search localStorage for Supabase session token
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        try {
          const parsed = JSON.parse(localStorage.getItem(key) || '{}');
          if (parsed.access_token) return parsed.access_token;
        } catch { /* ignore */ }
      }
    }
  } catch (err) {
    console.warn('[aiService] getAuthToken error:', err);
  }

  // Development fallback token so AI calls never fail with "missing auth token" in dev
  const cachedRole = localStorage.getItem('cachedUserRole') || 'instructor';
  return `demo-token-${cachedRole}`;
};

// ─── Shared fetch helper ──────────────────────────────────────────────────────
const aiPost = async (endpoint, body, options = {}) => {
  const ctx = await getTeacherContext();
  const token = await getAuthToken();

  let res;
  try {
    res = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ...body, ...ctx }),
      signal: options.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.error(`Network error calling ${endpoint}:`, err);
    return { error: 'Unable to reach StatCap server. Is the backend running on port 5000?' };
  }

  let data;
  try {
    data = await res.json();
  } catch {
    return { error: res.ok ? 'Invalid server response' : `Server error (${res.status})` };
  }

  if (!res.ok) {
    return { error: data?.error || `Server error (${res.status})` };
  }

  return data;
};

// â”€â”€â”€ Public API functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const generateLectureRoadmap = async (syllabusText, totalLectures, acceptedModules) => {
  try {
    return await aiPost('generate-roadmap', { syllabusText, totalLectures, acceptedModules });
  } catch (error) {
    console.error("Roadmap Generation Error:", error);
    return { roadmap: [], usage: null };
  }
};

export const generateQuestionsFromTopics = async (completedTopics, examLength, btPreferences = [], numericalCount = 0, numericalPrompt = "", pastNumericals = [], options = {}) => {
  try {
    return await aiPost('generate-questions-topics', { completedTopics, examLength, btPreferences, numericalCount, numericalPrompt, pastNumericals }, options);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.error("Topic Exam Gen Error:", error);
    return { error: error.message || "Failed to generate questions" };
  }
};

export const generateQuestionsFromSyllabus = async (syllabus, examLength) => {
  try {
    return await aiPost('generate-questions-syllabus', { syllabus, examLength });
  } catch (error) {
    console.error("Generation Error:", error);
    return [];
  }
};

export const gradeFullExam = async (syllabus, examData) => {
  try {
    return await aiPost('grade-exam', { syllabus, examData });
  } catch (error) {
    console.error("Grading error:", error);
    return { score: 0, feedback: "Error reading API response." };
  }
};

export const generateLessonPlan = async (subjectName, modules, options = {}) => {
  try {
    return await aiPost('generate-lesson-plan', { subjectName, modules }, options);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.error("Lesson Plan Generation Error:", error);
    return null;
  }
};

export const generateLectureOverview = async (payload) => {
  try {
    return await aiPost('generate-lecture-overview', payload);
  } catch (error) {
    console.error("Lecture Overview Error", error);
    return { error: 'Failed to generate lecture overview.' };
  }
};

export const generateLecturePresentation = async (payload) => {
  try {
    return await aiPost('generate-lecture-presentation', payload);
  } catch (error) {
    console.error("Lecture Presentation Error", error);
    return { error: 'Failed to generate lecture presentation.' };
  }
};

export const generateSpecificField = async (type, subjectName, modules) => {
  try {
    return await aiPost('generate-specific-field', { type, subjectName, modules });
  } catch (error) {
    console.error("Single Gen Error", error);
    return null;
  }
};

export const generateSupplementaryLessonPlan = async (subjectName, modules) => {
  try {
    return await aiPost('generate-supplementary-plan', { subjectName, modules });
  } catch (error) {
    console.error("Suppl Gen Error", error);
    return null;
  }
};

export const generateDayWiseEnrichment = async (subjectName, roadmapTitles, textBooks = [], refBooks = []) => {
  try {
    return await aiPost('generate-day-wise-enrichment', { subjectName, roadmapTitles, textBooks, refBooks });
  } catch (error) {
    console.error("DayWise Enrichment Error", error);
    return null;
  }
};

export const generateCoPoMapping = async (courseOutcomes, programOutcomes) => {
  try {
    return await aiPost('generate-copo-mapping', { courseOutcomes, programOutcomes });
  } catch (error) {
    console.error("CoPoMapping Error", error);
    return null;
  }
};

export const evaluateAnswerScript = async (payload) => {
  try {
    return await aiPost('evaluate-answer-script', payload);
  } catch (error) {
    console.error("Answer Evaluator Error", error);
    return { error: 'Failed to evaluate answer script.' };
  }
};

export const generateRubric = async (payload) => {
  try {
    return await aiPost('generate-rubric', payload);
  } catch (error) {
    console.error("Rubric Generation Error", error);
    return { error: 'Failed to generate rubric.' };
  }
};

export const calculateCoAttainment = async (payload) => {
  try {
    if (!BASE_URL) return { error: 'API service unavailable in this environment.' };
    const URL = BASE_URL.endsWith('/api') ? `${BASE_URL}/analytics/co-attainment` : `${BASE_URL}/api/analytics/co-attainment`;
    const ctx = await getTeacherContext();
    const token = await getAuthToken();
    const res = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ...payload, ...ctx }),
    });
    return res.json();
  } catch (error) {
    console.error("CO Attainment Error", error);
    return { error: 'Failed to calculate CO attainment.' };
  }
};

export const predictStudentRisk = async (payload) => {
  try {
    if (!BASE_URL) return { error: 'API service unavailable in this environment.' };
    const URL = BASE_URL.endsWith('/api') ? `${BASE_URL}/analytics/student-risk` : `${BASE_URL}/api/analytics/student-risk`;
    const ctx = await getTeacherContext();
    const token = await getAuthToken();
    const res = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ...payload, ...ctx }),
    });
    return res.json();
  } catch (error) {
    console.error("Student Risk Error", error);
    return { error: 'Failed to predict student risk.' };
  }
};

export const generateStudyMaterial = async (payload) => {
  try {
    return await aiPost('generate-study-material', payload);
  } catch (error) {
    console.error("Study Material Error", error);
    return { error: 'Failed to generate study material.' };
  }
};

export const generateLabManual = async (payload) => {
  try {
    return await aiPost('generate-lab-manual', payload);
  } catch (error) {
    console.error("Lab Manual Error", error);
    return { error: 'Failed to generate lab manual.' };
  }
};

export const generateNotice = async (payload) => {
  try {
    if (!BASE_URL) return { error: 'API service unavailable in this environment.' };
    const URL = BASE_URL.endsWith('/api') ? `${BASE_URL}/notice/generate` : `${BASE_URL}/api/notice/generate`;
    const ctx = await getTeacherContext();
    const token = await getAuthToken();
    const res = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ...payload, ...ctx }),
    });
    return res.json();
  } catch (error) {
    console.error("Notice Generation Error", error);
    return { error: 'Failed to generate notice.' };
  }
};

export const generateTimetable = async (payload) => {
  try {
    if (!BASE_URL) return { error: 'API service unavailable in this environment.' };
    const URL = BASE_URL.endsWith('/api') ? `${BASE_URL}/timetable/generate` : `${BASE_URL}/api/timetable/generate`;
    const token = await getAuthToken();
    const res = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  } catch (error) {
    console.error("Timetable Generation Error", error);
    return { error: 'Failed to generate timetable.' };
  }
};
export const classifyCopilotIntent = async (prompt, context, options = {}) => {
  try {
    return await aiPost("intent", { prompt, context }, options);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.error("Copilot Intent Error:", error);
    return { error: "Failed to classify intent" };
  }
};


export const sendCopilotMessage = async (messages, userRole, pagePath, pageLabel, pageContext, options = {}) => {
  try {
    return await aiPost('copilot-chat', {
      messages,
      userRole,
      pagePath,
      pageLabel,
      pageContext: pageContext || {},
    }, options);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.error("Copilot Chat Error:", error);
    return { error: "Failed to reach StatCap AI." };
  }
};

export const parseSyllabusFromText = async (rawText: string) => {
  try {
    return await aiPost('parse-syllabus', { rawText });
  } catch (error) {
    console.error("Syllabus Parse Error:", error);
    return { error: error.message || "Failed to parse syllabus." };
  }
};

export const generateMospiAssessment = async (payload: {
  documentText: string;
  competencyCode: string;
  cadre: string;
  numQuestions: number;
  btDistribution?: string[];
  difficulty?: string;
  assessmentType?: string;
}) => {
  try {
    return await aiPost('generate-mospi-assessment', payload);
  } catch (error: any) {
    console.error("MoSPI Assessment Generation Error:", error);
    return { error: error.message || "Failed to generate assessment." };
  }
};

export const extractUploadedQuestions = async (payload: {
  documentText: string;
  competencyCode?: string;
  cadre?: string;
}) => {
  try {
    return await aiPost('extract-uploaded-questions', payload);
  } catch (error: any) {
    console.error("Extract Questions Error:", error);
    return { error: error.message || "Failed to extract questions." };
  }
};


