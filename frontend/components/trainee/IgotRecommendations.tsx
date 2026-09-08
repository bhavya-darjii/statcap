/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

export interface IgotCourse {
  id: string;
  course_id: string;
  title: string;
  provider: string;
  competency_code: string;
  duration_hours: number;
  delivery_mode: string;
  level: string;
  course_url: string;
}

const DEFAULT_COURSES: IgotCourse[] = [
  {
    id: '1',
    course_id: 'iGOT-STAT-204',
    title: 'System of National Accounts: GVA & GDP Estimation',
    provider: 'iGOT Karmayogi',
    competency_code: 'STAT_SNA',
    duration_hours: 20,
    delivery_mode: 'Online (Self-Paced)',
    level: 'Advanced',
    course_url: 'https://igotkarmayogi.gov.in/course/sna-gdp-204',
  },
  {
    id: '2',
    course_id: 'NSSTA-TPAC-2026-01',
    title: 'NSSTA 2-Week Intensive Workshop on National Accounts Aggregates',
    provider: 'NSSTA TPAC Workshop',
    competency_code: 'STAT_SNA',
    duration_hours: 40,
    delivery_mode: 'Physical (Greater Noida Academy)',
    level: 'Advanced',
    course_url: 'https://nssta.gov.in/workshops/2026-sna',
  },
  {
    id: '3',
    course_id: 'iGOT-TECH-105',
    title: 'Python for Data Wrangling in Government Statistics',
    provider: 'iGOT Karmayogi',
    competency_code: 'TECH_PYTHON',
    duration_hours: 18,
    delivery_mode: 'Online (Self-Paced)',
    level: 'Foundational',
    course_url: 'https://igotkarmayogi.gov.in/course/python-stat-105',
  },
  {
    id: '4',
    course_id: 'iGOT-GOV-401',
    title: 'Digital Personal Data Protection (DPDP) Compliance for Public Officers',
    provider: 'iGOT Karmayogi',
    competency_code: 'GOV_DPDP',
    duration_hours: 8,
    delivery_mode: 'Online (Self-Paced)',
    level: 'Advanced',
    course_url: 'https://igotkarmayogi.gov.in/course/dpdp-compliance-401',
  },
  {
    id: '5',
    course_id: 'NSSTA-TPAC-2026-04',
    title: 'Field Supervisors Training on PLFS & CAPI Technology',
    provider: 'NSSTA TPAC Workshop',
    competency_code: 'STAT_PLFS',
    duration_hours: 30,
    delivery_mode: 'Hybrid (Virtual + Field Practicum)',
    level: 'Intermediate',
    course_url: 'https://nssta.gov.in/workshops/2026-plfs',
  },
];

export const IgotRecommendations: React.FC<{ selectedGap?: string | null }> = ({ selectedGap }) => {
  const [courses, setCourses] = useState<IgotCourse[]>(DEFAULT_COURSES);
  const [filter, setFilter] = useState<string>('all');
  const [enrolledMap, setEnrolledMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;

    const loadCourses = async () => {
      try {
        const { data, error } = await supabase.from('igot_courses').select('*');
        if (data && data.length > 0 && mounted) {
          setCourses(data as IgotCourse[]);
        }
      } catch (e) {
        console.warn('Using seeded default iGOT courses:', e);
      }
    };

    loadCourses();
    return () => { mounted = false; };
  }, []);

  const handleEnroll = (courseId: string) => {
    setEnrolledMap((prev) => ({ ...prev, [courseId]: true }));
  };

  const displayedCourses = courses.filter((c) => {
    if (selectedGap) return c.competency_code === selectedGap;
    if (filter === 'igot') return c.provider.includes('iGOT');
    if (filter === 'nssta') return c.provider.includes('NSSTA');
    return true;
  });

  return (
    <div
      className="glass-card"
      style={{
        background: 'var(--liquid-glass-bg, rgba(10, 10, 15, 0.35))',
        backdropFilter: 'var(--liquid-glass-blur, blur(20px) saturate(180%))',
        WebkitBackdropFilter: 'var(--liquid-glass-blur, blur(20px) saturate(180%))',
        border: '1px solid var(--liquid-glass-border, rgba(255, 255, 255, 0.1))',
        boxShadow: 'var(--liquid-glass-shadow, 0 10px 40px -10px rgba(0, 0, 0, 0.5))',
        borderRadius: '24px',
        padding: '28px',
        color: '#ffffff',
        marginBottom: '28px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px', color: '#ffffff' }}>
              Personalized iGOT Karmayogi & NSSTA Training Recommendations
            </h2>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.75)' }}>
            AI-curated learning pathways matching your detected competency gaps and career progression
          </p>
        </div>

        {/* Source Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: filter === 'all' ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.15)',
              background: filter === 'all' ? '#ffffff' : 'rgba(255, 255, 255, 0.06)',
              color: filter === 'all' ? '#000000' : '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            All Recommendations ({courses.length})
          </button>
          <button
            onClick={() => setFilter('igot')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: filter === 'igot' ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.15)',
              background: filter === 'igot' ? '#ffffff' : 'rgba(255, 255, 255, 0.06)',
              color: filter === 'igot' ? '#000000' : '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            iGOT Karmayogi
          </button>
          <button
            onClick={() => setFilter('nssta')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: filter === 'nssta' ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.15)',
              background: filter === 'nssta' ? '#ffffff' : 'rgba(255, 255, 255, 0.06)',
              color: filter === 'nssta' ? '#000000' : '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            NSSTA TPAC Workshops
          </button>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {displayedCourses.map((course) => {
          const isEnrolled = enrolledMap[course.course_id];
          const isNSSTA = course.provider.includes('NSSTA');

          return (
            <div
              key={course.course_id}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                color: '#ffffff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div>
                {/* Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}>
                    {course.provider}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 600 }}>
                    {course.level}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.02rem', fontWeight: 700, margin: '0 0 10px 0', color: '#ffffff', lineHeight: 1.4 }}>
                  {course.title}
                </h3>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.75)', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{course.duration_hours} Learning Hours</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{course.delivery_mode}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 600 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                    <span>Target Gap: {course.competency_code}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={() => handleEnroll(course.course_id)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isEnrolled ? 'rgba(34, 197, 94, 0.2)' : '#ffffff',
                    color: isEnrolled ? '#ffffff' : '#000000',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    border: isEnrolled ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid transparent',
                  }}
                >
                  {isEnrolled && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  <span>
                    {isEnrolled
                      ? 'Enrolled (In Progress)'
                      : isNSSTA
                      ? 'Register for NSSTA Workshop'
                      : 'Enrol on iGOT Karmayogi'}
                  </span>
                </button>

                <a
                  href={course.course_url}
                  target="_blank"
                  rel="noreferrer"
                  title="Open Course Details"
                  style={{
                    padding: '11px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IgotRecommendations;
