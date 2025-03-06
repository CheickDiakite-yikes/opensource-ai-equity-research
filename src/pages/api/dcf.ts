
import { NextApiRequest, NextApiResponse } from 'next';
import { invokeSupabaseFunction } from '@/services/api/base';

// This is an API route that proxies DCF calculation requests to the Supabase edge function
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbol, ...params } = req.query;

    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    // Call the Supabase edge function with the parameters
    const result = await invokeSupabaseFunction('get-custom-dcf', {
      symbol,
      params,
      type: 'advanced'
    });

    // Return the result
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in DCF API route:', error);
    return res.status(500).json({ 
      error: 'Failed to calculate DCF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
