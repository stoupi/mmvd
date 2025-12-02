'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { proposalFormSchema, type ProposalFormData } from '@/lib/schemas/proposal';
import { useAction } from 'next-safe-action/hooks';
import { createProposalAction, updateProposalAction } from '@/lib/actions/proposal-actions';
import { useRouter } from '@/app/i18n/navigation';
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MainArea } from '@/app/generated/prisma';
import { Save } from 'lucide-react';

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

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: initialData || {
      title: '',
      mainAreaId: '',
      background: '',
      objectives: '',
      methods: '',
      statisticalAnalysis: '',
      expectedImpact: '',
      references: '',
      nPatients: undefined,
      statisticianName: ''
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
          name='mainAreaId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Main Area *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a main area' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mainAreas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.label} {proposalCounts[area.id] ? `(${proposalCounts[area.id]})` : ''}
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
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input {...field} placeholder='Enter proposal title' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='background'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder='Describe the background and rationale'
                  rows={6}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='objectives'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objectives *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder='State the research objectives'
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='methods'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Methods *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder='Describe the methodology'
                  rows={6}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='statisticalAnalysis'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statistical Analysis *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder='Describe the statistical analysis plan'
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='expectedImpact'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Impact (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder='Describe the expected impact'
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='references'
          render={({ field }) => (
            <FormItem>
              <FormLabel>References (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder='List key references'
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='nPatients'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Patients (Optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type='number'
                    placeholder='e.g. 100'
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='statisticianName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statistician Name (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Name of statistician' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
