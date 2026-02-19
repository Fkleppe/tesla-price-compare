import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/private/', '/borser/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'Claude-Web', 'Anthropic-AI', 'PerplexityBot', 'Amazonbot'],
        allow: ['/llms.txt', '/api/ai-context', '/.well-known/ai.txt'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
