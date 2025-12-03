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

const proposalFormSchemaBase = z.object({
  // Basic info
  title: z.string()
    .min(1, 'Title is required')
    .refine(
      (val) => countWords(val) <= 25,
      { message: 'Title must not exceed 25 words' }
    ),

  mainAreaId: z.string().min(1, 'Main topic is required'),

  secondaryTopics: z.array(z.string()).min(1, 'Secondary topic is required').max(2, 'Maximum 2 secondary topics allowed'),

  // Scientific background
  scientificBackground: z.string()
    .min(1, 'Scientific background is required')
    .refine(
      (val) => countWords(val) <= 200,
      { message: 'Scientific background must not exceed 200 words' }
    ),

  literaturePosition: z.string().optional(),

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
      (arr) => {
        const totalWords = arr.reduce((sum, val) => sum + countWords(val), 0);
        return totalWords <= 150;
      },
      { message: 'Secondary objectives must not exceed 150 words total' }
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
      (arr) => {
        const totalWords = arr.reduce((sum, val) => sum + countWords(val), 0);
        return totalWords <= 150;
      },
      { message: 'Secondary endpoints must not exceed 150 words total' }
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
    .min(1, 'Analysis description is required')
    .refine(
      (val) => countWords(val) <= 100,
      { message: 'Analysis description must not exceed 100 words' }
    ),

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
  targetJournals: z.array(z.string())
    .refine(
      (arr) => {
        // Only check that first journal (index 0) is filled
        return arr.length > 0 && arr[0] && arr[0].trim().length > 0;
      },
      { message: 'Journal 1 is required' }
    )
    .transform((arr) => {
      // Filter out empty strings from journals 2 and 3, but keep journal 1
      if (arr.length === 0) return [];
      const result = [arr[0]]; // Always keep journal 1
      if (arr[1] && arr[1].trim()) result.push(arr[1]); // Add journal 2 if not empty
      if (arr[2] && arr[2].trim()) result.push(arr[2]); // Add journal 3 if not empty
      return result;
    })
    .default(['', '', ''])
});

// Export the base schema for use with .extend()
export const proposalFormSchema = proposalFormSchemaBase;

// Export a validated schema with refinements for form validation
export const proposalFormSchemaValidated = proposalFormSchemaBase.refine(
  (data) => {
    // At least one data requirement must be selected
    return data.dataBaseline || data.dataBiological || data.dataTTE ||
           data.dataTOE || data.dataStressEcho || data.dataCMR ||
           data.dataCT || data.dataRHC || data.dataHospitalFollowup ||
           data.dataClinicalFollowup || data.dataTTEFollowup || data.dataCoreLab;
  },
  {
    message: 'At least one data requirement must be selected',
    path: ['dataBaseline']
  }
);

export type ProposalFormData = z.infer<typeof proposalFormSchema>;
