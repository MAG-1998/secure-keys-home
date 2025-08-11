import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    OPENAI_API_KEY_present: Boolean(process.env.OPENAI_API_KEY),
  });
}
