import { Request, Response } from 'express';
import { adminSupabase } from '../supabaseAdmin.js';

interface AiLog {
  id: string;
  action: string;
  action_label: string;
  teacher_id: string;
  teacher_name: string;
  teacher_email: string;
  course_id: string | null;
  subject_name: string | null;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  cost_inr: number;
  month: string;
  created_at: string;
}

// ─── GET /api/admin/summary ────────────────────────────────────────────────────
export const getAdminSummary = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    totals: { totalCalls: 0, totalCostINR: 0, totalTokensIn: 0, totalTokensOut: 0 },
    thisMonth: { calls: 0, costINR: 0 },
    monthlyData: [],
    teacherData: [],
    actionData: [],
    mostActiveTeacher: null,
    topAction: null,
  });
};

// ─── GET /api/admin/logs ───────────────────────────────────────────────────────
export const getAdminLogs = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ logs: [], total: 0 });
};
