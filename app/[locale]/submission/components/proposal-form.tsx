'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { proposalFormSchema, type ProposalFormData } from '@/lib/schemas/proposal';
import { useAction } from 'next-safe-action/hooks';
import { createProposalAction, updateProposalAction } from '@/lib/actions/proposal-actions';
import { useRouter } from '@/app/i18n/navigation';
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { MainArea } from '@/app/generated/prisma';
import { Save, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ProposalFormProps {
  initialData?: Partial<ProposalFormData>;
  proposalId?: string;
  mainAreas: MainArea[];
  submissionWindowId: string;
  centreCode: string;
  isEditing?: boolean;
  proposalCounts?: Record<string, number>;
}

export function ProposalForm({
  initialData,
  proposalId,
  mainAreas,
  submissionWindowId,
  centreCode,
  isEditing = false,
  proposalCounts = {}
}: ProposalFormProps) {
  const router = useRouter();
  const [secondaryObjectivesCount, setSecondaryObjectivesCount] = useState(initialData?.secondaryObjectives?.length || 0);
  const [secondaryEndpointsCount, setSecondaryEndpointsCount] = useState(initialData?.secondaryEndpoints?.length || 0);
  const [competingWorkCount, setCompetingWorkCount] = useState((initialData?.competingWork as any[])?.length || 0);

  const countWords = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: initialData || {
      title: '',
      mainAreaId: '',
      secondaryTopics: [],
      scientificBackground: '',
      literaturePosition: '',
      competingWork: [],
      primaryObjective: '',
      secondaryObjectives: [],
      mainExposure: '',
      primaryEndpoint: '',
      secondaryEndpoints: [],
      studyPopulation: '',
      inclusionCriteria: '',
      exclusionCriteria: '',
      dataBaseline: false,
      dataBiological: false,
      dataTTE: false,
      dataTOE: false,
      dataStressEcho: false,
      dataCMR: false,
      dataCT: false,
      dataRHC: false,
      dataHospitalFollowup: false,
      dataClinicalFollowup: false,
      dataTTEFollowup: false,
      dataCoreLab: false,
      analysisTypes: [],
      analysisDescription: '',
      adjustmentCovariates: '',
      subgroupAnalyses: '',
      targetJournals: []
    }
  });

  const { execute: createProposal, status: createStatus } = useAction(
    createProposalAction,
    {
      onSuccess: ({ data }) => {
        toast.success('Draft saved successfully');
        router.push(`/submission/${data?.proposalId}`);
      },
      onError: ({ error }) => {
        toast.error(error.serverError || 'Failed to save draft');
      }
    }
  );

  const { execute: updateProposal, status: updateStatus } = useAction(
    updateProposalAction,
    {
      onSuccess: () => {
        toast.success('Draft updated successfully');
        router.push(`/submission/${proposalId}`);
      },
      onError: ({ error }) => {
        toast.error(error.serverError || 'Failed to update draft');
      }
    }
  );

  const isExecuting = createStatus === 'executing' || updateStatus === 'executing';

  const onSubmit = (data: ProposalFormData) => {
    if (isEditing && proposalId) {
      updateProposal({ ...data, id: proposalId });
    } else {
      createProposal({
        ...data,
        submissionWindowId,
        centreCode
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => {
            const wordCount = countWords(field.value || '');
            return (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Enter proposal title' />
                </FormControl>
                <FormDescription>
                  {wordCount} / 25 words
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className='grid md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='mainAreaId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Topic *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select main topic' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mainAreas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.label} ({proposalCounts[area.id] || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='secondaryTopics'
            render={({ field }) => {
              const selectedMainArea = form.watch('mainAreaId');
              const availableAreas = mainAreas.filter(area => area.id !== selectedMainArea);

              return (
                <FormItem>
                  <FormLabel>Secondary Topic *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value ? [value] : [])}
                    value={field.value?.[0] || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select secondary topic' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.label} ({proposalCounts[area.id] || 0})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        <FormField
          control={form.control}
          name='scientificBackground'
          render={({ field }) => {
            const wordCount = countWords(field.value || '');
            return (
              <FormItem>
                <FormLabel>Scientific Background and Rationale *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Position of the question within the existing literature and description of the unmet need addressed by the study'
                    rows={6}
                  />
                </FormControl>
                <FormDescription>
                  {wordCount} / 200 words
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name='primaryObjective'
          render={({ field }) => {
            const wordCount = countWords(field.value || '');
            return (
              <FormItem>
                <FormLabel>Primary Objective *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='State the primary objective (max 50 words)'
                    rows={3}
                  />
                </FormControl>
                <FormDescription>
                  {wordCount} / 50 words
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name='secondaryObjectives'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary Objectives (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(line => line.trim());
                    field.onChange(lines);
                  }}
                  placeholder='Enter secondary objectives (one per line, maximum 3, 50 words per objective)'
                  rows={4}
                />
              </FormControl>
              <FormDescription>Maximum 3 objectives, 50 words per objective</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='mainExposure'
          render={({ field }) => {
            const wordCount = countWords(field.value || '');
            return (
              <FormItem>
                <FormLabel>Main Exposure Variable of Interest *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Describe the main exposure variable of interest (max 50 words)'
                    rows={3}
                  />
                </FormControl>
                <FormDescription>
                  {wordCount} / 50 words
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name='primaryEndpoint'
          render={({ field }) => {
            const wordCount = countWords(field.value || '');
            return (
              <FormItem>
                <FormLabel>Primary Endpoint *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Describe the primary endpoint (max 50 words)'
                    rows={3}
                  />
                </FormControl>
                <FormDescription>
                  {wordCount} / 50 words
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name='secondaryEndpoints'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary Endpoints (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(line => line.trim());
                    field.onChange(lines);
                  }}
                  placeholder='Enter secondary endpoints (one per line, maximum 3, 50 words per endpoint)'
                  rows={4}
                />
              </FormControl>
              <FormDescription>Maximum 3 endpoints, 50 words per endpoint</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='studyPopulation'
          render={({ field }) => {
            const wordCount = countWords(field.value || '');
            return (
              <FormItem>
                <FormLabel>Study Population with Selection Criteria *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Describe the study population and selection criteria (max 100 words)'
                    rows={4}
                  />
                </FormControl>
                <FormDescription>
                  {wordCount} / 100 words
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name='inclusionCriteria'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Targeted Sub-Cohort - Specific Inclusion Criteria</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder='List specific inclusion criteria (be as precise as possible)'
                  rows={3}
                />
              </FormControl>
              <FormDescription>Be as precise as possible, ideally with inclusion checkboxes</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='exclusionCriteria'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Targeted Sub-Cohort - Specific Exclusion Criteria</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder='List specific exclusion criteria (be as precise as possible)'
                  rows={3}
                />
              </FormControl>
              <FormDescription>Be as precise as possible, ideally with exclusion checkboxes</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='space-y-4'>
          <p className='text-sm text-muted-foreground'>Select all data types required for this study</p>

          <div className='grid md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='dataBaseline'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className='font-normal'>Baseline data</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dataBiological'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className='font-normal'>Biological samples</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dataTTE'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className='font-normal'>Transthoracic Echo (TTE)</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dataTOE'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className='font-normal'>Transesophageal Echo (TOE)</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dataStressEcho'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className='font-normal'>Stress Echo</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dataCMR'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className='font-normal'>Cardiac MRI (CMR)</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dataCT'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className='font-normal'>Cardiac CT</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dataRHC'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className='font-normal'>Right Heart Catheterization (RHC)</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dataHospitalFollowup'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className='font-normal'>Hospital Follow-up</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dataClinicalFollowup'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className='font-normal'>Clinical Follow-up</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dataTTEFollowup'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className='font-normal'>TTE Follow-up</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dataCoreLab'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className='font-normal'>Core Lab data</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className='space-y-4'>
          <FormLabel>Analysis Types</FormLabel>
          <div className='grid md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='analysisTypes'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes('logistic')}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          field.onChange(
                            checked
                              ? [...current, 'logistic']
                              : current.filter((val) => val !== 'logistic')
                          );
                        }}
                      />
                    </FormControl>
                    <FormLabel className='font-normal'>Logistic regression</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='analysisTypes'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes('cox')}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          field.onChange(
                            checked
                              ? [...current, 'cox']
                              : current.filter((val) => val !== 'cox')
                          );
                        }}
                      />
                    </FormControl>
                    <FormLabel className='font-normal'>Cox regression</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='analysisTypes'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes('propensity')}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          field.onChange(
                            checked
                              ? [...current, 'propensity']
                              : current.filter((val) => val !== 'propensity')
                          );
                        }}
                      />
                    </FormControl>
                    <FormLabel className='font-normal'>Propensity score matching</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='analysisTypes'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes('ml')}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          field.onChange(
                            checked
                              ? [...current, 'ml']
                              : current.filter((val) => val !== 'ml')
                          );
                        }}
                      />
                    </FormControl>
                    <FormLabel className='font-normal'>Machine Learning</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name='analysisDescription'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Analysis Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Describe the statistical analysis plan (max 50 words)'
                    rows={3}
                  />
                </FormControl>
                <FormDescription>Maximum 50 words</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='adjustmentCovariates'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adjustment Covariates (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='List adjustment covariates (max 50 words)'
                    rows={2}
                  />
                </FormControl>
                <FormDescription>Maximum 50 words</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='subgroupAnalyses'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subgroup Analyses (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Describe subgroup analyses (max 50 words)'
                    rows={2}
                  />
                </FormControl>
                <FormDescription>Maximum 50 words</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

        <p className='text-sm text-muted-foreground'>Maximum 3 target journals</p>

        {[0, 1, 2].map((index) => (
            <FormField
              key={index}
              control={form.control}
              name={`targetJournals.${index}` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Journal {index + 1} {index === 0 ? '' : '(Optional)'}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Journal name' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        ))}

        <div className='flex gap-4 pt-4'>
          <Button
            type='submit'
            size='lg'
            disabled={isExecuting}
            className='flex-1'
          >
            <Save className='h-5 w-5 mr-2' />
            {isExecuting ? 'Saving...' : isEditing ? 'Update Draft' : 'Save Draft'}
          </Button>
          <Button
            type='button'
            size='lg'
            variant='outline'
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
