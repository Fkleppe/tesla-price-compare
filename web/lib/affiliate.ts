// Affiliate partner configuration
// Each partner has: domain patterns, ref parameter, and discount code

interface AffiliatePartner {
  name: string;
  domains: string[];
  refParam: string;
  refValue: string;
  discountCode: string;
  discountPercent: number;
}

export const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  {
    name: 'Tesery',
    domains: ['tesery.com'],
    refParam: 'ref',
    refValue: 'Discount',
    discountCode: '123',
    discountPercent: 5,
  },
  {
    name: 'Jowua',
    domains: ['jowua-life.com'],
    refParam: 'ghref',
    refValue: '5866:1281369',
    discountCode: 'AWD',
    discountPercent: 5,
  },
  {
    name: 'Shop4Tesla',
    domains: ['shop4tesla.com'],
    refParam: 'ref',
    refValue: 'discount',
    discountCode: '10',
    discountPercent: 10,
  },
  {
    name: 'Snuuzu EU',
    domains: ['www.snuuzu.com', 'snuuzu.com'],
    refParam: 'bg_ref',
    refValue: 's7fluA5re6',
    discountCode: 'KLEPPE',
    discountPercent: 10,
  },
  {
    name: 'Snuuzu US',
    domains: ['us.snuuzu.com'],
    refParam: 'bg_ref',
    refValue: 'QBfsWJtiUJ',
    discountCode: 'KLEPPE',
    discountPercent: 10,
  },
  {
    name: 'Havnby',
    domains: ['havnby.com'],
    refParam: 'ref',
    refValue: 'discount',
    discountCode: 'AWD',
    discountPercent: 10,
  },
  {
    name: 'Yeslak',
    domains: ['yeslak.com'],
    refParam: 'ref',
    refValue: 'discount',
    discountCode: 'discount',
    discountPercent: 20,
  },
  {
    name: 'Hansshow',
    domains: ['hansshow.com', 'hautopart.com'],
    refParam: 'bg_ref',
    refValue: '2LQHuVf8dv',
    discountCode: 'FREDRIK',
    discountPercent: 20,
  },
];

// Get affiliate partner by URL
export function getAffiliatePartner(url: string): AffiliatePartner | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    for (const partner of AFFILIATE_PARTNERS) {
      if (partner.domains.some(domain => hostname.includes(domain))) {
        return partner;
      }
    }
  } catch {
    // Invalid URL
  }
  return null;
}

// Convert URL to affiliate URL
export function getAffiliateUrl(url: string): string {
  const partner = getAffiliatePartner(url);
  if (!partner) return url;

  try {
    const urlObj = new URL(url);

    // Special handling for Jowua - also add discount param
    if (partner.name === 'Jowua') {
      urlObj.searchParams.set('ghref', partner.refValue);
      urlObj.searchParams.set('discount', partner.discountCode);
    } else {
      urlObj.searchParams.set(partner.refParam, partner.refValue);
    }

    return urlObj.toString();
  } catch {
    return url;
  }
}

// Get discount info for display
export function getDiscountInfo(url: string): { code: string; percent: number; partnerName: string } | null {
  const partner = getAffiliatePartner(url);
  if (!partner) return null;

  return {
    code: partner.discountCode,
    percent: partner.discountPercent,
    partnerName: partner.name,
  };
}

// Check if URL is from an affiliate partner
export function isAffiliatePartner(url: string): boolean {
  return getAffiliatePartner(url) !== null;
}

// Get all partner domain patterns for filtering
export function getPartnerDomains(): string[] {
  return AFFILIATE_PARTNERS.flatMap(p => p.domains);
}
