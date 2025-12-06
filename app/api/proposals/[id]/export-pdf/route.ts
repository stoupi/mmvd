import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jsPDF from 'jspdf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        submissionWindow: true,
        centre: true,
        piUser: true,
        mainArea: true
      }
    });

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    if (proposal.status !== 'SUBMITTED') {
      return NextResponse.json({ error: 'Only submitted proposals can be exported' }, { status: 400 });
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    doc.setFontSize(10);
    doc.text(`Window: ${proposal.submissionWindow.name}`, 20, yPosition);
    yPosition += 7;

    doc.text(`Centre: ${proposal.centre?.code || 'N/A'} - ${proposal.centre?.name || 'N/A'}`, 20, yPosition);
    yPosition += 7;

    const investigatorName = `${proposal.piUser.firstName || ''} ${proposal.piUser.lastName || ''}`.trim() || 'N/A';
    doc.text(`Principal Investigator: ${investigatorName}`, 20, yPosition);
    yPosition += 7;

    if (proposal.submittedAt) {
      const submissionDate = new Date(proposal.submittedAt);
      const formattedDate = submissionDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = submissionDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Submitted on: ${formattedDate} at ${formattedTime}`, 20, yPosition);
      yPosition += 7;
    }

    doc.setLineWidth(0.5);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(proposal.title, 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const addSection = (title: string, content: string | string[] | null | undefined) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont(undefined, 'bold');
      doc.text(title, 20, yPosition);
      yPosition += 6;
      doc.setFont(undefined, 'normal');

      if (!content || (Array.isArray(content) && content.length === 0)) {
        doc.text('N/A', 20, yPosition);
        yPosition += 5;
      } else if (Array.isArray(content)) {
        content.forEach(item => {
          const lines = doc.splitTextToSize(`• ${item}`, pageWidth - 40);
          lines.forEach((line: string) => {
            if (yPosition > 280) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, 25, yPosition);
            yPosition += 5;
          });
        });
      } else {
        const lines = doc.splitTextToSize(content, pageWidth - 40);
        lines.forEach((line: string) => {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 5;
        });
      }
      yPosition += 3;
    };

    addSection('Main Topic', proposal.mainArea.label);
    addSection('Secondary Topics', proposal.secondaryTopics);
    addSection('Scientific Background', proposal.scientificBackground);
    addSection('Primary Objective', proposal.primaryObjective);
    addSection('Secondary Objectives', proposal.secondaryObjectives);
    addSection('Main Exposure', proposal.mainExposure);
    addSection('Primary Endpoint', proposal.primaryEndpoint);
    addSection('Secondary Endpoints', proposal.secondaryEndpoints);
    addSection('Study Population', proposal.studyPopulation);

    const dataTypes: string[] = [];
    if (proposal.dataBaseline) dataTypes.push('Baseline clinical data');
    if (proposal.dataBiological) dataTypes.push('Biological data');
    if (proposal.dataTTE) dataTypes.push('TTE imaging data');
    if (proposal.dataTOE) dataTypes.push('TOE imaging data');
    if (proposal.dataStressEcho) dataTypes.push('Stress echocardiography imaging data');
    if (proposal.dataCMR) dataTypes.push('CMR imaging data');
    if (proposal.dataCT) dataTypes.push('CT imaging data');
    if (proposal.dataRHC) dataTypes.push('Right heart catheterization data');
    if (proposal.dataHospitalFollowup) dataTypes.push('In-hospital follow-up data (all-cause death and CV death)');
    if (proposal.dataClinicalFollowup) dataTypes.push('Clinical follow-up data at 1 year');
    if (proposal.dataTTEFollowup) dataTypes.push('TTE follow-up data at 1 year (only if your institution is part of this option)');
    if (proposal.dataCoreLab) dataTypes.push('Core Lab–derived data (only if your institution is part of this option)');

    addSection('Data Requirements for This Ancillary Study', dataTypes);

    const analysisTypes: string[] = [];
    if (proposal.analysisTypes.includes('logistic')) analysisTypes.push('Logistic regression');
    if (proposal.analysisTypes.includes('cox')) analysisTypes.push('Cox regression');
    if (proposal.analysisTypes.includes('propensity')) analysisTypes.push('Propensity score matching');
    if (proposal.analysisTypes.includes('ml')) analysisTypes.push('Machine Learning');

    addSection('Statistical Analysis Types', analysisTypes);
    addSection('Detailed Statistical Analysis Plan', proposal.analysisDescription);
    addSection('Adjustment Covariates', proposal.adjustmentCovariates);
    addSection('Subgroup Analyses', proposal.subgroupAnalyses);
    addSection('Potential Target Journals', proposal.targetJournals);

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="proposal-${proposal.id}.pdf"`
      }
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
