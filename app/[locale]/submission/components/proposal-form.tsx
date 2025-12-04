'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { proposalFormSchemaValidated, type ProposalFormData } from '@/lib/schemas/proposal';
import { useAction } from 'next-safe-action/hooks';
import { createProposalAction, updateProposalAction, createAndSubmitProposalAction, updateAndSubmitProposalAction } from '@/lib/actions/proposal-actions';
import { useRouter } from '@/app/i18n/navigation';
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { MainArea } from '@/app/generated/prisma';
import { Save, Plus, Trash2, Send } from 'lucide-react';
import { useState } from 'react';

interface ProposalFormProps {
  initialData?: Partial<ProposalFormData>;
  proposalId?: string;
  mainAreas: MainArea[];
  submissionWindowId: string;
  centreId: string;
  isEditing?: boolean;
  proposalCounts?: Record<string, number>;
  readOnly?: boolean;
}

export function ProposalForm({
  initialData,
  proposalId,
  mainAreas,
  submissionWindowId,
  centreId,
  isEditing = false,
  proposalCounts = {},
  readOnly = false
}: ProposalFormProps) {
  const router = useRouter();
  const [secondaryObjectivesCount, setSecondaryObjectivesCount] = useState(initialData?.secondaryObjectives?.length || 0);
  const [secondaryEndpointsCount, setSecondaryEndpointsCount] = useState(initialData?.secondaryEndpoints?.length || 0);
  const [competingWorkCount, setCompetingWorkCount] = useState((initialData?.competingWork as any[])?.length || 0);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  const countWords = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalFormSchemaValidated),
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
      targetJournals: ['', '', '']
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

  const { execute: createAndSubmitProposal, status: createSubmitStatus } = useAction(
    createAndSubmitProposalAction,
    {
      onSuccess: ({ data }) => {
        toast.success('Proposal submitted successfully');
        router.push(`/submission/${data?.proposalId}`);
      },
      onError: ({ error }) => {
        toast.error(error.serverError || 'Failed to submit proposal');
      }
    }
  );

  const { execute: updateAndSubmitProposal, status: updateSubmitStatus } = useAction(
    updateAndSubmitProposalAction,
    {
      onSuccess: () => {
        toast.success('Proposal submitted successfully');
        router.push(`/submission/${proposalId}`);
      },
      onError: ({ error }) => {
        toast.error(error.serverError || 'Failed to submit proposal');
      }
    }
  );

  const isExecuting = createStatus === 'executing' || updateStatus === 'executing' || createSubmitStatus === 'executing' || updateSubmitStatus === 'executing';

  const onSubmit = (data: ProposalFormData) => {
    if (isEditing && proposalId) {
      updateProposal({ ...data, id: proposalId });
    } else {
      createProposal({
        ...data,
        submissionWindowId,
        centreId
      });
    }
  };

  const handleSubmitConfirmed = () => {
    const formData = form.getValues();

    if (isEditing && proposalId) {
      updateAndSubmitProposal({ ...formData, id: proposalId });
    } else {
      createAndSubmitProposal({
        ...formData,
        submissionWindowId,
        centreId
      });
    }

    setIsSubmitDialogOpen(false);
  };

  const handleSubmitClick = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setIsSubmitDialogOpen(true);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <fieldset disabled={readOnly} className='space-y-8'>
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => {
            const wordCount = countWords(field.value || '');
            return (
              <FormItem>
                <div className='flex justify-between items-center'>
                  <FormLabel className='text-lg font-bold'>Title of This Ancillary Study *</FormLabel>
                  <span className='text-sm text-muted-foreground'>{wordCount} / 25 words</span>
                </div>
                <FormControl>
                  <Input {...field} placeholder='Enter proposal title' />
                </FormControl>
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
                  <SelectContent align='start'>
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
                    <SelectContent align='start'>
                      {availableAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.label}
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
                <div className='flex justify-between items-center'>
                  <FormLabel>Scientific Background and Rationale *</FormLabel>
                  <span className='text-sm text-muted-foreground'>{wordCount} / 200 words</span>
                </div>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Position the question within the existing literature and describe the unmet need addressed by the study'
                    rows={6}
                  />
                </FormControl>
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
                <div className='flex justify-between items-center'>
                  <FormLabel>Primary Objective of This Ancillary Study *</FormLabel>
                  <span className='text-sm text-muted-foreground'>{wordCount} / 50 words</span>
                </div>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='State the primary objective'
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name='secondaryObjectives'
          render={({ field }) => {
            const allText = Array.isArray(field.value) ? field.value.join(' ') : '';
            const wordCount = countWords(allText);
            return (
              <FormItem>
                <div className='flex justify-between items-center'>
                  <FormLabel>Secondary Objectives (Optional)</FormLabel>
                  <span className='text-sm text-muted-foreground'>{wordCount} / 150 words</span>
                </div>
                <FormControl>
                  <Textarea
                    {...field}
                    value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n').filter(line => line.trim());
                      field.onChange(lines);
                    }}
                    placeholder='Enter secondary objectives (maximum 3)'
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name='mainExposure'
          render={({ field }) => {
            const wordCount = countWords(field.value || '');
            return (
              <FormItem>
                <div className='flex justify-between items-center'>
                  <FormLabel>Main Exposure Variable of Interest *</FormLabel>
                  <span className='text-sm text-muted-foreground'>{wordCount} / 50 words</span>
                </div>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Describe the main exposure variable of interest'
                    rows={3}
                  />
                </FormControl>
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
                <div className='flex justify-between items-center'>
                  <FormLabel>Primary Endpoint *</FormLabel>
                  <span className='text-sm text-muted-foreground'>{wordCount} / 50 words</span>
                </div>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Describe the primary endpoint'
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name='secondaryEndpoints'
          render={({ field }) => {
            const allText = Array.isArray(field.value) ? field.value.join(' ') : '';
            const wordCount = countWords(allText);
            return (
              <FormItem>
                <div className='flex justify-between items-center'>
                  <FormLabel>Secondary Endpoints (Optional)</FormLabel>
                  <span className='text-sm text-muted-foreground'>{wordCount} / 150 words</span>
                </div>
                <FormControl>
                  <Textarea
                    {...field}
                    value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n').filter(line => line.trim());
                      field.onChange(lines);
                    }}
                    placeholder='Enter secondary endpoints (maximum 3)'
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name='studyPopulation'
          render={({ field }) => {
            const wordCount = countWords(field.value || '');
            return (
              <FormItem>
                <div className='flex justify-between items-center'>
                  <FormLabel>Study Population of This Ancillary Study *</FormLabel>
                  <span className='text-sm text-muted-foreground'>{wordCount} / 100 words</span>
                </div>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Describe the targeted sub-cohort, specify inclusion/exclusion criteria'
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />


        <div className='space-y-6'>
          <div className='space-y-2'>
            <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
              Data Requirements for This Ancillary Study *
            </label>
            <p className='text-sm text-muted-foreground'>Select all data types required for this study</p>
          </div>

          <div className='grid md:grid-cols-1 gap-3'>
            <FormField
              control={form.control}
              name='dataBaseline'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className='font-normal'>Baseline clinical data</FormLabel>
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
                  <FormLabel className='font-normal'>Biological data</FormLabel>
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
                  <FormLabel className='font-normal'>TTE imaging data</FormLabel>
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
                  <FormLabel className='font-normal'>TOE imaging data</FormLabel>
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
                  <FormLabel className='font-normal'>Stress echocardiography imaging data</FormLabel>
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
                  <FormLabel className='font-normal'>CMR imaging data</FormLabel>
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
                  <FormLabel className='font-normal'>CT imaging data</FormLabel>
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
                  <FormLabel className='font-normal'>Right heart catheterization data</FormLabel>
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
                  <FormLabel className='font-normal'>In-hospital follow-up data (all-cause death and CV death)</FormLabel>
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
                  <FormLabel className='font-normal'>Clinical follow-up data at 1 year</FormLabel>
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
                  <FormLabel className='font-normal'>TTE follow-up data at 1 year (only if your institution is part of this option)</FormLabel>
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
                  <FormLabel className='font-normal'>Core Lab–derived data (only if your institution is part of this option)</FormLabel>
                </FormItem>
              )}
            />
          </div>
          {form.formState.errors.dataBaseline && (
            <p className='text-sm font-medium text-destructive'>
              {form.formState.errors.dataBaseline.message}
            </p>
          )}
        </div>

        <div className='space-y-6 pt-8 border-t'>
          <label className='text-lg font-bold block mb-4'>Statistical Analysis Plan</label>

          <div className='space-y-4'>
            <FormLabel>Statistical Analysis Types</FormLabel>
            <div className='grid md:grid-cols-2 gap-3'>
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
            render={({ field }) => {
              const wordCount = countWords(field.value || '');
              return (
                <FormItem>
                  <div className='flex justify-between items-center'>
                    <FormLabel>Detailed Statistical Analysis Plan *</FormLabel>
                    <span className='text-sm text-muted-foreground'>{wordCount} / 100 words</span>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='Describe the analyses planned for this study'
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

        <FormField
          control={form.control}
          name='adjustmentCovariates'
          render={({ field }) => {
            const wordCount = countWords(field.value || '');
            return (
              <FormItem>
                <div className='flex justify-between items-center'>
                  <FormLabel>Adjustment Covariates (Optional)</FormLabel>
                  <span className='text-sm text-muted-foreground'>{wordCount} / 50 words</span>
                </div>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='If multivariable analysis with adjustment is planned, list clinically relevant covariates'
                    rows={2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name='subgroupAnalyses'
          render={({ field }) => {
            const wordCount = countWords(field.value || '');
            return (
              <FormItem>
                <div className='flex justify-between items-center'>
                  <FormLabel>Subgroup Analyses (Optional)</FormLabel>
                  <span className='text-sm text-muted-foreground'>{wordCount} / 50 words</span>
                </div>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Describe subgroup analyses'
                    rows={2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        </div>

        <div className='space-y-6 pt-8 border-t'>
          <label className='text-lg font-bold block mb-4'>Potential Target Journals</label>

          <div className='grid grid-cols-3 gap-4'>
            {[0, 1, 2].map((index) => (
              <FormField
                key={index}
                control={form.control}
                name={`targetJournals.${index}` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Journal {index + 1} {index === 0 ? '*' : '(Optional)'}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder='Journal name' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
        </fieldset>

        {!readOnly && (
          <div className='flex gap-4 pt-4'>
            <Button
              type='button'
              size='lg'
              disabled={isExecuting}
              onClick={handleSubmitClick}
              className='flex-1'
            >
              <Send className='h-5 w-5 mr-2' />
              {createSubmitStatus === 'executing' || updateSubmitStatus === 'executing' ? 'Submitting...' : 'Submit Proposal'}
            </Button>
            <Button
              type='submit'
              size='lg'
              variant='secondary'
              disabled={isExecuting}
              className='flex-1'
            >
              <Save className='h-5 w-5 mr-2' />
              {createStatus === 'executing' || updateStatus === 'executing' ? 'Saving...' : isEditing ? 'Update Draft' : 'Save Draft'}
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
        )}
      </form>

      <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this proposal? Once submitted, you cannot modify it or submit another proposal for this submission window. This action is final.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitConfirmed}>
              Confirm Submission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
