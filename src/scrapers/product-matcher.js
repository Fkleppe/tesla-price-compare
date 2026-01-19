import stringSimilarity from 'string-similarity';

// Known brands that sell across multiple stores
const MULTI_STORE_BRANDS = [
  '3d maxpider', 'maxpider',
  'jowua',
  'ohmmu',
  'abstract ocean',
  'tesbros', 'col-tesbros',
  'twraps', 'col-twraps',
  'maier',
  'alpharex',
  'alloygator',
  'xpel',
  'weathertech',
  'adro',
  'unplugged performance',
  'lamin-x',
  'powerstop',
  'brembo',
  'eibach',
  // Additional brands
  'tesmanian',
  'topfit',
  'basenor',
  'aroham',
  'farasla',
  'lfotpp',
  'bmzx',
  'kenriko',
  'screen pro',
  'spigen',
  'nillkin',
  'carwiner',
  'sumk',
  'yztree',
  'yeslak',
  'taptes',
  'tesery',
  'turoaz',
  'ttcr-ii',
  'xtauto',
  'motrobe',
  'eeieer',
  'vihimai',
  'cdefg',
  'tempered glass',
  'matte screen',
  'glossy screen',
];

// Normalize vendor name for comparison
function normalizeVendor(vendor) {
  if (!vendor) return '';
  return vendor
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/official store/g, '')
    .replace(/store/g, '')
    .replace(/^col-/, '')
    .trim();
}

// Check if vendor is a known multi-store brand
function isMultiStoreBrand(vendor) {
  const normalized = normalizeVendor(vendor);
  return MULTI_STORE_BRANDS.some(brand => normalized.includes(brand));
}

// Extract brand from title if vendor is empty
function extractBrandFromTitle(title) {
  const lowerTitle = title.toLowerCase();
  for (const brand of MULTI_STORE_BRANDS) {
    if (lowerTitle.includes(brand)) {
      return brand;
    }
  }
  return '';
}

// Normalize product title for comparison
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\b(for|the|and|with|set|of|to|in|on|a|an)\b/g, '')
    .replace(/model\s*3/g, 'model3')
    .replace(/model\s*y/g, 'modely')
    .replace(/model\s*s/g, 'models')
    .replace(/model\s*x/g, 'modelx')
    .replace(/cyber\s*truck/g, 'cybertruck')
    .replace(/all[\s-]*weather/g, 'allweather')
    .replace(/floor[\s-]*mat/g, 'floormat')
    .replace(/floor[\s-]*liner/g, 'floormat')
    .replace(/screen[\s-]*protector/g, 'screenprotector')
    .replace(/center[\s-]*console/g, 'centerconsole')
    .replace(/mud[\s-]*flap/g, 'mudflap')
    .replace(/splash[\s-]*guard/g, 'mudflap')
    .replace(/sun[\s-]*shade/g, 'sunshade')
    .replace(/cargo[\s-]*mat/g, 'cargomat')
    .replace(/cargo[\s-]*liner/g, 'cargomat')
    .replace(/trunk[\s-]*mat/g, 'cargomat')
    .replace(/trunk[\s-]*liner/g, 'cargomat')
    .replace(/wheel[\s-]*cover/g, 'wheelcover')
    .replace(/hub[\s-]*cap/g, 'wheelcover')
    .replace(/12v/g, '12volt')
    .replace(/\s+/g, ' ')
    .trim();
}

// Detect specific body part for PPF products
function detectPPFPart(title) {
  const lower = title.toLowerCase();

  // Specific parts - order matters (more specific first)
  if (lower.includes('headlight') || lower.includes('head light')) return 'headlight';
  if (lower.includes('taillight') || lower.includes('tail light') || lower.includes('rear light')) return 'taillight';
  if (lower.includes('lightbar') || lower.includes('light bar')) return 'lightbar';
  if (lower.includes('fog light') || lower.includes('foglight')) return 'foglight';
  if (lower.includes('door sill')) return 'doorsill';
  if (lower.includes('door edge')) return 'dooredge';
  if (lower.includes('door handle')) return 'doorhandle';
  if (lower.includes('side mirror') || lower.includes('mirror')) return 'mirror';
  if (lower.includes('a pillar') || lower.includes('pillar')) return 'pillar';
  if (lower.includes('rocker') || lower.includes('side skirt')) return 'rocker';
  if (lower.includes('hood')) return 'hood';
  if (lower.includes('roof')) return 'roof';
  if (lower.includes('trunk') || lower.includes('tailgate')) return 'trunk';
  if (lower.includes('bumper')) return 'bumper';
  if (lower.includes('fender')) return 'fender';
  if (lower.includes('frunk')) return 'frunk';
  if (lower.includes('wheel well') || lower.includes('wheel arch')) return 'wheelarch';

  // Coverage types
  if (lower.includes('full body') || lower.includes('complete') || lower.includes('full kit')) return 'fullbody';
  if (lower.includes('interior')) return 'interior';
  if (lower.includes('exterior')) return 'exterior';
  if (lower.includes('front') && !lower.includes('rear')) return 'front';
  if (lower.includes('rear') && !lower.includes('front')) return 'rear';
  if (lower.includes('side')) return 'side';

  return 'generic';
}

