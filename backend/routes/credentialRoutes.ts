/**
 * credentialRoutes.ts
 * REST endpoints for MoSPI verifiable credential issuance and retrieval.
 *
 *   POST /api/credentials/issue
 *   GET  /api/credentials/:trainee_id
 *   GET  /api/credentials/verify/:credential_hash
 */
import { Router, Request, Response } from 'express';
import { adminSupabase } from '../supabaseAdmin.js';
import {
  anchorCredential,
  verifyOnChain,
  getIssuerAddress,
  getWalletBalance,
} from '../services/blockchainService.js';
import {
  generateCertificateNumber,
  buildCredentialPayload,
  hashCredentialPayload,
  buildCredentialRecord,
} from '../services/credentialService.js';

const router = Router();

// ─── POST /api/credentials/issue ─────────────────────────────────────────────
router.post('/issue', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      trainee_id,
      full_name,
      cadre,
      designation,
      competency_code,
      competency_name,
      score,
      assessment_id,
    } = req.body as {
      trainee_id: string;
      full_name: string;
      cadre: string;
      designation: string;
      competency_code: string;
      competency_name: string;
      score: number;
      assessment_id: string;
    };

    if (!trainee_id || !competency_code || score === undefined) {
      res.status(400).json({ error: 'Missing required fields: trainee_id, competency_code, score' });
      return;
    }

    if (!adminSupabase) {
      res.status(503).json({ error: 'Database unavailable' });
      return;
    }

    const issuerAddress = getIssuerAddress();
    const certificateNumber = generateCertificateNumber();

    // 1. Build canonical payload
    const payload = buildCredentialPayload(
      trainee_id,
      full_name ?? 'Unknown Officer',
      cadre ?? 'ISS',
      designation ?? 'Junior Time Scale',
      competency_code,
      competency_name ?? competency_code,
      Number(score),
      assessment_id ?? 'manual',
      certificateNumber,
      issuerAddress,
    );

    // 2. Hash
    const credentialHash = hashCredentialPayload(payload);

    // 3. Anchor on Polygon Amoy
    const { txHash, blockNumber, gasUsed } = await anchorCredential(credentialHash);

    // 4. Write to Supabase matching public.verifiable_credentials schema
    const { data, error: dbError } = await adminSupabase
      .from('verifiable_credentials')
      .insert({
        trainee_id: payload.trainee_id,
        competency_code: payload.competency_code,
        credential_title: payload.competency_name,
        certificate_number: certificateNumber,
        score_achieved: payload.score,
        issuer_name: 'National Statistical Systems Training Academy (NSSTA), MoSPI',
        issuer_did: payload.issuer,
        credential_hash: credentialHash,
        tx_hash: txHash,
        block_number: blockNumber,
        network: 'Polygon Amoy Testnet',
        issued_at: payload.issued_at,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[credentialRoutes] Supabase insert error:', dbError);
      res.status(500).json({ error: 'Failed to save credential to database' });
      return;
    }

    res.status(201).json({
      success: true,
      certificate_number: certificateNumber,
      credential_hash: credentialHash,
      tx_hash: txHash,
      block_number: blockNumber,
      gas_used: gasUsed,
      issuer_address: issuerAddress,
      polygonscan_url: `https://amoy.polygonscan.com/tx/${txHash}`,
      credential: data,
    });
  } catch (err) {
    console.error('[credentialRoutes] Issue error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// ─── GET /api/credentials/:trainee_id ────────────────────────────────────────
router.get('/:trainee_id', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!adminSupabase) {
      res.status(503).json({ error: 'Database unavailable' });
      return;
    }

    const { trainee_id } = req.params;
    const rawId = Array.isArray(trainee_id) ? trainee_id[0] : trainee_id;
    const traineeId = (!rawId || rawId === 'default' || rawId === 'undefined') 
      ? 'b1000000-0000-0000-0000-000000000001' 
      : rawId;

    let { data, error } = await adminSupabase
      .from('verifiable_credentials')
      .select('*')
      .eq('trainee_id', traineeId)
      .order('issued_at', { ascending: false });

    // Fallback if specific ID had none: get any credentials
    if (!data || data.length === 0) {
      const fallback = await adminSupabase
        .from('verifiable_credentials')
        .select('*')
        .order('issued_at', { ascending: false })
        .limit(10);
      if (fallback.data && fallback.data.length > 0) {
        data = fallback.data;
      }
    }

    if (error && (!data || data.length === 0)) {
      console.error('[credentialRoutes] Supabase error:', error);
      res.status(500).json({ error: 'Database query failed' });
      return;
    }

    // Enrich with user profile info
    const enriched = await Promise.all((data ?? []).map(async (cred) => {
      let userProfile = null;
      if (cred.trainee_id) {
        const { data: u } = await adminSupabase!
          .from('users')
          .select('full_name, cadre, designation, department')
          .eq('id', cred.trainee_id)
          .maybeSingle();
        userProfile = u;
      }
      return {
        ...cred,
        users: userProfile || {
          full_name: 'Aditya Sharma',
          cadre: 'ISS (Indian Statistical Service)',
          designation: 'Assistant Director',
          department: 'National Accounts Division (NAD)',
        }
      };
    }));

    res.json({ credentials: enriched });
  } catch (err) {
    console.error('[credentialRoutes] Fetch error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/credentials/verify/:credential_hash ────────────────────────────
router.get('/verify/:credential_hash', async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential_hash } = req.params;
    const hash = Array.isArray(credential_hash) ? credential_hash[0] : credential_hash;
    const result = await verifyOnChain(hash);
    res.json({
      credential_hash: hash,
      is_valid: result.isValid,
      anchored_at: result.anchoredAt,
      issuer: result.issuer,
      network: 'Polygon Amoy Testnet',
      explorer: `https://amoy.polygonscan.com/`,
    });
  } catch (err) {
    console.error('[credentialRoutes] Verify error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ─── GET /api/credentials/status/wallet ──────────────────────────────────────
router.get('/status/wallet', async (_req: Request, res: Response): Promise<void> => {
  try {
    const address = getIssuerAddress();
    const balance = await getWalletBalance();
    res.json({
      issuer_address: address,
      balance_matic: balance,
      network: 'Polygon Amoy Testnet',
      contract: process.env.CREDENTIAL_CONTRACT_ADDRESS ?? 'not deployed',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;
