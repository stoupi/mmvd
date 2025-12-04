'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import { saveAs } from 'file-saver';

interface ProposalData {
  title: string;
  centreCode: string;
  piName: string;
  piEmail: string;
  affiliation?: string;
  submissionWindow: string;
  mainTopic: string;
  secondaryTopics: string[];
  scientificBackground: string;
  literaturePosition?: string;
  competingWork: any[];
  primaryObjective: string;
  secondaryObjectives: string[];
  mainExposure: string;
  primaryEndpoint: string;
  secondaryEndpoints: string[];
  studyPopulation: string;
  inclusionCriteria?: string;
  exclusionCriteria?: string;
  dataBaseline: string[];
  dataBiological: string[];
  dataTTE: string[];
  dataTOE: string[];
  dataStressEcho: string[];
  dataCMR: string[];
  dataCT: string[];
  dataRHC: string[];
  dataHospitalFollowup: string[];
  dataClinicalFollowup: string[];
  dataTTEFollowup: string[];
  dataCoreLab: string[];
  analysisTypes: string[];
  analysisDescription?: string;
  adjustmentCovariates?: string;
  subgroupAnalyses?: string;
  targetJournals: string[];
  submittedAt?: Date | null;
}

export function ExportProposalButton({ proposal }: { proposal: ProposalData }) {
  const handleExport = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: proposal.title,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),

            // Metadata section
            new Paragraph({
              text: 'Proposal Information',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Centre Code: ', bold: true }),
                new TextRun(proposal.centreCode)
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Principal Investigator: ', bold: true }),
                new TextRun(proposal.piName)
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Email: ', bold: true }),
                new TextRun(proposal.piEmail)
              ]
            }),
            ...(proposal.affiliation
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Affiliation: ', bold: true }),
                      new TextRun(proposal.affiliation)
                    ]
                  })
                ]
              : []),
            new Paragraph({
              children: [
                new TextRun({ text: 'Submission Window: ', bold: true }),
                new TextRun(proposal.submissionWindow)
              ]
            }),
            ...(proposal.submittedAt
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Submitted: ', bold: true }),
                      new TextRun(new Date(proposal.submittedAt).toLocaleDateString())
                    ]
                  })
                ]
              : []),

            // Topics
            new Paragraph({
              text: 'Research Topics',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Main Topic: ', bold: true }),
                new TextRun(proposal.mainTopic)
              ]
            }),
            ...(proposal.secondaryTopics.length > 0
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Secondary Topics: ', bold: true }),
                      new TextRun(proposal.secondaryTopics.join(', '))
                    ]
                  })
                ]
              : []),

            // Scientific Background
            new Paragraph({
              text: 'Scientific Background',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({ text: proposal.scientificBackground }),

            ...(proposal.literaturePosition
              ? [
                  new Paragraph({
                    text: 'Position in Literature',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 300, after: 200 }
                  }),
                  new Paragraph({ text: proposal.literaturePosition })
                ]
              : []),

            // Objectives
            new Paragraph({
              text: 'Study Objectives',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Primary Objective: ', bold: true }),
                new TextRun(proposal.primaryObjective)
              ]
            }),
            ...(proposal.secondaryObjectives.length > 0
              ? [
                  new Paragraph({
                    text: 'Secondary Objectives:',
                    bold: true,
                    spacing: { before: 200 }
                  }),
                  ...proposal.secondaryObjectives.map(
                    (obj) => new Paragraph({ text: `• ${obj}`, spacing: { before: 100 } })
                  )
                ]
              : []),

            // Exposure and Endpoints
            new Paragraph({
              text: 'Exposure and Endpoints',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Main Exposure: ', bold: true }),
                new TextRun(proposal.mainExposure)
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Primary Endpoint: ', bold: true }),
                new TextRun(proposal.primaryEndpoint)
              ]
            }),
            ...(proposal.secondaryEndpoints.length > 0
              ? [
                  new Paragraph({
                    text: 'Secondary Endpoints:',
                    bold: true,
                    spacing: { before: 200 }
                  }),
                  ...proposal.secondaryEndpoints.map(
                    (ep) => new Paragraph({ text: `• ${ep}`, spacing: { before: 100 } })
                  )
                ]
              : []),

            // Study Population
            new Paragraph({
              text: 'Study Population',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({ text: proposal.studyPopulation }),

            ...(proposal.inclusionCriteria
              ? [
                  new Paragraph({
                    text: 'Inclusion Criteria',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 300, after: 200 }
                  }),
                  new Paragraph({ text: proposal.inclusionCriteria })
                ]
              : []),

            ...(proposal.exclusionCriteria
              ? [
                  new Paragraph({
                    text: 'Exclusion Criteria',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 300, after: 200 }
                  }),
                  new Paragraph({ text: proposal.exclusionCriteria })
                ]
              : []),

            // Statistical Analysis
            new Paragraph({
              text: 'Statistical Analysis',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Analysis Types: ', bold: true }),
                new TextRun(proposal.analysisTypes.join(', '))
              ]
            }),
            ...(proposal.analysisDescription
              ? [
                  new Paragraph({
                    text: 'Analysis Description',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 300, after: 200 }
                  }),
                  new Paragraph({ text: proposal.analysisDescription })
                ]
              : []),

            // Target Journals
            new Paragraph({
              text: 'Target Journals',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...proposal.targetJournals
              .filter((j) => j)
              .map((journal) => new Paragraph({ text: `• ${journal}`, spacing: { before: 100 } }))
          ]
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `${proposal.centreCode}_${proposal.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.docx`;
    saveAs(blob, fileName);
  };

  return (
    <Button onClick={handleExport} variant='outline'>
      <Download className='h-4 w-4 mr-2' />
      Export to Word
    </Button>
  );
}