// Detect specific part type for body kit products
function detectBodyKitPart(title) {
  const lower = title.toLowerCase();

  if (lower.includes('side skirt')) return 'sideskirt';
  if (lower.includes('front spoiler') || lower.includes('front lip')) return 'frontspoiler';
  if (lower.includes('rear spoiler') || lower.includes('trunk spoiler')) return 'rearspoiler';
  if (lower.includes('diffuser') || lower.includes('rear diffuser')) return 'diffuser';
  if (lower.includes('wing')) return 'wing';
  if (lower.includes('splitter')) return 'splitter';
  if (lower.includes('canard')) return 'canard';

  // Generic spoiler - check position
  if (lower.includes('spoiler')) {
    if (lower.includes('front')) return 'frontspoiler';
    if (lower.includes('rear') || lower.includes('trunk')) return 'rearspoiler';
    return 'spoiler-unknown';
  }

  return 'generic';
}

// Extract key product identifiers
function extractProductSignature(product) {
  const title = product.title;
  const normalized = normalizeTitle(title);
  const words = normalized.split(' ').filter(w => w.length > 2);

  // Detect Tesla model
  let model = 'universal';
  if (normalized.includes('model3') || normalized.includes('m3')) model = 'model3';
  else if (normalized.includes('modely') || normalized.includes('my')) model = 'modely';
  else if (normalized.includes('models') || normalized.includes('ms')) model = 'models';
  else if (normalized.includes('modelx') || normalized.includes('mx')) model = 'modelx';
  else if (normalized.includes('cybertruck') || normalized.includes('ct')) model = 'cybertruck';

  // Check for car variants (Highland, Juniper, Pre-refresh, Plaid, etc.)
  let variant = '';
  if (normalized.includes('highland')) variant = 'highland';
  else if (normalized.includes('juniper')) variant = 'juniper';
  else if (normalized.includes('pre refresh') || normalized.includes('prerefresh') || normalized.includes('pre-refresh')) variant = 'prerefresh';
  else if (normalized.includes('plaid')) variant = 'plaid';
  else if (normalized.includes('refresh') && !normalized.includes('pre')) variant = 'refresh';
  else if (normalized.includes('2021') || normalized.includes('2022') || normalized.includes('2023') || normalized.includes('2024') || normalized.includes('2025')) {
    // Try to detect year-based variants
    if (model === 'models' || model === 'modelx') {
      if (normalized.includes('2021') || normalized.includes('2022') || normalized.includes('2023') || normalized.includes('2024') || normalized.includes('2025')) {
        variant = 'refresh'; // 2021+ Model S/X are refresh
      }
    }
  }

  // Detect product type with more specificity
  let productType = 'other';
  let subType = '';

  // PPF products - need sub-type for part
  if (normalized.includes('ppf') || normalized.includes('protection film') ||
      (normalized.includes('protection') && normalized.includes('film'))) {
    productType = 'ppf';
    subType = detectPPFPart(title);
  }
  // Body kit parts
  else if (normalized.includes('spoiler') || normalized.includes('diffuser') ||
           normalized.includes('side skirt') || normalized.includes('lip')) {
    productType = 'bodykit';
    subType = detectBodyKitPart(title);
  }
  // Floor mats
  else if (normalized.includes('floormat')) {
    productType = 'floormat';
    // Detect mat coverage
    if (normalized.includes('full') || normalized.includes('complete')) subType = 'fullset';
    else if (normalized.includes('front') && !normalized.includes('rear')) subType = 'front';
    else if (normalized.includes('rear') && !normalized.includes('front')) subType = 'rear';
    else if (normalized.includes('cargo') || normalized.includes('trunk')) subType = 'cargo';
  }
  else if (normalized.includes('cargomat')) productType = 'cargomat';
  else if (normalized.includes('screenprotector')) productType = 'screenprotector';
  else if (normalized.includes('centerconsole')) productType = 'centerconsole';
  else if (normalized.includes('mudflap')) productType = 'mudflap';
  else if (normalized.includes('sunshade')) productType = 'sunshade';
  else if (normalized.includes('wheelcover')) productType = 'wheelcover';
  else if (normalized.includes('charger') || normalized.includes('charging')) productType = 'charger';
  else if (normalized.includes('seat cover')) productType = 'seatcover';
  else if (normalized.includes('wrap') || normalized.includes('vinyl')) {
    productType = 'wrap';
    // Detect wrap part
    if (normalized.includes('steering')) subType = 'steering';
    else if (normalized.includes('door')) subType = 'door';
    else if (normalized.includes('console')) subType = 'console';
  }
  else if (normalized.includes('frunk')) productType = 'frunk';
  else if (normalized.includes('roof rack') || normalized.includes('crossbar')) productType = 'roofrack';
  else if (normalized.includes('phone') && (normalized.includes('mount') || normalized.includes('holder'))) productType = 'phonemount';
  else if (normalized.includes('pedal')) productType = 'pedal';
  else if (normalized.includes('mirror')) productType = 'mirror';
  else if (normalized.includes('ambient') || normalized.includes('led light')) productType = 'ambient';
  else if (normalized.includes('organizer') || normalized.includes('storage')) productType = 'organizer';
  else if (normalized.includes('12volt') || normalized.includes('battery')) productType = 'battery';
  else if (normalized.includes('usb') || normalized.includes('hub')) productType = 'usbhub';

  // Detect material
  let material = '';
  if (normalized.includes('carbon')) material = 'carbon';
  else if (normalized.includes('leather')) material = 'leather';
  else if (normalized.includes('alcantara')) material = 'alcantara';
  else if (normalized.includes('wood')) material = 'wood';
  else if (normalized.includes('matte')) material = 'matte';
  else if (normalized.includes('kagu')) material = 'kagu';
  else if (normalized.includes('elegant')) material = 'elegant';
  else if (normalized.includes('tpe')) material = 'tpe';

  // Get brand (from vendor or title)
  let brand = normalizeVendor(product.vendor);
  if (!brand || brand.length < 3) {
    brand = extractBrandFromTitle(title);
  }

  return {
    model,
    variant,
    productType,
    subType,
    material,
    brand,
    normalized,
    words
  };
}

