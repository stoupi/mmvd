'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';

export function SubmissionGuidelines() {
  const t = useTranslations('submission.guidelines');

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="guidelines" className="border rounded-lg px-4 bg-orange-50">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-orange-600" />
            <span className="font-semibold text-lg">
              {t('title')}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 space-y-6">
          {/* Intro text */}
          <div className="text-sm leading-relaxed whitespace-pre-line">
            {t.rich('intro', {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </div>

          {/* 11 sections */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => (
            <div key={num} className="space-y-2">
              <h3 className="font-semibold text-base">
                {num}. {t(`section${num}.title`)}
              </h3>
              <div className="text-sm text-gray-700 whitespace-pre-line pl-4">
                {t.rich(`section${num}.content`, {
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
