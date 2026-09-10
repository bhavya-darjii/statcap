/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import AssessmentQuizModal from '../../components/trainee/AssessmentQuizModal';

export const TraineeAssessmentsPage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedAssessment, setSelectedAssessment] = useState<{
    title: string;
    code: string;
  } | null>(null);

  const [instructorAssessments, setInstructorAssessments] = useState<any[]>([]);
  const [snaCompleted, setSnaCompleted] = useState(false);
  const [snaScore, setSnaScore] = useState<number | null>(null);

  useEffect(() => {
    // Check if SNA was already completed in this session
    const cached = localStorage.getItem('statcap_trainee_competencies');
    if (cached) {
      try {
        const list = JSON.parse(cached);
        const sna = list.find((c: any) => c.code === 'STAT_SNA');
        if (sna && sna.score >= 75) {
          setSnaCompleted(true);
          setSnaScore(sna.score);
        }
      } catch (e) { }
    }

    // Load any instructor published assessments from localStorage or Supabase
    const loadInstructorAssessments = async () => {
      try {
        const local = JSON.parse(localStorage.getItem('statcap_published_assessments') || '[]');
        if (local && local.length > 0) {
          setInstructorAssessments(local);
        }

        const { data: dbData } = await supabase
          .from('assessments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (dbData && dbData.length > 0) {
          const titles = new Set(local.map((a: any) => a.title));
          const additions = dbData.filter((d: any) => !titles.has(d.title));
          setInstructorAssessments([...local, ...additions]);
        }
      } catch (e) {
        console.warn('Could not load instructor assessments:', e);
      }
    };

    loadInstructorAssessments();

    // Listen to competency updates
    const handleUpdate = (e: any) => {
      if (e.detail?.competency_code === 'STAT_SNA') {
        setSnaCompleted(true);
        setSnaScore(e.detail.score);
      }
    };
    window.addEventListener('statcap_competencies_updated', handleUpdate);
    return () => window.removeEventListener('statcap_competencies_updated', handleUpdate);
  }, []);

  const cardBase: React.CSSProperties = {
    background: 'var(--liquid-glass-bg, rgba(10, 10, 15, 0.35))',
    backdropFilter: 'var(--liquid-glass-blur, blur(20px) saturate(180%))',
    WebkitBackdropFilter: 'var(--liquid-glass-blur, blur(20px) saturate(180%))',
    border: '1px solid var(--liquid-glass-border, rgba(255, 255, 255, 0.12))',
    boxShadow: 'var(--liquid-glass-shadow, 0 10px 40px -10px rgba(0, 0, 0, 0.5))',
    borderRadius: '20px',
    color: '#ffffff',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    width: '100%',
    transition: 'all 0.2s ease',
  };

  const primaryBtnStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 16px',
    borderRadius: '12px',
    background: '#ffffff',
    border: 'none',
    color: '#000000',
    fontSize: '0.86rem',
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'transform 0.15s ease, opacity 0.15s ease',
  };

  const secondaryBtnStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 16px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    fontSize: '0.86rem',
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'transform 0.15s ease, background 0.15s ease',
  };

  return (
    <div style={{ width: '100%', padding: '0 0 60px', color: '#ffffff', boxSizing: 'border-box' }}>

      {/* ── Page Header (Clean, pure white, no extra pills) ── */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '-0.5px', color: '#ffffff' }}>
          Diagnostic Assessments & Evaluations
        </h1>
        <p style={{ margin: 0, fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.75)', maxWidth: '820px', lineHeight: 1.5 }}>
          Calibrated assessments aligned with National Statistical Systems Training Academy (NSSTA) standards.
          Achieving required benchmarks recalibrates your FRAC Competency Radar and issues verifiable credentials on the blockchain.
        </p>
      </div>

      {/* ── Small Side-by-Side Cards Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
        width: '100%',
        boxSizing: 'border-box'
      }}>

        {/* ── CARD 1: SNA Diagnostic Evaluation (Hero SIH Demo Item) ── */}
        <div style={cardBase}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <span style={{
                padding: '4px 9px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.22)',
              }}>
                {snaCompleted ? `Benchmark Achieved (${snaScore || 82}%)` : 'Action Required (42% vs 75%)'}
              </span>

              <span style={{
                padding: '4px 9px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}>
                STAT_SNA
              </span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff', lineHeight: 1.35 }}>
              System of National Accounts (SNA): GVA & GDP Estimation
            </h3>

            <p style={{ margin: '0 0 14px 0', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.72)', lineHeight: 1.5 }}>
              Diagnostic evaluation covering basic vs factor cost GVA, double deflation, FISIM, and Non-Observed Economy imputations.
            </p>

            <div style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '18px' }}>
              10 Questions • 15 Mins • Benchmark: 75%
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
            {snaCompleted ? (
              <>
                <button
                  onClick={() => navigate('/trainee/credentials')}
                  style={{ ...primaryBtnStyle, flex: 1 }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  View Credential
                </button>
                <button
                  onClick={() => setSelectedAssessment({
                    title: "System of National Accounts (SNA): GVA & GDP Estimation Diagnostic",
                    code: "STAT_SNA"
                  })}
                  style={{ ...secondaryBtnStyle, width: 'auto', padding: '12px 14px' }}
                  title="Retake evaluation"
                >
                  Retake
                </button>
              </>
            ) : (
              <button
                onClick={() => setSelectedAssessment({
                  title: "System of National Accounts (SNA): GVA & GDP Estimation Diagnostic",
                  code: "STAT_SNA"
                })}
                style={primaryBtnStyle}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                Start Assessment
              </button>
            )}
          </div>
        </div>

        {/* ── CARD 2: Survey Sampling (Completed Benchmark) ── */}
        <div style={cardBase}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <span style={{
                padding: '4px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800,
                background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                Proficient (85% Achieved)
              </span>
              <span style={{
                padding: '4px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                background: 'rgba(255, 255, 255, 0.06)', color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}>
                STAT_SAMPLING
              </span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff', lineHeight: 1.35 }}>
              NSSO Multi-Stage Stratified Sampling & Estimation
            </h3>

            <p style={{ margin: '0 0 14px 0', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.72)', lineHeight: 1.5 }}>
              Sample frame design, primary sampling unit allocation, and non-sampling error reduction methodologies.
            </p>

            <div style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '18px' }}>
              15 Questions • Completed • Benchmark: 80%
            </div>
          </div>

          <button
            onClick={() => navigate('/trainee/credentials')}
            style={secondaryBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
          >
            View Credential
          </button>
        </div>

        {/* ── CARD 3: Price Statistics (Completed Benchmark) ── */}
        <div style={cardBase}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <span style={{
                padding: '4px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800,
                background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                Proficient (78% Achieved)
              </span>
              <span style={{
                padding: '4px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                background: 'rgba(255, 255, 255, 0.06)', color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}>
                STAT_CPI_IIP
              </span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff', lineHeight: 1.35 }}>
              Consumer Price Index & Index of Industrial Production
            </h3>

            <p style={{ margin: '0 0 14px 0', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.72)', lineHeight: 1.5 }}>
              Compilation methodology, item basket weighting, and geometric mean aggregation standards across sectors.
            </p>

            <div style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '18px' }}>
              12 Questions • Completed • Benchmark: 80%
            </div>
          </div>

          <button
            onClick={() => setSelectedAssessment({
              title: "Consumer Price Index & Index of Industrial Production Evaluation",
              code: "STAT_CPI_IIP"
            })}
            style={secondaryBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
          >
            Retake Assessment
          </button>
        </div>

        {/* ── CARD 4: Labour Statistics (Developing) ── */}
        <div style={cardBase}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <span style={{
                padding: '4px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800,
                background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.18)',
              }}>
                Developing (65% vs 75%)
              </span>
              <span style={{
                padding: '4px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                background: 'rgba(255, 255, 255, 0.06)', color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}>
                STAT_PLFS
              </span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff', lineHeight: 1.35 }}>
              Periodic Labour Force Survey (PLFS) & CAPI Field Data
            </h3>

            <p style={{ margin: '0 0 14px 0', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.72)', lineHeight: 1.5 }}>
              Activity status concepts (Usual vs Current Weekly), labor force participation, and CAPI field validation.
            </p>

            <div style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '18px' }}>
              10 Questions • 15 Mins • Benchmark: 75%
            </div>
          </div>

          <button
            onClick={() => setSelectedAssessment({
              title: "Periodic Labour Force Survey (PLFS) Evaluation",
              code: "STAT_PLFS"
            })}
            style={primaryBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            Start Assessment
          </button>
        </div>

        {/* ── Dynamically Render Any Instructor Published Assessments ── */}
        {instructorAssessments.map((a, idx) => (
          <div key={idx} style={cardBase}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <span style={{
                  padding: '4px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800,
                  background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}>
                  Instructor Published
                </span>
                <span style={{
                  padding: '4px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.06)', color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}>
                  {a.competency_code || 'STAT_SNA'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff', lineHeight: 1.35 }}>
                {a.title}
              </h3>

              <p style={{ margin: '0 0 14px 0', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.72)', lineHeight: 1.5 }}>
                Published by {a.created_by || 'NSSTA Course Director'}. Calibrated MoSPI cadre evaluation.
              </p>

              <div style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '18px' }}>
                {a.question_count || (a.questions ? a.questions.length : 10)} Questions • MoSPI Standard
              </div>
            </div>

            <button
              onClick={() => setSelectedAssessment({
                title: a.title,
                code: a.competency_code || 'STAT_SNA'
              })}
              style={primaryBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              Start Assessment
            </button>
          </div>
        ))}

      </div>

      {/* ── Quiz Modal Runner ── */}
      {selectedAssessment && (
        <AssessmentQuizModal
          isOpen={!!selectedAssessment}
          onClose={() => setSelectedAssessment(null)}
          assessmentTitle={selectedAssessment.title}
          competencyCode={selectedAssessment.code}
          onAssessmentCompleted={(score) => {
            setSnaCompleted(true);
            setSnaScore(score);
          }}
        />
      )}

    </div>
  );
};

export default TraineeAssessmentsPage;