// Check if two prices are in the same ballpark
// If price difference is 70%+ it's likely NOT the same product
function pricesAreCompatible(price1, price2) {
  const ratio = Math.max(price1, price2) / Math.min(price1, price2);
  // ratio of 1.67 = 40% savings max (1 - 1/1.67 = 0.40)
  // ratio of 2.0 = 50% savings max
  // ratio of 2.5 = 60% savings max
  return ratio <= 2.0; // Max 50% price difference - stricter to avoid false matches
}

// Calculate similarity between two products
function calculateSimilarity(product1, product2, sig1, sig2) {
  // Must be same product type
  if (sig1.productType !== sig2.productType) {
    return 0;
  }

  // SUB-TYPE MUST MATCH for PPF and bodykit products (critical fix for false positives)
  if ((sig1.productType === 'ppf' || sig1.productType === 'bodykit') &&
      sig1.subType && sig2.subType && sig1.subType !== sig2.subType) {
    return 0;
  }

  // For floor mats, sub-type (coverage) should match
  if (sig1.productType === 'floormat' && sig1.subType && sig2.subType && sig1.subType !== sig2.subType) {
    return 0;
  }

  // Must be compatible models
  if (sig1.model !== 'universal' && sig2.model !== 'universal' && sig1.model !== sig2.model) {
    return 0;
  }

  // Car variants must match - if ONE product specifies a variant, both must have compatible variants
  // Pre-refresh vs refresh/unspecified should NOT match (different interiors)
  const specificVariants = ['prerefresh', 'highland', 'juniper', 'plaid'];
  const sig1HasSpecific = specificVariants.includes(sig1.variant);
  const sig2HasSpecific = specificVariants.includes(sig2.variant);

  if (sig1HasSpecific || sig2HasSpecific) {
    if (sig1.variant !== sig2.variant) {
      return 0; // One has specific variant, other doesn't match = not same product
    }
  }

  // For 3D MAXpider mats, material (kagu vs elegant) must match
  if (sig1.brand.includes('maxpider') && sig1.material && sig2.material && sig1.material !== sig2.material) {
    return 0;
  }

  // Calculate string similarity on normalized titles
  const titleSimilarity = stringSimilarity.compareTwoStrings(sig1.normalized, sig2.normalized);

  // Boost score for matching attributes
  let score = titleSimilarity;

  if (sig1.model === sig2.model && sig1.model !== 'universal') score += 0.1;
  if (sig1.material === sig2.material && sig1.material) score += 0.1;
  if (sig1.subType === sig2.subType && sig1.subType) score += 0.15;

  // Penalize 'other' product type matches
  if (sig1.productType === 'other') score *= 0.5;

  return Math.min(score, 1.0);
}

