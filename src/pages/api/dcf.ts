
import { supabase } from '@/integrations/supabase/client';

// This is a placeholder API handler for potential future use with Express or similar
// Currently not being used in the Vite application

interface RequestData {
  method: string;
  query: {
    symbol?: string;
    type?: string;
    [key: string]: any;
  };
}

interface ResponseData {
  status: (code: number) => ResponseData;
  json: (data: any) => void;
}

export default async function handler(req: RequestData, res: ResponseData) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbol, type = 'standard', ...params } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    // Call the Supabase edge function
    const { data, error } = await supabase.functions.invoke('get-custom-dcf', {
      body: { 
        symbol, 
        type,
        params
      }
    });

    if (error) {
      console.error('Error calling get-custom-dcf function:', error);
      return res.status(500).json({ error: error.message });
    }

    // Return the DCF data
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error in DCF API:', err);
    return res.status(500).json({ 
      error: err instanceof Error ? err.message : 'Unknown error occurred' 
    });
  }
}
