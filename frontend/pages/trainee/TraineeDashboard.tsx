/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import CompetencyRadar from '../../components/trainee/CompetencyRadar';
import IgotRecommendations from '../../components/trainee/IgotRecommendations';
import AssessmentQuizModal from '../../components/trainee/AssessmentQuizModal';
import './TraineeDashboard.css';

export const TraineeDashboard: React.FC = () => {
  const [officerProfile, setOfficerProfile] = useState({
    name: 'Aditya Sharma, ISS',
    cadre: 'Indian Statistical Service (Group A)',
    designation: 'Junior Time Scale (Assistant Director)',
    department: 'National Accounts Division (NAD, MoSPI)',
    experience: '3 Years',
    learningHours: 24,
  });

  const [selectedGap, setSelectedGap] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [snaCompleted, setSnaCompleted] = useState(false);
  const [snaScore, setSnaScore] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;

        if (user && mounted) {
          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (dbUser) {
            setOfficerProfile({
              name: dbUser.full_name || 'Aditya Sharma, ISS',
              cadre: `${dbUser.cadre || 'ISS'} Cadre`,
              designation: dbUser.designation || 'Junior Time Scale (Assistant Director)',
              department: `${dbUser.department || 'National Accounts Division'} (MoSPI)`,
              experience: `${dbUser.work_experience_years || 3} Years`,
              learningHours: Number(dbUser.learning_hours || 24),
            });
          }
        }
      } catch (e) {
        console.warn('Could not load dynamic officer profile, using defaults:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Check if SNA was already completed
    const localComp = localStorage.getItem('statcap_trainee_competencies');
    if (localComp) {
      try {
        const parsed = JSON.parse(localComp);
        const sna = parsed.find((c: any) => c.code === 'STAT_SNA');
        if (sna && sna.score >= 75) {
          setSnaCompleted(true);
          setSnaScore(sna.score);
        }
      } catch (e) {}
    }

    loadProfile();

    const handleUpdate = (e: any) => {
      if (e.detail?.competency_code === 'STAT_SNA') {
        setSnaCompleted(true);
        setSnaScore(e.detail.score);
      }
    };
    window.addEventListener('statcap_competencies_updated', handleUpdate);

    return () => { 
      mounted = false; 
      window.removeEventListener('statcap_competencies_updated', handleUpdate);
    };
  }, []);

  const cardBase: React.CSSProperties = {
    background: 'var(--liquid-glass-bg, rgba(10, 10, 15, 0.35))',
    backdropFilter: 'var(--liquid-glass-blur, blur(20px) saturate(180%))',
    WebkitBackdropFilter: 'var(--liquid-glass-blur, blur(20px) saturate(180%))',
    border: '1px solid var(--liquid-glass-border, rgba(255, 255, 255, 0.1))',
    boxShadow: 'var(--liquid-glass-shadow, 0 10px 40px -10px rgba(0, 0, 0, 0.5))',
    borderRadius: '24px',
    color: '#ffffff',
  };

  return (
    <div style={{ width: '100%', padding: '0 0 60px', color: '#ffffff' }}>

      {/* ═══════════════════════════════════════════════════
          MERGED CARD 1: Officer Profile + FRAC Radar
          ═══════════════════════════════════════════════════ */}
      <div
        className="glass-card"
        style={{ ...cardBase, padding: '28px 32px', marginBottom: '28px' }}
      >
        {/* ── Section A: Officer header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>

          {/* Left: avatar + name block */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '1px',
              flexShrink: 0,
            }}>
              ISS
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  {officerProfile.name}
                </h1>
                <span style={{
                  padding: '4px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 800,
                  background: 'rgba(255, 255, 255, 0.12)', color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                }}>
                  {officerProfile.cadre}
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                {officerProfile.designation} • {officerProfile.department}
              </p>
            </div>
          </div>

          {/* Right: quick-stat pills */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
              padding: '10px 18px', borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)',
              minWidth: '88px',
            }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>{officerProfile.learningHours}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '2px' }}>Learning Hrs</span>
            </div>
            <div style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
              padding: '10px 18px', borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)',
              minWidth: '88px',
            }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>{officerProfile.experience}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '2px' }}>Public Service</span>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '8px 16px', borderRadius: '20px',
              background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Active Capacity Building</span>
            </div>
          </div>
        </div>

        {/* ── Hairline divider ── */}
        <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', marginBottom: '24px' }} />

        {/* ── Section B: FRAC Radar inline (no wrapping outer card) ── */}
        <CompetencyRadar onGapSelect={(gapCode) => setSelectedGap(gapCode)} embedded />
      </div>

      {/* 2. Personalized iGOT Karmayogi & NSSTA Recommendations */}
      <IgotRecommendations selectedGap={selectedGap} />

      {/* 3. Pending Diagnostic Assessment CTA */}
      <div
        className="glass-card"
        style={{
          ...cardBase,
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              {snaCompleted
                ? `Benchmark Achieved: System of National Accounts (SNA)`
                : `Pending Diagnostic Assessment: System of National Accounts (SNA)`}
            </h3>

            <span style={{
              padding: '3px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800,
              background: snaCompleted ? 'rgba(34, 197, 94, 0.18)' : 'rgba(239, 68, 68, 0.18)',
              color: snaCompleted ? '#4ade80' : '#ffffff',
              border: snaCompleted ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
            }}>
              {snaCompleted ? `✓ Benchmark Crossed (${snaScore || 82}%)` : 'Required for Gap Closure'}
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.75)' }}>
            {snaCompleted
              ? 'Your score has been verified and your Soulbound Credential has been anchored to the Polygon Amoy blockchain.'
              : 'AI-generated 10-question Bloom\'s-taxonomy quiz ingested from official MoSPI survey methodologies. Passing score (≥75%) mints a verified blockchain certificate.'}
          </p>
        </div>

        <button
          onClick={() => setIsQuizOpen(true)}
          style={{
            padding: '12px 24px', borderRadius: '12px',
            background: snaCompleted ? 'rgba(255, 255, 255, 0.12)' : '#ffffff',
            border: snaCompleted ? '1px solid rgba(255, 255, 255, 0.25)' : 'none',
            color: snaCompleted ? '#ffffff' : '#000000',
            fontSize: '0.86rem', fontWeight: 800, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span>{snaCompleted ? 'Retake Assessment' : 'Start Assessment'}</span>
        </button>
      </div>

      {/* Interactive MoSPI Diagnostic Quiz Modal */}
      <AssessmentQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        assessmentTitle="Diagnostic Assessment: System of National Accounts (SNA)"
        competencyCode="STAT_SNA"
        onAssessmentCompleted={(score) => {
          setSnaCompleted(true);
          setSnaScore(score);
        }}
      />
    </div>
  );
};

export default TraineeDashboard;
