export const ACTION_LABELS: Record<string, string> = {};

export interface AiUsageOpts {
  action?: string;
  inputTokens?: number;
  outputTokens?: number;
  teacherId?: string;
  teacherEmail?: string;
  teacherName?: string;
  courseId?: string;
  subjectName?: string;
}

/**
 * AI usage and token logging disabled per project requirements.
 */
export const logAiUsage = async (_opts?: AiUsageOpts): Promise<void> => {
  // No-op: logging removed
};

