/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CredentialRecord {
  id: string;
  certificate_number: string;
  competency_name: string;
  competency_code: string;
  score: number;
  full_name: string;
  cadre: string;
  designation: string;
  credential_hash: string;
  tx_hash: string | null;
  block_number: number | null;
  issuer_did: string | null;
  issued_at: string;
}

export interface VerifiableCredentialProps {
  isOpen: boolean;
  onClose: () => void;
  /** Supabase auth UUID of the logged-in trainee */
  traineeId?: string;
  /** Optional: pass a specific credential ID to display */
  credentialId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const VerifiableCredentialModal: React.FC<VerifiableCredentialProps> = ({
  isOpen,
  onClose,
  traineeId,
  credentialId,
}) => {
  const [credential, setCredential] = useState<CredentialRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ─── Fetch credential on open ────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (!traineeId && !credentialId) {
      setError('No trainee ID provided.');
      return;
    }

    setLoading(true);
    setError(null);
    setCredential(null);

    const fetchCredential = async () => {
      try {
        let query = supabase
          .from('verifiable_credentials')
          .select('*, users(full_name, cadre, designation)');

        if (credentialId) {
          query = query.eq('id', credentialId);
        } else {
          query = query.eq('trainee_id', traineeId).order('issued_at', { ascending: false }).limit(1);
        }

        const { data, error: dbError } = await query.single();

        if (dbError || !data) {
          setError('No credential found. Issue a credential first via an assessment.');
        } else {
          setCredential({
            ...data,
            full_name: data.full_name || data.users?.full_name || 'Officer',
            cadre: data.cadre || data.users?.cadre || 'ISS',
            competency_name: data.competency_name || data.credential_title || data.competency_code,
            score: data.score ?? data.score_achieved ?? 0,
          });
        }
      } catch (e) {
        setError('Failed to load credential data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCredential();
  }, [isOpen, traineeId, credentialId]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (credential?.tx_hash) {
      navigator.clipboard.writeText(credential.tx_hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const issuedDate = credential?.issued_at
    ? new Date(credential.issued_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const isAnchored = Boolean(credential?.tx_hash && credential?.block_number);

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(8, 15, 28, 0.25)',
        backdropFilter: 'blur(8px) saturate(140%)',
        WebkitBackdropFilter: 'blur(8px) saturate(140%)',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '560px',
          width: '100%',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.08) 100%), rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(32px) saturate(210%)',
          WebkitBackdropFilter: 'blur(32px) saturate(210%)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          borderRadius: '28px',
          padding: '28px 30px',
          color: '#ffffff',
          boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.12)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          aria-label="Close modal"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.18)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            color: '#ffffff',
            width: '34px',
            height: '34px',
            minWidth: '34px',
            minHeight: '34px',
            maxWidth: '34px',
            maxHeight: '34px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            margin: 0,
            boxSizing: 'border-box',
            flexShrink: 0,
            outline: 'none',
            transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.32)'; 
            e.currentTarget.style.transform = 'scale(1.08)'; 
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'; 
            e.currentTarget.style.transform = 'scale(1)'; 
          }}
        >
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth="2.8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ display: 'block', pointerEvents: 'none' }}
          >
            <line x1="18" y1="6" x2="6" y2="18" stroke="#ffffff" strokeWidth="2.8" />
            <line x1="6" y1="6" x2="18" y2="18" stroke="#ffffff" strokeWidth="2.8" />
          </svg>
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.08))',
            border: '1px solid rgba(255, 255, 255, 0.38)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.4px' }}>
              Blockchain Verifiable Credential
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
              Cryptographically Anchored on Polygon Amoy
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            Loading credential from blockchain...
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{
            background: 'rgba(255, 100, 100, 0.08)',
            border: '1px solid rgba(255, 100, 100, 0.25)',
            borderRadius: '14px',
            padding: '20px',
            textAlign: 'center',
            color: 'rgba(255, 180, 180, 0.9)',
            fontSize: '0.88rem',
            lineHeight: 1.6,
          }}>
            {error}
          </div>
        )}

        {/* Credential Data */}
        {!loading && credential && (
          <>
            {/* Certificate Overview Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              borderRadius: '18px',
              padding: '18px 20px',
              marginBottom: '16px',
              fontSize: '0.86rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '11px',
              color: '#ffffff',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 8px 24px -4px rgba(0, 0, 0, 0.15)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Certificate Number:</span>
                <span style={{ 
                  fontWeight: 700, 
                  fontFamily: 'monospace', 
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.14)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  letterSpacing: '0.5px',
                }}>
                  {credential.certificate_number}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Officer / Cadre:</span>
                <span style={{ fontWeight: 700, color: '#ffffff' }}>
                  {credential.full_name} ({credential.cadre?.split(' ')[0] ?? 'ISS'})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Certified Competency:</span>
                <span style={{ fontWeight: 700, color: '#ffffff' }}>{credential.competency_name} — {credential.score}% Score</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Issuing Authority:</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>NSSTA, MoSPI (Govt. of India)</span>
              </div>
              {issuedDate && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Issue Date:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{issuedDate}</span>
                </div>
              )}
            </div>

            {/* On-Chain Proof Box */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(5, 150, 105, 0.06) 100%), rgba(10, 25, 20, 0.25)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: `1px solid ${isAnchored ? 'rgba(52, 211, 153, 0.38)' : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: '18px',
              padding: '16px 18px',
              fontFamily: 'monospace',
              fontSize: '0.76rem',
              marginBottom: '20px',
              color: '#ffffff',
              boxShadow: isAnchored 
                ? '0 8px 24px -4px rgba(16, 185, 129, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                : 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: '8px',
              }}>
                <span style={{ 
                  fontWeight: 800, 
                  color: isAnchored ? '#6ee7b7' : '#ffffff', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  background: isAnchored ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  border: `1px solid ${isAnchored ? 'rgba(52, 211, 153, 0.45)' : 'rgba(255, 255, 255, 0.2)'}`,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  letterSpacing: '0.5px',
                  boxShadow: isAnchored ? '0 0 12px rgba(16, 185, 129, 0.25)' : 'none',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  {isAnchored ? 'ANCHORED ON POLYGON AMOY' : 'PENDING BLOCKCHAIN ANCHOR'}
                </span>
                {credential.block_number && (
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>Block #{credential.block_number}</span>
                )}
              </div>

              {credential.tx_hash ? (
                <div style={{ wordBreak: 'break-all', marginBottom: '8px', lineHeight: 1.5 }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Tx Hash: </span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{credential.tx_hash}</span>
                </div>
              ) : (
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                  Transaction hash pending — credential not yet anchored on-chain.
                </div>
              )}

              <div style={{ wordBreak: 'break-all', lineHeight: 1.5 }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>SHA-256 Digest: </span>
                <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{credential.credential_hash}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCopy}
                disabled={!credential.tx_hash}
                style={{
                  flex: 1,
                  padding: '13px 18px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  background: 'rgba(255, 255, 255, 0.14)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  color: credential.tx_hash ? '#ffffff' : 'rgba(255,255,255,0.3)',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: credential.tx_hash ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                  transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
                onMouseEnter={(e) => { 
                  if (credential.tx_hash) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.24)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)'; 
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {copied ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span style={{ color: '#6ee7b7' }}>Proof Copied</span>
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copy Tx Proof</span>
                  </>
                )}
              </button>

              {credential.tx_hash ? (
                <a
                  href={`https://amoy.polygonscan.com/tx/${credential.tx_hash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    padding: '13px 18px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.9)',
                    background: '#ffffff',
                    color: '#090d16',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 20px rgba(255, 255, 255, 0.28), inset 0 1px 0 #ffffff',
                    transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.transform = 'translateY(-2px)'; 
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.4), inset 0 1px 0 #ffffff';
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.transform = 'none'; 
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.28), inset 0 1px 0 #ffffff';
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span>Verify on Blockchain</span>
                </a>
              ) : (
                <div style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  Pending Anchor
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifiableCredentialModal;
