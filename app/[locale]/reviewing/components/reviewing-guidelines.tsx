'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Info } from 'lucide-react';

export function ReviewingGuidelines() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="guidelines" className="border rounded-lg px-4 bg-orange-50">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-orange-600" />
            <span className="font-semibold text-lg">
              Important Information to Read Before Reviewing
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 space-y-6">
          {/* Intro text */}
          <div className="text-sm leading-relaxed space-y-3">
            <p>Dear <strong>Reviewers as members of the Steering Committee</strong>,</p>
            <p>Thank you very much for your essential contribution to the ancillary study program of the EACVI-MMVD study.</p>
            <p>From the outset, it is important to highlight that this reviewing process <strong>is not designed to reject proposals</strong>. Its purpose is to <strong>strengthen, clarify, and enhance</strong> each submitted project so that it can successfully progress to a high-quality scientific manuscript and ultimately reach publication.</p>
            <p>As a reviewer, your expertise is crucial. For each ancillary study you support and help shape, <strong>you will be included as a co-author (middle position)</strong> in recognition of your contribution to improving the scientific quality of the work. Your involvement is therefore expected not only during this initial evaluation stage but also later during the <strong>full review of the final manuscript</strong> before submission.</p>
            <p>As a member of the Steering Committee with deep expertise in valvular heart disease research, you are uniquely positioned to identify what constitutes a strong, publishable project. Your role also includes guiding and orienting authors, when needed, on the <strong>most appropriate journals</strong> and potential publication strategies.</p>
            <p>Please evaluate each proposal according to the criteria below, always with a constructive, supportive mindset.</p>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base">
              1. Clarity and relevance of the research question
            </h3>
            <div className="text-sm text-gray-700 pl-4 space-y-1">
              <p>- Assess whether the main hypothesis is clearly stated, clinically meaningful, and aligned with the aims of the EACVI-MMVD study.</p>
              <p>- Ensure that the topic is sufficiently original and not duplicating an existing ancillary study.</p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base">
              2. Strength and coherence of the study design
            </h3>
            <div className="text-sm text-gray-700 pl-4 space-y-1">
              <p>- Evaluate whether the study methodology appropriately addresses the stated aim.</p>
              <p>- Check that the target population, variables, endpoints, and analytic approach are coherent and feasible.</p>
              <p>- Highlight areas requiring clarification or improvement.</p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base">
              3. Feasibility based on the available data
            </h3>
            <div className="text-sm text-gray-700 pl-4">
              <p>- Determine whether the proposal is compatible with the structure, variables of the databases and numbers of patients in the subgroup of interest.</p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base">
              4. Statistical considerations +++ (key-point)
            </h3>
            <div className="text-sm text-gray-700 pl-4 space-y-1">
              <p>- Identify missing elements, inconsistencies, or statistical challenges.</p>
              <p>- Recommend clarifications, additional covariates, or refinements where appropriate.</p>
              <p>- The final statistical plan will be built collaboratively with the Lariboisiere Hospital biostatistics team.</p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base">
              5. Risk of overlap with existing proposals
            </h3>
            <div className="text-sm text-gray-700 pl-4 space-y-1">
              <p>- Indicate clearly if the proposed project overlaps with another ongoing or previously submitted ancillary study.</p>
              <p>- Suggest ways to refocus or differentiate the proposal if needed.</p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base">
              6. Expected scientific value and publication potential
            </h3>
            <div className="text-sm text-gray-700 pl-4">
              <p>- Provide your assessment of the study's originality, contribution to the field, and likelihood of yielding a publishable manuscript.</p>
            </div>
          </div>

          {/* Section 7 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base">
              7. Final reviewer recommendation
            </h3>
            <div className="text-sm text-gray-700 pl-4 space-y-1">
              <p>- At the end of your evaluation, please select one of the following outcomes:</p>
              <p className="pl-4">o The proposal can be accepted as submitted.</p>
              <p className="pl-4">o The proposal should be accepted pending minor revisions.</p>
              <p className="pl-4">o The proposal requires substantial modifications.</p>
              <p className="pl-4">o The proposal must be rejected to avoid overlap.</p>
            </div>
          </div>

          {/* Conclusion */}
          <div className="text-sm leading-relaxed space-y-3 pt-2">
            <p>Once again, we thank you sincerely for your time, expertise, and engagement. Your contribution is critical to ensuring that each ancillary study reaches its full potential and leads to impactful scientific publications.</p>
            <p>Your support, guidance, and constructive input are deeply appreciated.</p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
