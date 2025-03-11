
/**
 * Extract financial metrics from documents using regex patterns
 */
export async function extractFinancialMetrics(
  supabase: any,
  docId: number,
  docType: 'transcript' | 'filing'
): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase.rpc('extract_financial_metrics', {
      p_doc_id: docId,
      p_doc_type: docType
    });
    
    if (error) {
      console.error("Error extracting financial metrics:", error);
      return {};
    }
    
    return data || {};
  } catch (err) {
    console.error("Error in extractFinancialMetrics:", err);
    return {};
  }
}
