import fs from 'fs/promises';
import stringSimilarity from 'string-similarity';

const matchesData = await fs.readFile('./data/matches.json', 'utf-8');
const matches = JSON.parse(matchesData);

console.log('=== FULL VALIDATION OF ALL MATCHES ===\n');
console.log(`Total matches: ${matches.length}\n`);

let issues = [];

matches.forEach((m, idx) => {
  const problems = [];

  // Check 1: Title similarity
  let totalSim = 0;
  let count = 0;
  for (let i = 0; i < m.products.length; i++) {
    for (let j = i + 1; j < m.products.length; j++) {
      const sim = stringSimilarity.compareTwoStrings(
        m.products[i].title.toLowerCase(),
        m.products[j].title.toLowerCase()
      );
      totalSim += sim;
      count++;
      if (sim < 0.6) {
        problems.push(`Low similarity (${(sim*100).toFixed(0)}%) between titles`);
      }
    }
  }
  const avgSim = count > 0 ? totalSim / count : 0;

  // Check 2: Price ratio
  const priceRatio = m.highestPrice / m.lowestPrice;
  if (priceRatio > 2) {
    problems.push(`High price ratio: ${priceRatio.toFixed(2)}x`);
  }

  // Check 3: Different variants in titles
  const titles = m.products.map(p => p.title.toLowerCase());
  const variants = ['pre-refresh', 'prerefresh', 'highland', 'juniper', 'plaid', 'refresh'];
  const foundVariants = new Set();
  titles.forEach(t => {
    variants.forEach(v => {
      if (t.includes(v)) foundVariants.add(v);
    });
  });
  if (foundVariants.size > 1) {
    problems.push(`Mixed variants: ${[...foundVariants].join(', ')}`);
  }

  // Check 4: Different specific parts
  const parts = ['headlight', 'taillight', 'front', 'rear', 'interior', 'exterior'];
  const titleParts = titles.map(t => {
    for (const p of parts) {
      if (t.includes(p)) return p;
    }
    return 'unspecified';
  });
  const uniqueParts = [...new Set(titleParts.filter(p => p !== 'unspecified'))];
  if (uniqueParts.length > 1) {
    problems.push(`Mixed parts: ${uniqueParts.join(' vs ')}`);
  }

  // Check 5: Different product types mentioned
  if (titles.some(t => t.includes('spoiler')) && titles.some(t => t.includes('skirt'))) {
    problems.push('Spoiler vs Skirt mismatch');
  }
  if (titles.some(t => t.includes('diffuser')) && titles.some(t => t.includes('spoiler'))) {
    problems.push('Diffuser vs Spoiler mismatch');
  }

  if (problems.length > 0) {
    issues.push({
      idx: idx + 1,
      similarity: (avgSim * 100).toFixed(0),
      priceRatio: priceRatio.toFixed(2),
      savings: m.savings.toFixed(0),
      problems,
      products: m.products.map(p => ({
        price: p.price,
        source: p.source,
        title: p.title.slice(0, 60)
      }))
    });
  }
});

if (issues.length === 0) {
  console.log('✅ ALL MATCHES PASSED VALIDATION!\n');
} else {
  console.log(`⚠️ FOUND ${issues.length} POTENTIAL ISSUES:\n`);
  issues.forEach(issue => {
    console.log(`#${issue.idx} | Sim: ${issue.similarity}% | Ratio: ${issue.priceRatio}x | Save: $${issue.savings}`);
    console.log(`   Problems: ${issue.problems.join('; ')}`);
    issue.products.forEach(p => {
      console.log(`   $${p.price.toFixed(2).padStart(7)} @ ${p.source.padEnd(15)} "${p.title}..."`);
    });
    console.log('');
  });
}

// Summary
console.log('\n=== SUMMARY ===');
console.log(`Total matches: ${matches.length}`);
console.log(`Matches with issues: ${issues.length}`);
console.log(`Clean matches: ${matches.length - issues.length}`);

// Category breakdown
const cats = {};
matches.forEach(m => {
  cats[m.category] = (cats[m.category] || 0) + 1;
});
console.log('\nBy category:');
Object.entries(cats).sort((a,b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${count.toString().padStart(3)} ${cat}`);
});

// Store coverage
const stores = {};
matches.forEach(m => {
  m.products.forEach(p => {
    stores[p.source] = (stores[p.source] || 0) + 1;
  });
});
console.log('\nStore coverage:');
Object.entries(stores).sort((a,b) => b[1] - a[1]).forEach(([store, count]) => {
  console.log(`  ${count.toString().padStart(3)} ${store}`);
});