// Group similar products together
export function matchProducts(products) {
  console.log(`\n🔍 Matching ${products.length} products...`);

  const BRAND_MATCH_THRESHOLD = 0.45; // Slightly higher for brand matches
  const TITLE_ONLY_THRESHOLD = 0.65; // 65%+ similarity with same product type
  const MIN_PRICE_DIFF_PERCENT = 3;  // Min 3% savings
  const MAX_PRICE_DIFF_PERCENT = 50; // Max 50% savings - if more, likely different products

  const matches = [];
  const matched = new Set();

  // Pre-compute signatures
  const signatures = new Map();
  products.forEach(p => {
    signatures.set(p, extractProductSignature(p));
  });

  // First pass: Group by brand (for known multi-store brands)
  console.log('  Pass 1: Brand-based matching...');

  const brandGroups = new Map();
  products.forEach(p => {
    const sig = signatures.get(p);
    if (sig.brand && isMultiStoreBrand(sig.brand)) {
      const key = sig.brand;
      if (!brandGroups.has(key)) brandGroups.set(key, []);
      brandGroups.get(key).push(p);
    }
  });

  for (const [brand, brandProducts] of brandGroups) {
    const sorted = [...brandProducts].sort((a, b) => a.source.localeCompare(b.source));

    for (let i = 0; i < sorted.length; i++) {
      if (matched.has(sorted[i].url)) continue;

      const product1 = sorted[i];
      const sig1 = signatures.get(product1);
      const group = [product1];
      const groupSources = new Set([product1.sourceId]);

      for (let j = i + 1; j < sorted.length; j++) {
        if (matched.has(sorted[j].url)) continue;

        const product2 = sorted[j];
        if (product1.sourceId === product2.sourceId) continue;

        const sig2 = signatures.get(product2);

        if (!pricesAreCompatible(product1.price, product2.price)) continue;

        const similarity = calculateSimilarity(product1, product2, sig1, sig2);

        if (similarity >= BRAND_MATCH_THRESHOLD) {
          const groupPrices = group.map(p => p.price);
          const allPricesCompatible = groupPrices.every(gp => pricesAreCompatible(gp, product2.price));

          if (allPricesCompatible && !groupSources.has(product2.sourceId)) {
            group.push(product2);
            groupSources.add(product2.sourceId);
            matched.add(product2.url);
          }
        }
      }

      if (groupSources.size >= 2) {
        addMatch(matches, group, sig1, MIN_PRICE_DIFF_PERCENT, MAX_PRICE_DIFF_PERCENT, brand);
        matched.add(product1.url);
      }
    }
  }

  console.log(`    Found ${matches.length} brand-based matches`);

  // Second pass: Title-only matching for non-branded products
  // REMOVED store-exclusive brand filter - it was blocking too many valid matches
  console.log('  Pass 2: Title-only matching...');

  const sortedProducts = [...products].sort((a, b) => a.source.localeCompare(b.source));
  let titleMatches = 0;

  for (let i = 0; i < sortedProducts.length; i++) {
    if (matched.has(sortedProducts[i].url)) continue;

    const product1 = sortedProducts[i];
    const sig1 = signatures.get(product1);

    // Skip generic products and short titles
    if (sig1.productType === 'other') continue;
    if (product1.title.length < 25) continue;

    const group = [product1];
    const groupSources = new Set([product1.sourceId]);

    for (let j = i + 1; j < sortedProducts.length; j++) {
      if (matched.has(sortedProducts[j].url)) continue;

      const product2 = sortedProducts[j];
      if (product1.sourceId === product2.sourceId) continue;

      const sig2 = signatures.get(product2);

      if (!pricesAreCompatible(product1.price, product2.price)) continue;

      const similarity = calculateSimilarity(product1, product2, sig1, sig2);

      if (similarity >= TITLE_ONLY_THRESHOLD) {
        const groupPrices = group.map(p => p.price);
        const allPricesCompatible = groupPrices.every(gp => pricesAreCompatible(gp, product2.price));

        if (allPricesCompatible && !groupSources.has(product2.sourceId)) {
          group.push(product2);
          groupSources.add(product2.sourceId);
          matched.add(product2.url);
        }
      }
    }

    if (groupSources.size >= 2) {
      addMatch(matches, group, sig1, MIN_PRICE_DIFF_PERCENT, MAX_PRICE_DIFF_PERCENT, null);
      matched.add(product1.url);
      titleMatches++;
    }
  }

  console.log(`    Found ${titleMatches} title-only matches`);

  // Third pass: Product-type + model matching (for generic products)
  console.log('  Pass 3: Product-type + model matching...');
  let typeMatches = 0;

  // Group unmatched products by type+model
  const typeModelGroups = new Map();
  sortedProducts.forEach(p => {
    if (matched.has(p.url)) return;
    const sig = signatures.get(p);
    if (sig.productType === 'other') return;

    const key = `${sig.productType}-${sig.model}-${sig.subType || 'generic'}`;
    if (!typeModelGroups.has(key)) typeModelGroups.set(key, []);
    typeModelGroups.get(key).push(p);
  });

  for (const [key, groupProducts] of typeModelGroups) {
    if (groupProducts.length < 2) continue;

    // Try to find matches within this type+model group
    for (let i = 0; i < groupProducts.length; i++) {
      if (matched.has(groupProducts[i].url)) continue;

      const product1 = groupProducts[i];
      const sig1 = signatures.get(product1);
      const group = [product1];
      const groupSources = new Set([product1.sourceId]);

      for (let j = i + 1; j < groupProducts.length; j++) {
        if (matched.has(groupProducts[j].url)) continue;

        const product2 = groupProducts[j];
        if (product1.sourceId === product2.sourceId) continue;

        const sig2 = signatures.get(product2);

        if (!pricesAreCompatible(product1.price, product2.price)) continue;

        // Lower threshold for same type+model products
        const similarity = calculateSimilarity(product1, product2, sig1, sig2);

        if (similarity >= 0.50) {
          const groupPrices = group.map(p => p.price);
          const allPricesCompatible = groupPrices.every(gp => pricesAreCompatible(gp, product2.price));

          if (allPricesCompatible && !groupSources.has(product2.sourceId)) {
            group.push(product2);
            groupSources.add(product2.sourceId);
            matched.add(product2.url);
          }
        }
      }

      if (groupSources.size >= 2) {
        addMatch(matches, group, sig1, MIN_PRICE_DIFF_PERCENT, MAX_PRICE_DIFF_PERCENT, null);
        matched.add(product1.url);
        typeMatches++;
      }
    }
  }

  console.log(`    Found ${typeMatches} type-based matches`);

  // Sort by savings
  const sortedMatches = matches.sort((a, b) => b.savings - a.savings);

  console.log(`✓ Found ${sortedMatches.length} valid price comparisons`);

  return sortedMatches;
}

