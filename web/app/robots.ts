import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/private/'],
      },
      // AI crawlers - explicit allow for context files
      {
        userAgent: 'GPTBot',
        allow: ['/llms.txt', '/api/ai-context', '/.well-known/ai.txt'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/llms.txt', '/api/ai-context', '/.well-known/ai.txt'],
      },
      {
        userAgent: 'Claude-Web',
        allow: ['/llms.txt', '/api/ai-context', '/.well-known/ai.txt'],
      },
      {
        userAgent: 'Anthropic-AI',
        allow: ['/llms.txt', '/api/ai-context', '/.well-known/ai.txt'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/llms.txt', '/api/ai-context', '/.well-known/ai.txt'],
      },
      {
        userAgent: 'Amazonbot',
        allow: ['/llms.txt', '/api/ai-context', '/.well-known/ai.txt'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
