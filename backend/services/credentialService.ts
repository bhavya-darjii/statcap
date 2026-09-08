/**
 * credentialService.ts
 * Builds canonical credential payloads, hashes them, and generates
 * MoSPI certificate numbers. All functions are pure / deterministic.
 */
import { createHash } from 'crypto';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CredentialPayload {
  version: '1.0';
  issuer: string;
  trainee_id: string;
  full_name: string;
  cadre: string;
  designation: string;
  competency_code: string;
  competency_name: string;
  score: number;
  assessment_id: string;
  issued_at: string; // ISO 8601
  certificate_number: string;
}

export interface CredentialRecord {
  trainee_id: string;
  certificate_number: string;
  competency_code: string;
  competency_name: string;
  score: number;
  full_name: string;
  cadre: string;
  designation: string;
  assessment_id: string;
  credential_hash: string; // hex, 0x-prefixed
  payload_json: string;
}

// ─── Certificate Number ───────────────────────────────────────────────────────

/**
 * Generate a unique certificate number in the format:
 *   MoSPI-NSSTA-YYYY-NNNN
 *   where NNNN is a 4-digit padded random number combined with seconds.
 */
export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 8999); // 4-digit
  return `MoSPI-NSSTA-${year}-${rand}`;
}

// ─── Canonical JSON ───────────────────────────────────────────────────────────

/**
 * Build a deterministic credential payload.
 * The JSON string is sorted by key so the hash is stable regardless of
 * insertion order.
 */
export function buildCredentialPayload(
  traineeId: string,
  fullName: string,
  cadre: string,
  designation: string,
  competencyCode: string,
  competencyName: string,
  score: number,
  assessmentId: string,
  certificateNumber: string,
  issuerAddress: string,
): CredentialPayload {
  const payload: CredentialPayload = {
    version: '1.0',
    issuer: `did:polygon:amoy:${issuerAddress}`,
    trainee_id: traineeId,
    full_name: fullName,
    cadre,
    designation,
    competency_code: competencyCode,
    competency_name: competencyName,
    score,
    assessment_id: assessmentId,
    issued_at: new Date().toISOString(),
    certificate_number: certificateNumber,
  };
  return payload;
}

/**
 * SHA-256 hash of a credential payload, returned as 0x-prefixed hex.
 */
export function hashCredentialPayload(payload: CredentialPayload): string {
  // Canonical JSON: sort keys for determinism
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  const hash = createHash('sha256').update(canonical).digest('hex');
  return `0x${hash}`;
}

/**
 * Full credential record ready for Supabase insertion (minus tx_hash / block_number,
 * which are added after the blockchain call returns).
 */
export function buildCredentialRecord(
  payload: CredentialPayload,
  credentialHash: string,
): CredentialRecord {
  return {
    trainee_id: payload.trainee_id,
    certificate_number: payload.certificate_number,
    competency_code: payload.competency_code,
    competency_name: payload.competency_name,
    score: payload.score,
    full_name: payload.full_name,
    cadre: payload.cadre,
    designation: payload.designation,
    assessment_id: payload.assessment_id,
    credential_hash: credentialHash,
    payload_json: JSON.stringify(payload, Object.keys(payload).sort()),
  };
}
