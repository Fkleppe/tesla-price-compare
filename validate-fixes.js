import fs from 'fs/promises';

const matchesData = await fs.readFile('./data/matches.json', 'utf-8');
const matches = JSON.parse(matchesData);

console.log('=== VALIDATION: Checking for Fixed Issues ===\n');

// Check 1: No headlight vs taillight matches
console.log('1. HEADLIGHT vs TAILLIGHT CHECK:');
const lightMismatches = matches.filter(m => {
  const titles = m.products.map(p => p.title.toLowerCase());
  const hasHeadlight = titles.some(t => t.includes('headlight') || t.includes('head light'));
  const hasTaillight = titles.some(t => t.includes('taillight') || t.includes('tail light') || t.includes('rear light'));
  return hasHeadlight && hasTaillight;
});
if (lightMismatches.length === 0) {
  console.log('   ✓ PASS - No headlight/taillight mismatches found');
} else {
  console.log(`   ✗ FAIL - Found ${lightMismatches.length} headlight/taillight mismatches:`);
  lightMismatches.forEach(m => {
    console.log(`     - ${m.products.map(p => p.title.slice(0, 40)).join(' VS ')}`);
  });
}

// Check 2: No front spoiler vs rear spoiler matches
console.log('\n2. FRONT SPOILER vs REAR SPOILER CHECK:');
const spoilerMismatches = matches.filter(m => {
  if (m.category !== 'bodykit') return false;
  const titles = m.products.map(p => p.title.toLowerCase());
  const hasFront = titles.some(t => t.includes('front spoiler') || t.includes('front lip'));
  const hasRear = titles.some(t => (t.includes('rear spoiler') || t.includes('trunk spoiler')) && !t.includes('front'));
  return hasFront && hasRear;
});
if (spoilerMismatches.length === 0) {
  console.log('   ✓ PASS - No front/rear spoiler mismatches found');
} else {
  console.log(`   ✗ FAIL - Found ${spoilerMismatches.length} front/rear spoiler mismatches`);
}

// Check 3: No spoiler vs side skirts matches
console.log('\n3. SPOILER vs SIDE SKIRTS CHECK:');
const spoilerSkirtMismatches = matches.filter(m => {
  if (m.category !== 'bodykit') return false;
  const titles = m.products.map(p => p.title.toLowerCase());
  const hasSpoiler = titles.some(t => t.includes('spoiler') && !t.includes('side'));
  const hasSkirts = titles.some(t => t.includes('side skirt') || t.includes('skirts'));
  return hasSpoiler && hasSkirts;
});
if (spoilerSkirtMismatches.length === 0) {
  console.log('   ✓ PASS - No spoiler/side skirts mismatches found');
} else {
  console.log(`   ✗ FAIL - Found ${spoilerSkirtMismatches.length} spoiler/side skirts mismatches`);
}

// Check 4: No interior PPF vs exterior PPF matches
console.log('\n4. INTERIOR vs EXTERIOR PPF CHECK:');
const ppfMismatches = matches.filter(m => {
  if (m.category !== 'ppf') return false;
  const titles = m.products.map(p => p.title.toLowerCase());
  const hasInterior = titles.some(t => t.includes('interior'));
  const hasExterior = titles.some(t => t.includes('exterior') || t.includes('front') || t.includes('hood') || t.includes('bumper'));
  return hasInterior && hasExterior;
});
if (ppfMismatches.length === 0) {
  console.log('   ✓ PASS - No interior/exterior PPF mismatches found');
} else {
  console.log(`   ✗ FAIL - Found ${ppfMismatches.length} interior/exterior PPF mismatches`);
}

// Check 5: Stores represented
console.log('\n5. STORE COVERAGE CHECK:');
const storeProducts = {};
matches.forEach(m => {
  m.products.forEach(p => {
    storeProducts[p.source] = (storeProducts[p.source] || 0) + 1;
  });
});
Object.entries(storeProducts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([store, count]) => {
    console.log(`   ${count.toString().padStart(4)} products from ${store}`);
  });

// Check for missing stores
const allStores = ['Tesery', 'Yeslak', 'Hansshow', 'TapTes', 'EVANNEX', 'RPM Tesla', 'Abstract Ocean', 'TESBROS', 'Teslarati Shop', 'Teslahubs', 'Tesmanian'];
const missingStores = allStores.filter(s => !storeProducts[s]);
if (missingStores.length > 0) {
  console.log(`\n   ⚠ Missing stores: ${missingStores.join(', ')}`);
}

// Check 6: 3D MAXpider matches
console.log('\n6. 3D MAXPIDER MATCHES:');
const maxpiderMatches = matches.filter(m => m.brand && m.brand.includes('maxpider'));
console.log(`   Found ${maxpiderMatches.length} 3D MAXpider matches:`);
maxpiderMatches.forEach(m => {
  console.log(`   - Save $${m.savings.toFixed(0)}: ${m.products[0].title.slice(0, 50)}...`);
  console.log(`     Stores: ${m.products.map(p => p.source).join(', ')}`);
});

// Check 7: Sample of top generic matches (verify quality)
console.log('\n7. SAMPLE GENERIC MATCHES (manual verification):');
const genericMatches = matches.filter(m => m.brand === 'generic').slice(0, 5);
genericMatches.forEach((m, i) => {
  console.log(`\n   ${i+1}. ${m.category}/${m.subType || 'generic'} - Save $${m.savings.toFixed(0)}`);
  m.products.forEach(p => {
    console.log(`      $${p.price.toFixed(2).padStart(7)} @ ${p.source.padEnd(15)} "${p.title.slice(0, 45)}..."`);
  });
});

// Summary
console.log('\n\n=== SUMMARY ===');
console.log(`Total matches: ${matches.length}`);
console.log(`Brand-based: ${matches.filter(m => m.brand !== 'generic').length}`);
console.log(`Title-only: ${matches.filter(m => m.brand === 'generic').length}`);
console.log(`Stores covered: ${Object.keys(storeProducts).length}/11`);
