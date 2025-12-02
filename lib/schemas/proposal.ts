import { z } from 'zod';

// Helper function to count words
const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

// Competing work reference schema
const competingWorkSchema = z.object({
  doi: z.string().optional(),
  pmid: z.string().optional(),
  journal: z.string().min(1, 'Journal is required'),
  nPatients: z.number().min(0, 'Number of patients must be positive').optional()
});

export const proposalFormSchema = z.object({
  // Basic info
  title: z.string()
    .min(1, 'Title is required')
    .refine(
      (val) => countWords(val) <= 25,
      { message: 'Title must not exceed 25 words' }
    ),

  mainAreaId: z.string().min(1, 'Main topic is required'),

  secondaryTopics: z.array(z.string()).max(2, 'Maximum 2 secondary topics allowed').default([]),

  // Scientific background
  scientificBackground: z.string()
    .min(1, 'Scientific background is required')
    .refine(
      (val) => countWords(val) <= 200,
      { message: 'Scientific background must not exceed 200 words' }
    ),

  literaturePosition: z.string().min(1, 'Literature position is required'),

  competingWork: z.array(competingWorkSchema)
    .max(10, 'Maximum 10 references allowed')
    .default([]),

  // Objectives
  primaryObjective: z.string()
    .min(1, 'Primary objective is required')
    .refine(
      (val) => countWords(val) <= 50,
      { message: 'Primary objective must not exceed 50 words' }
    ),

  secondaryObjectives: z.array(z.string())
    .max(3, 'Maximum 3 secondary objectives allowed')
    .refine(
      (arr) => arr.every(val => countWords(val) <= 50),
      { message: 'Each secondary objective must not exceed 50 words' }
    )
    .default([]),

  // Study design
  mainExposure: z.string()
    .min(1, 'Main exposure variable is required')
    .refine(
      (val) => countWords(val) <= 50,
      { message: 'Main exposure must not exceed 50 words' }
    ),

  primaryEndpoint: z.string()
    .min(1, 'Primary endpoint is required')
    .refine(
      (val) => countWords(val) <= 50,
      { message: 'Primary endpoint must not exceed 50 words' }
    ),

  secondaryEndpoints: z.array(z.string())
    .max(3, 'Maximum 3 secondary endpoints allowed')
    .refine(
      (arr) => arr.every(val => countWords(val) <= 50),
      { message: 'Each secondary endpoint must not exceed 50 words' }
    )
    .default([]),

  // Population
  studyPopulation: z.string()
    .min(1, 'Study population is required')
    .refine(
      (val) => countWords(val) <= 100,
      { message: 'Study population must not exceed 100 words' }
    ),

  inclusionCriteria: z.string().optional(),
  exclusionCriteria: z.string().optional(),

  // Data requirements
  dataBaseline: z.boolean().default(false),
  dataBiological: z.boolean().default(false),
  dataTTE: z.boolean().default(false),
  dataTOE: z.boolean().default(false),
  dataStressEcho: z.boolean().default(false),
  dataCMR: z.boolean().default(false),
  dataCT: z.boolean().default(false),
  dataRHC: z.boolean().default(false),
  dataHospitalFollowup: z.boolean().default(false),
  dataClinicalFollowup: z.boolean().default(false),
  dataTTEFollowup: z.boolean().default(false),
  dataCoreLab: z.boolean().default(false),

  // Statistical analysis
  analysisTypes: z.array(z.enum(['logistic', 'cox', 'propensity', 'ml'])).default([]),

  analysisDescription: z.string()
    .refine(
      (val) => !val || countWords(val) <= 50,
      { message: 'Analysis description must not exceed 50 words' }
    )
    .optional(),

  adjustmentCovariates: z.string()
    .refine(
      (val) => !val || countWords(val) <= 50,
      { message: 'Adjustment covariates must not exceed 50 words' }
    )
    .optional(),

  subgroupAnalyses: z.string()
    .refine(
      (val) => !val || countWords(val) <= 50,
      { message: 'Subgroup analyses must not exceed 50 words' }
    )
    .optional(),

  // Target journals
  targetJournals: z.array(z.string()).max(3, 'Maximum 3 target journals allowed').default([])
});

export type ProposalFormData = z.infer<typeof proposalFormSchema>;
