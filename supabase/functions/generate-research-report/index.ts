
import { corsHeaders } from '../_shared/cors.ts';
import { OPENAI_API_KEY } from '../_shared/constants.ts';
import { formatDataForAnalysis } from '../_shared/report-utils/dataFormatter.ts';
import { generateReportWithOpenAI } from '../_shared/report-utils/openAIGenerator.ts';
import { 
  createDefaultSections, 
  enhanceSectionContent, 
  ensureCompleteReportStructure 
} from '../_shared/report-utils/fallbackReportGenerator.ts';

// Add proper error handling and logging
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Research report generation function called");
    
    const { reportRequest } = await req.json();
    
    if (!reportRequest || !reportRequest.symbol) {
      console.error("Missing required parameters in request");
      throw new Error('Missing required parameters: symbol is required');
    }
    
    console.log(`Generating AI research report for ${reportRequest.symbol} (type: ${reportRequest.reportType || 'standard'})`);
    
    // Get data ready for OpenAI
    const formattedData = formatDataForAnalysis(reportRequest);
    
    // Generate report using OpenAI
    console.log("Sending data to OpenAI for processing");
    const report = await generateReportWithOpenAI(formattedData, reportRequest, OPENAI_API_KEY);
    
    // Make sure we have sections before returning
    if (!report.sections || report.sections.length === 0) {
      console.warn("No sections returned from OpenAI, adding default sections");
      report.sections = createDefaultSections(formattedData);
    }
    
    // Validate all sections have sufficient content
    report.sections = report.sections.map(section => {
      // Different minimum content length requirements for different section types
      let minLength = 300;
      
      if (section.title.toLowerCase().includes('financial')) {
        minLength = 1000; // Financial sections need more detail
      } else if (
        section.title.toLowerCase().includes('risk') || 
        section.title.toLowerCase().includes('valuation') ||
        section.title.toLowerCase().includes('thesis') ||
        section.title.toLowerCase().includes('esg')
      ) {
        minLength = 600; // Other important analysis sections need substantial detail
      }
      
      if (!section.content || section.content.length < minLength) {
        console.warn(`Section ${section.title} has insufficient content (${section.content?.length || 0} chars), enhancing it to meet ${minLength} char minimum`);
        section.content = enhanceSectionContent(section.title, formattedData, 
          section.title.toLowerCase().includes('financial')); // Pass true for extra detail on financial sections
      }
      
      return section;
    });
    
    // Check for required sections and add them if missing
    const requiredSections = [
      'Financial Analysis', 
      'Valuation', 
      'Risk Factors', 
      'ESG Considerations',
      'Investment Thesis',
      'Business Overview'
    ];
    
    for (const sectionTitle of requiredSections) {
      const hasSection = report.sections.some(section => 
        section.title.toLowerCase().includes(sectionTitle.toLowerCase())
      );
      
      if (!hasSection) {
        console.log(`Adding missing required section: ${sectionTitle}`);
        // Add the section in an appropriate position
        const insertPosition = determineInsertPosition(report.sections, sectionTitle);
        report.sections.splice(insertPosition, 0, {
          title: sectionTitle,
          content: enhanceSectionContent(sectionTitle, formattedData, 
            sectionTitle.toLowerCase().includes('financial'))
        });
      }
    }
    
    // Log the sections we're returning
    console.log(`Returning report with ${report.sections.length} sections: ${report.sections.map(s => s.title).join(', ')}`);
    
    // Ensure we have all required report details
    ensureCompleteReportStructure(report, formattedData);
    
    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Error generating research report:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Helper function to determine the best insert position for a new section
function determineInsertPosition(sections: Array<{title: string, content: string}>, newSectionTitle: string): number {
  // Ideal sequence of sections (partial)
  const idealSequence = [
    'Executive Summary',
    'Investment Thesis',
    'Business Overview',
    'Financial Analysis',
    'Valuation',
    'Risk Factors',
    'ESG Considerations',
    'Rating and Recommendation'
  ];
  
  const targetIndex = idealSequence.findIndex(title => 
    title.toLowerCase() === newSectionTitle.toLowerCase());
  
  if (targetIndex === -1) {
    // If not in ideal sequence, add near the end but before rating/recommendation
    const ratingIndex = sections.findIndex(s => 
      s.title.toLowerCase().includes('rating') || 
      s.title.toLowerCase().includes('recommendation'));
    
    return ratingIndex !== -1 ? ratingIndex : sections.length;
  }
  
  // Find the first section that should come after the new section
  for (let i = targetIndex + 1; i < idealSequence.length; i++) {
    const afterSectionIndex = sections.findIndex(s => 
      s.title.toLowerCase().includes(idealSequence[i].toLowerCase()));
    
    if (afterSectionIndex !== -1) {
      return afterSectionIndex;
    }
  }
  
  // Find the last section that should come before the new section
  for (let i = targetIndex - 1; i >= 0; i--) {
    const beforeSectionIndex = sections.findIndex(s => 
      s.title.toLowerCase().includes(idealSequence[i].toLowerCase()));
    
    if (beforeSectionIndex !== -1) {
      return beforeSectionIndex + 1;
    }
  }
  
  // Default to adding at the end before any rating section
  const ratingIndex = sections.findIndex(s => 
    s.title.toLowerCase().includes('rating') || 
    s.title.toLowerCase().includes('recommendation'));
  
  return ratingIndex !== -1 ? ratingIndex : sections.length;
}
