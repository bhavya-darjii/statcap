/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';
import { supabase } from '../../services/supabase';

export interface CompetencyScore {
  code: string;
  name: string;
  category: string;
  score: number;
  benchmark: number;
  status: 'Proficient' | 'Developing' | 'Gap Detected';
}

const DEFAULT_COMPETENCIES: CompetencyScore[] = [
  { code: 'STAT_SAMPLING', name: 'Survey Sampling', category: 'Statistical', score: 85, benchmark: 80, status: 'Proficient' },
  { code: 'STAT_SNA', name: 'National Accounts (SNA)', category: 'Statistical', score: 42, benchmark: 75, status: 'Gap Detected' },
  { code: 'STAT_CPI_IIP', name: 'Price Statistics (CPI)', category: 'Statistical', score: 78, benchmark: 80, status: 'Proficient' },
  { code: 'STAT_PLFS', name: 'Labour Statistics (PLFS)', category: 'Statistical', score: 65, benchmark: 75, status: 'Developing' },
  { code: 'TECH_PYTHON', name: 'Python Wrangling', category: 'Technical', score: 48, benchmark: 75, status: 'Gap Detected' },
  { code: 'TECH_CAPI_GIS', name: 'CAPI & GIS Mapping', category: 'Technical', score: 82, benchmark: 80, status: 'Proficient' },
  { code: 'GOV_DPDP', name: 'DPDP Act & Privacy', category: 'Digital Governance', score: 58, benchmark: 90, status: 'Developing' },
  { code: 'BEH_ETHICS', name: 'Statistical Ethics', category: 'Behavioural', score: 92, benchmark: 90, status: 'Proficient' },
];

export const CompetencyRadar: React.FC<{ onGapSelect?: (gapCode: string) => void; embedded?: boolean }> = ({ onGapSelect, embedded = false }) => {
  const [competencies, setCompetencies] = useState<CompetencyScore[]>(DEFAULT_COMPETENCIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCompetencies = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        if (!userId) {
          if (mounted) setLoading(false);
          return;
        }

        const { data: scores } = await supabase
          .from('trainee_competencies')
          .select('competency_code, score, status, competencies(name, category, benchmark_score)')
          .eq('trainee_id', userId);

        if (scores && scores.length > 0 && mounted) {
          const mapped = scores.map((s: any) => ({
            code: s.competency_code,
            name: s.competencies?.name || s.competency_code,
            category: s.competencies?.category || 'Statistical',
            score: Number(s.score),
            benchmark: Number(s.competencies?.benchmark_score || 75),
            status: s.status,
          }));
          setCompetencies(mapped);
        }
      } catch (e) {
        console.warn('Could not load live competencies, using seeded defaults:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCompetencies();
    return () => { mounted = false; };
  }, []);

  const chartData = competencies.map((c) => ({
    subject: c.name.length > 18 ? c.name.substring(0, 16) + '…' : c.name,
    fullName: c.name,
    score: c.score,
    benchmark: c.benchmark,
    category: c.category,
    status: c.status,
  }));

  const proficientCount = competencies.filter((c) => c.status === 'Proficient').length;
  const developingCount = competencies.filter((c) => c.status === 'Developing').length;
  const gapCount = competencies.filter((c) => c.status === 'Gap Detected').length;

  const inner = (
    <div style={{ color: '#ffffff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px', color: '#ffffff' }}>
              FRAC Competency Diagnostic Matrix
            </h2>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.75)' }}>
            Official Statistical Cadre Standards vs. Current Assessment Scores
          </p>
        </div>

        {/* Summary Status Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '20px',
            background: 'rgba(34, 197, 94, 0.14)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 700,
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80' }} />
            <span>{proficientCount} Proficient</span>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '20px',
            background: 'rgba(245, 158, 11, 0.14)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 700,
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fbbf24' }} />
            <span>{developingCount} Developing</span>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '20px',
            background: 'rgba(239, 68, 68, 0.16)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 800,
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f87171' }} />
            <span>{gapCount} Critical Gaps</span>
          </div>
        </div>
      </div>

      {/* Grid: Radar Chart on Left, Detailed Breakdown on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(280px, 1fr)', gap: '24px', alignItems: 'center' }}>
        {/* Radar Chart */}
        <div style={{ width: '100%', height: '340px', minWidth: 0, minHeight: 340 }}>
          <ResponsiveContainer width="100%" height={340} minWidth={0} minHeight={340}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="rgba(255, 255, 255, 0.12)" />
              <PolarAngleAxis
                dataKey="subject"
                stroke="rgba(255, 255, 255, 0.4)"
                tick={{ fill: '#ffffff', fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                stroke="rgba(255, 255, 255, 0.15)"
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }}
              />
              <Radar
                name="Officer Score (%)"
                dataKey="score"
                stroke="#22d3ee"
                fill="#0a8fa8"
                fillOpacity={0.3}
              />
              <Radar
                name="Cadre Benchmark (%)"
                dataKey="benchmark"
                stroke="#f59e0b"
                fill="none"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 20, 35, 0.95)',
                  backdropFilter: 'blur(16px)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                }}
                itemStyle={{ color: '#ffffff' }}
                labelStyle={{ color: '#ffffff', fontWeight: 700 }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '10px', fontSize: '12px', color: '#ffffff' }}
                formatter={(value) => <span style={{ color: '#ffffff', fontWeight: 600 }}>{value}</span>}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Identified Gaps & Breakdown Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            fontSize: '0.82rem',
            fontWeight: 800,
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Identified Competency Status
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
            {competencies.map((c) => {
              const isGap = c.status === 'Gap Detected';
              const isProficient = c.status === 'Proficient';
              const diff = c.score - c.benchmark;

              return (
                <div
                  key={c.code}
                  onClick={() => onGapSelect && onGapSelect(c.code)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    background: isGap ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                    border: isGap ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: onGapSelect ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isGap ? 'rgba(239, 68, 68, 0.14)' : 'rgba(255, 255, 255, 0.09)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isGap ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{c.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '2px' }}>
                      {c.category} • Target: {c.benchmark}%
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                      {c.score}%
                    </div>
                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: diff >= 0 ? '#4ade80' : '#f87171',
                    }}>
                      {diff >= 0 ? `+${diff}%` : `${diff}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) return inner;

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
      {inner}
    </div>
  );
};

export default CompetencyRadar;
