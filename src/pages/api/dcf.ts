
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbol, type = 'advanced', ...params } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('get-custom-dcf', {
      body: {
        symbol,
        type,
        params
      }
    });

    if (error) {
      console.error('DCF calculation error:', error);
      return res.status(500).json({ 
        error: 'Error calculating DCF',
        details: error.message
      });
    }

    // Check if headers include mock data flag
    const headers: Record<string, string> = {};
    if (data && data.mockData) {
      headers['X-Mock-Data'] = 'true';
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Unexpected error:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}