function addMatch(matches, group, sig, minPercent, maxPercent, brand) {
  const prices = group.map(p => p.price).sort((a, b) => a - b);
  const lowestPrice = prices[0];
  const highestPrice = prices[prices.length - 1];
  const savings = highestPrice - lowestPrice;
  const savingsPercent = Math.round((savings / highestPrice) * 100);

  // Calculate average title similarity to filter out low-quality matches
  // stringSimilarity is imported at top of file
  let totalSim = 0;
  let count = 0;
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      totalSim += stringSimilarity.compareTwoStrings(
        group[i].title.toLowerCase(),
        group[j].title.toLowerCase()
      );
      count++;
    }
  }
  const avgSimilarity = count > 0 ? totalSim / count : 0;

  // Only add if average similarity is 65%+ (likely same product)
  const MIN_AVG_SIMILARITY = 0.65;

  if (savingsPercent >= minPercent && savingsPercent <= maxPercent && savings >= 5 && avgSimilarity >= MIN_AVG_SIMILARITY) {
    matches.push({
      matchKey: sig.normalized.slice(0, 50),
      category: sig.productType,
      subType: sig.subType || '',
      models: [sig.model],
      brand: brand || 'generic',
      lowestPrice,
      highestPrice,
      savings,
      savingsPercent,
      avgSimilarity: Math.round(avgSimilarity * 100),
      products: group.sort((a, b) => a.price - b.price)
    });
  }
}

// Format match for display
export function formatMatch(match) {
  const lines = [];
  lines.push(`Save $${match.savings.toFixed(2)} (${match.savingsPercent}% off)`);
  lines.push(`  ${match.products[0].title}`);
  lines.push(`  Category: ${match.category}${match.subType ? '/' + match.subType : ''}, Model: ${match.models[0]}${match.brand !== 'generic' ? `, Brand: ${match.brand}` : ''}`);
  lines.push(`  Prices:`);
  match.products.forEach((p, i) => {
    const tag = i === 0 ? ' ← BEST' : '';
    lines.push(`    $${p.price.toFixed(2)} at ${p.source}${tag}`);
  });
  return lines.join('\n');
}
