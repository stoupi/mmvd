'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function CriteriaAccordion() {
  return (
    <div className='space-y-4'>
      {/* Inclusion Criteria */}
      <Accordion type='single' collapsible className='w-full'>
        <AccordionItem value='inclusion' className='border-none'>
          <AccordionTrigger className='bg-primary text-white p-4 rounded-lg hover:bg-primary/90 data-[state=open]:rounded-b-none [&>svg]:text-white'>
            <h4 className='font-semibold text-sm'>Inclusion criteria</h4>
          </AccordionTrigger>
          <AccordionContent className='bg-primary text-white px-4 pt-3 pb-4 rounded-b-lg'>
            <ol className='list-decimal list-inside space-y-1.5 text-sm'>
              <li>Age ≥ 18 years</li>
              <li>Patient referred to the cardiovascular imaging department.</li>
              <li>
                Diagnosis of MMVD confirmed by transthoracic echocardiography, defined as:
                <ul className='list-disc ml-8 mt-1.5 space-y-1'>
                  <li><strong>Multiple valvular heart disease (VHD):</strong> at least 2 moderates to severe VHD involving ≥ 2 different valves, using the current ESC guidelines.</li>
                  <li className='ml-4 list-none'>and/or</li>
                  <li><strong>Mixed valvular heart disease (VHD):</strong> at least moderate stenosis and at least moderate regurgitation of a single valve, using the current ESC guidelines.</li>
                </ul>
              </li>
              <li>Patient not refusing to have their data involved in the protocol after information.</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Exclusion Criteria */}
      <Accordion type='single' collapsible className='w-full'>
        <AccordionItem value='exclusion' className='border-none'>
          <AccordionTrigger className='bg-primary text-white p-4 rounded-lg hover:bg-primary/90 data-[state=open]:rounded-b-none [&>svg]:text-white'>
            <h4 className='font-semibold text-sm'>Exclusion criteria</h4>
          </AccordionTrigger>
          <AccordionContent className='bg-primary text-white px-4 pt-3 pb-4 rounded-b-lg'>
            <ol className='list-decimal list-inside space-y-1.5 text-sm'>
              <li>History of prior valve surgery or percutaneous valve intervention (concerning a valve other than those involved in the definition of MMVD).</li>
              <li>Acute infective endocarditis at the time of evaluation for inclusion (confirmed according to modified Duke criteria) or history of endocarditis ≤ 6 months.</li>
              <li>Complex congenital heart diseases.</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
