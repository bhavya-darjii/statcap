/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import AssessmentQuizModal from '../../components/trainee/AssessmentQuizModal';

export const TraineeAssessmentsPage: React.FC = () => {
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
      } catch (e) {}
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
          // Merge unique by title
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
    border: '1px solid var(--liquid-glass-border, rgba(255, 255, 255, 0.1))',
    boxShadow: 'var(--liquid-glass-shadow, 0 10px 40px -10px rgba(0, 0, 0, 0.5))',
    borderRadius: '24px',
    color: '#ffffff',
    padding: '24px 28px',
    marginBottom: '20px',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{ width: '100%', padding: '0 0 60px', color: '#ffffff' }}>
      
      {/* ── Page Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            padding: '3px 10px',
            borderRadius: '8px',
            background: 'rgba(59, 130, 246, 0.2)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.35)'
          }}>
            MoSPI Capacity Building & Competency Cell
          </span>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>•</span>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            ISS Cadre Evaluations
          </span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
          Diagnostic Assessments & Evaluations
        </h1>
        <p style={{ margin: 0, fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.75)', maxWidth: '800px', lineHeight: 1.5 }}>
          Calibrated Bloom&apos;s-taxonomy assessments aligned with the National Statistical Systems Training Academy (NSSTA). 
          Achieving required benchmark scores updates your FRAC Competency Radar and mints verified credentials onto the Polygon blockchain.
        </p>
      </div>

      {/* ── Metric Highlights ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ ...cardBase, padding: '16px 20px', marginBottom: 0 }}>
          <span style={{ fontSize: '0.74rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
            Action Required
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: snaCompleted ? '#4ade80' : '#f87171' }}>
              {snaCompleted ? '0 Gaps' : '1 Gap'}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              {snaCompleted ? 'All benchmarks met' : 'STAT_SNA pending'}
            </span>
          </div>
        </div>

        <div style={{ ...cardBase, padding: '16px 20px', marginBottom: 0 }}>
          <span style={{ fontSize: '0.74rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
            Passing Benchmark
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#60a5fa' }}>
              75%
            </span>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              MoSPI FRAC Standard
            </span>
          </div>
        </div>

        <div style={{ ...cardBase, padding: '16px 20px', marginBottom: 0 }}>
          <span style={{ fontSize: '0.74rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
            Blockchain Anchoring
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34d399' }}>
              Polygon Amoy
            </span>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              PoS Consensus
            </span>
          </div>
        </div>
      </div>

      {/* ── Section Header ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.3px' }}>
        Priority Diagnostic Assessments
      </h2>

      {/* ── CARD 1: SNA Diagnostic Evaluation (Hero SIH Demo Item) ── */}
      <div style={{
        ...cardBase,
        border: snaCompleted
          ? '1px solid rgba(16, 185, 129, 0.4)'
          : '1px solid rgba(239, 68, 68, 0.35)',
        background: snaCompleted
          ? 'rgba(16, 185, 129, 0.05)'
          : 'rgba(239, 68, 68, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span style={{
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 800,
                background: snaCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: snaCompleted ? '#6ee7b7' : '#fca5a5',
                border: snaCompleted ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
              }}>
                {snaCompleted ? `✓ Benchmark Achieved (${snaScore || 82}%)` : 'Action Required • Gap Detected (42% vs 75%)'}
              </span>

              <span style={{
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 700,
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}>
                STAT_SNA • National Accounts
              </span>

              <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                10 Questions • 15 Mins • 100 Marks
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px 0', color: '#ffffff' }}>
              System of National Accounts (SNA): GVA & GDP Estimation Diagnostic
            </h3>

            <p style={{ margin: 0, fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.5, maxWidth: '750px' }}>
              Official diagnostic examination assessing proficiency across SNA 2008 production boundaries, basic vs. factor cost GVA, 
              double deflation methodologies, FISIM allocation, and Non-Observed Economy (NOE) imputations. 
              Scoring &ge;75% recalibrates your radar and issues a verifiable blockchain credential.
            </p>
          </div>

          <button
            onClick={() => setSelectedAssessment({
              title: "System of National Accounts (SNA): GVA & GDP Estimation Diagnostic",
              code: "STAT_SNA"
            })}
            style={{
              padding: '13px 26px',
              borderRadius: '12px',
              background: snaCompleted ? 'rgba(255, 255, 255, 0.1)' : '#ffffff',
              border: snaCompleted ? '1px solid rgba(255, 255, 255, 0.25)' : 'none',
              color: snaCompleted ? '#ffffff' : '#000000',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>{snaCompleted ? 'Retake Evaluation' : 'Start Assessment →'}</span>
          </button>
        </div>
      </div>

      {/* ── CARD 2: Survey Sampling (Completed Benchmark) ── */}
      <div style={{ ...cardBase, opacity: 0.9 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <span style={{
                padding: '3px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800,
                background: 'rgba(34, 197, 94, 0.18)', color: '#4ade80',
                border: '1px solid rgba(34, 197, 94, 0.35)',
              }}>
                ✓ Proficient (85% Achieved)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                STAT_SAMPLING • Benchmark: 80%
              </span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px 0' }}>
              NSSO Multi-Stage Stratified Sampling & Estimation Procedures
            </h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Completed during Phase-I Induction Training at NSSTA Greater Noida. Verified on-chain credential active.
            </p>
          </div>

          <span style={{
            padding: '8px 16px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            Credential Issued ✓
          </span>
        </div>
      </div>

      {/* ── CARD 3: Price Statistics (Completed Benchmark) ── */}
      <div style={{ ...cardBase, opacity: 0.9 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <span style={{
                padding: '3px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800,
                background: 'rgba(34, 197, 94, 0.18)', color: '#4ade80',
                border: '1px solid rgba(34, 197, 94, 0.35)',
              }}>
                ✓ Proficient (78% Achieved)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                STAT_CPI_IIP • Benchmark: 80%
              </span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px 0' }}>
              Consumer Price Index (CPI-Rural/Urban) & Index of Industrial Production (IIP)
            </h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Compilation methodology, item basket weighting, and geometric mean aggregation standards.
            </p>
          </div>

          <span style={{
            padding: '8px 16px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            Passed
          </span>
        </div>
      </div>

      {/* ── Instructor Published Assessments (Live Dynamic Section) ── */}
      {instructorAssessments.length > 0 && (
        <div style={{ marginTop: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
              Live Published Assessments by NSSTA Course Directors
            </h2>
            <span style={{
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 800,
              background: 'rgba(168, 85, 247, 0.2)',
              color: '#d8b4fe',
              border: '1px solid rgba(168, 85, 247, 0.35)',
            }}>
              AI Generated & Calibrated
            </span>
          </div>

          {instructorAssessments.map((a, idx) => (
            <div key={idx} style={cardBase}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800,
                      background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa'
                    }}>
                      {a.competency_code || 'STAT_SNA'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      Published by {a.created_by || 'NSSTA Course Director'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px 0' }}>
                    {a.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                    {a.question_count || (a.questions ? a.questions.length : 10)} Questions • MoSPI Standard Assessment
                  </p>
                </div>

                <button
                  onClick={() => setSelectedAssessment({
                    title: a.title,
                    code: a.competency_code || 'STAT_SNA'
                  })}
                  style={{
                    padding: '11px 22px',
                    borderRadius: '12px',
                    background: '#ffffff',
                    border: 'none',
                    color: '#000000',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Take Assessment →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
