
import { corsHeaders } from '../_shared/cors.ts';
import { API_BASE_URLS, OPENAI_MODELS, OPENAI_API_KEY } from '../_shared/constants.ts';
import { formatDataForAnalysis } from '../_shared/report-utils/dataFormatter.ts';
import { generateReportWithOpenAI } from '../_shared/report-utils/openAIGenerator.ts';
import { 
  createDefaultSections, 
  enhanceSectionContent, 
  ensureCompleteReportStructure 
} from '../_shared/report-utils/fallbackReportGenerator.ts';
import { ResearchReport } from '../_shared/report-utils/reportTypes.ts';

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const openAIApiKey = Deno.env.get("OPENAI_API_KEY") || "";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { reportRequest } = await req.json();
    
    if (!reportRequest || !reportRequest.symbol) {
      throw new Error('Missing required parameters');
    }
    
    console.log(`Generating AI research report for ${reportRequest.symbol} (type: ${reportRequest.reportType || 'standard'})`);
    
    // Get data ready for OpenAI
    const formattedData = formatDataForAnalysis(reportRequest);
    
    // Generate report using OpenAI
    const report = await generateReportWithOpenAI(formattedData, reportRequest, openAIApiKey);
    
    // Make sure we have sections before returning
    if (!report.sections || report.sections.length === 0) {
      console.warn("No sections returned from OpenAI, adding default sections");
      report.sections = createDefaultSections(formattedData);
    }
    
    // Validate sections have sufficient content
    report.sections = report.sections.map(section => {
      if (!section.content || section.content.length < 100) {
        console.warn(`Section ${section.title} has insufficient content, enhancing it`);
        section.content = enhanceSectionContent(section.title, formattedData);
      }
      return section;
    });
    
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
