import { z } from 'zod';

export const proposalFormSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  mainAreaId: z.string().min(1, 'Main area is required'),
  background: z.string().min(50, 'Background must be at least 50 characters'),
  objectives: z.string().min(50, 'Objectives must be at least 50 characters'),
  methods: z.string().min(50, 'Methods must be at least 50 characters'),
  statisticalAnalysis: z.string().min(50, 'Statistical analysis must be at least 50 characters'),
  expectedImpact: z.string().optional(),
  references: z.string().optional(),
  nPatients: z.coerce.number().int().positive().optional().nullable(),
  statisticianName: z.string().optional()
});

export type ProposalFormData = z.infer<typeof proposalFormSchema>;
