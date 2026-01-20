'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getAffiliateUrl, getDiscountInfo, isAffiliatePartner } from '../../../lib/affiliate';

interface Product {
  title: string;
  price: number;
  currency: string;
  url: string;
  image: string;
  source: string;
  sourceId: string;
  category: string;
  models: string[];
  description?: string;
  vendor?: string;
}

const MODEL_LABELS: Record<string, string> = {
  'model-3': 'Model 3',
  'highland': 'Model 3 Highland',
  'model-y': 'Model Y',
  'juniper': 'Model Y Juniper',
  'model-s': 'Model S',
  'model-x': 'Model X',
  'cybertruck': 'Cybertruck',
  'universal': 'Universal',
};

const MODEL_YEARS: Record<string, string> = {
  'model-3': '2017-2023',
  'highland': '2024+',
  'model-y': '2020-2024',
  'juniper': '2025+',
  'model-s': '2012+',
  'model-x': '2015+',
  'cybertruck': '2024+',
  'universal': 'All Years',
};

const CATEGORY_BENEFITS: Record<string, string[]> = {
  'floor-mats': ['Custom laser-measured fit', 'Easy to clean', 'All-weather protection', 'Protects original carpet', 'Non-slip backing', 'Raised edges contain spills'],
  'screen-protector': ['Anti-glare coating', 'Scratch resistant', 'Bubble-free install', 'Fingerprint resistant', '9H hardness rating', 'Preserves touch sensitivity'],
  'screen-protectors': ['Anti-glare coating', 'Scratch resistant', 'Bubble-free install', 'Fingerprint resistant', '9H hardness rating', 'Preserves touch sensitivity'],
  'center-console': ['Precise fit design', 'Scratch protection', 'Durable materials', 'Tool-free install', 'OEM-matching finish', 'Heat resistant'],
  'charging': ['Fast charging capable', 'Safety certified', 'Weather resistant', 'J1772 compatible', 'LED indicators', 'Overheat protection'],
  'charger': ['Fast charging capable', 'Safety certified', 'Weather resistant', 'J1772 compatible', 'LED indicators', 'Overheat protection'],
  'exterior': ['Weather resistant', 'UV protection', 'Aerodynamic design', 'Paint protection', 'Wind noise reduction', 'Easy bolt-on install'],
  'interior': ['Precision fit', 'Durable materials', 'OEM-matching finish', 'Non-toxic materials', 'Wear resistant', 'Color-matched options'],
  'interior-trim': ['Precision fit', 'Durable materials', 'OEM-matching finish', 'Scratch resistant', 'Color-matched', 'Easy snap-on install'],
  'wheels': ['Lightweight construction', 'OEM compatible', 'Corrosion resistant', 'Balanced design', 'Improved range', 'Easy installation'],
  'wheel-covers': ['Aerodynamic design', 'Improved range', 'OEM-style fit', 'Durable ABS plastic', 'Easy clip-on install', 'Protects original wheels'],
  'lighting': ['Bright LED output', 'Long lifespan', 'Plug and play', 'Low power draw', 'No flickering', 'Color temperature matched'],
  'storage': ['Maximizes space', 'Custom fit design', 'Quick access', 'Durable construction', 'Non-slip surface', 'Foldable options'],
  'cargo-mats': ['Full coverage design', 'Waterproof material', 'Raised lip edges', 'Custom fit', 'Easy to remove', 'Protects cargo area'],
  'seat-covers': ['Exact fit design', 'Durable materials', 'Easy installation', 'Airbag compatible', 'Protects leather/fabric', 'Machine washable'],
  'sunshade': ['Blocks UV rays', 'Reduces cabin heat', 'Custom fit', 'Easy storage', 'Reflective material', 'Protects dashboard'],
  'camping': ['Designed for Tesla', 'Easy setup', 'Weather resistant', 'Comfortable padding', 'Fits trunk space', 'Travel-friendly'],
  'electronics': ['Wireless charging', 'Secure mount', 'Easy access', 'Clean installation', 'Fast charging', 'Universal compatibility'],
  'vent-cover': ['Prevents debris buildup', 'Custom fit design', 'Easy snap installation', 'Protects AC vents', 'Durable ABS material', 'Maintains airflow'],
  'mud-flaps': ['Protects paint from debris', 'Custom fit design', 'Easy bolt-on install', 'Durable flexible material', 'All-weather rated', 'OEM-style appearance'],
  'door-sill': ['Prevents scratches', 'Custom fit design', 'Self-adhesive backing', 'Durable material', 'Protects entry points', 'Easy application'],
  'phone-mount': ['Secure magnetic hold', 'Wireless charging', '360° adjustable', 'Easy one-hand use', 'Scratch-free mount', 'Clean installation'],
  'wireless-charger': ['Fast 15W charging', 'Qi certified', 'Auto-alignment', 'Temperature control', 'Non-slip surface', 'LED indicators'],
  'cup-holder': ['Prevents spills', 'Custom fit', 'Easy to clean', 'Silicone material', 'Protects console', 'Removable design'],
  'pedals': ['Non-slip surface', 'Sporty appearance', 'Aluminum construction', 'Easy clip-on install', 'Improved grip', 'No drilling required'],
  'steering-wheel': ['Good grip material', 'Custom fit', 'Easy installation', 'Protects original wheel', 'Comfortable feel', 'Non-slip surface'],
  'frunk': ['Custom fit', 'Waterproof material', 'Protects frunk area', 'Easy to clean', 'Raised edges', 'Durable construction'],
  'door-seal': ['Reduces wind noise', 'Weatherproof seal', 'Easy installation', 'Durable rubber', 'Improves insulation', 'Custom fit'],
  'carbon-fiber': ['Lightweight material', 'Motorsport look', 'UV resistant coating', 'OEM fit', 'Real carbon weave', 'Protective clear coat'],
  'spoiler': ['Aerodynamic design', 'Enhanced appearance', 'Quality ABS/carbon', 'Easy installation', 'Wind-tested', 'OEM-style fit'],
  'default': ['Durable materials', 'Custom fit', 'Easy install', 'Solid construction', 'Tesla-specific design', 'Good finish'],
};

// Detailed category descriptions for SEO content - factual, specific
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'floor-mats': 'TPE (thermoplastic elastomer) floor mats have become the preferred choice for Tesla owners over traditional rubber. TPE is odorless, non-toxic, and handles temperatures from -58°F to 176°F without cracking or warping. Most aftermarket mats are laser-measured to match Tesla\'s exact floor contours. The raised edges contain water, mud, and snow better than flat mats. TPE is also recyclable. If you have kids, pets, or live somewhere with harsh winters, floor mats prevent the carpet damage that tanks resale value.',
  'screen-protector': 'Tesla\'s touchscreen controls almost everything in the car, so scratches are a real annoyance. Tempered glass protectors with 9H hardness (the same spec as smartphone screens) resist scratches from rings, keys, and fingernails. Look for oleophobic coating if fingerprints bother you. Matte versions reduce glare and work better with polarized sunglasses. Most protectors come with alignment frames and bubble-removal tools. Expect to spend 10-15 minutes on installation if you want it perfect.',
  'screen-protectors': 'Tesla\'s touchscreen controls almost everything in the car, so scratches are a real annoyance. Tempered glass protectors with 9H hardness (the same spec as smartphone screens) resist scratches from rings, keys, and fingernails. Look for oleophobic coating if fingerprints bother you. Matte versions reduce glare and work better with polarized sunglasses. Most protectors come with alignment frames and bubble-removal tools. Expect to spend 10-15 minutes on installation if you want it perfect.',
  'center-console': 'The center console gets touched constantly, and the piano black finish on older Teslas shows every fingerprint and scratch. Protective wraps and covers prevent this. You can get vinyl wraps, ABS plastic covers, or silicone mats. Many owners go with carbon fiber or wood grain finishes to change the look while protecting the original surface. Installation takes 5-10 minutes for most covers.',
  'charging': 'Most Tesla owners charge at home overnight. A Level 2 charger (240V) adds 30-44 miles of range per hour, enough to fully charge overnight. When shopping, check the amperage (higher = faster), cable length for your parking setup, and NEMA outlet compatibility. UL-listed chargers are tested for safety. If you road trip often, a portable NEMA 14-50 adapter lets you charge at RV parks and campgrounds.',
  'charger': 'Most Tesla owners charge at home overnight. A Level 2 charger (240V) adds 30-44 miles of range per hour, enough to fully charge overnight. When shopping, check the amperage (higher = faster), cable length for your parking setup, and NEMA outlet compatibility. UL-listed chargers are tested for safety. If you road trip often, a portable NEMA 14-50 adapter lets you charge at RV parks and campgrounds.',
  'exterior': 'Exterior accessories protect your paint and can improve aerodynamics. PPF (paint protection film) on the front bumper and rocker panels prevents rock chips. Ceramic coating makes washing easier and adds gloss. Mud flaps catch debris before it hits the paint. Spoilers and diffusers can reduce drag at highway speeds, though the actual range improvement is usually 1-2%.',
  'interior': 'Tesla interiors are minimal by design, which means there\'s room for practical add-ons. Storage organizers, ambient lighting, and protective covers are popular. The trick is finding accessories that don\'t clutter the space or look out of place. Most accessories are designed to match Tesla\'s interior colors and materials.',
  'interior-trim': 'Trim pieces cover the center console, dashboard, and door panels. Real carbon fiber, brushed aluminum, and wood grain options are available. They protect the original surfaces from scratches and change the look of the cabin. Most use 3M adhesive backing and take 15-30 minutes to install. Look for pieces that are precision-cut so the edges align properly.',
  'wheels': 'Wheel accessories serve two purposes: looks and protection. Aero covers can improve range by 3-4% at highway speeds by reducing turbulence around the wheels. Hub caps and center caps protect against curb rash. Most aftermarket covers use ABS plastic or aluminum, and clip onto Tesla\'s stock wheels without modification.',
  'wheel-covers': 'Tesla\'s stock aero covers improve efficiency by smoothing airflow around the wheels. Aftermarket covers do the same thing with different designs. They clip on without tools and don\'t interfere with TPMS sensors. Common styles include turbine patterns and carbon fiber looks. Expect range improvements of 2-4% at sustained highway speeds.',
  'lighting': 'LED upgrades replace Tesla\'s stock interior bulbs with brighter alternatives. Puddle lights can project custom logos, dome lights can be upgraded for better visibility, and ambient strips add accent lighting. LEDs last 25,000+ hours and draw less power than incandescent bulbs. Installation is plug-and-play for most lights.',
  'storage': 'Tesla\'s interior has unused space that storage accessories can reclaim. Under-seat bins, center console organizers, and trunk dividers are the most popular. Frunk organizers make the front trunk more practical for groceries. Look for organizers that are custom-fitted so they don\'t slide around during driving.',
  'cargo-mats': 'Cargo mats protect the trunk, sub-trunk, and frunk from spills and dirt. Liners with raised edges contain liquids better than flat mats. TPE and rubber materials are waterproof and hose off easily. Custom-fitted mats cover the wheel wells and seat backs when the rear seats are folded. Useful if you have pets, kids, or haul outdoor gear.',
  'seat-covers': 'Seat covers protect against wear, stains, pet damage, and UV fading. Custom-fitted covers have cutouts for seat controls, headrests, and airbag zones. Neoprene resists water, leather adds a luxury look, and mesh breathes better in hot climates. Good covers don\'t block seat heating or cooling and can be removed for washing.',
  'sunshade': 'Tesla\'s glass roof lets in a lot of heat during summer. Sunshades block UV rays, reduce interior temperatures by up to 30°F, and protect the dashboard from fading. Front windshield shades are important in hot climates. Roof shades help rear passengers. Most fold up and fit in the frunk or door pockets.',
  'camping': 'Tesla\'s flat cargo area and Camp Mode (which runs climate control all night) make it practical for car camping. Custom-fit mattresses turn the Model Y, Model X, and Cybertruck into sleeping spaces. Privacy shades block window views. Tent attachments connect to the rear liftgate. Camp Mode uses about 1-2% battery per hour depending on temperature.',
  'electronics': 'Phone mounts, wireless chargers, dashcams, and USB hubs expand Tesla\'s functionality. Good phone mounts have MagSafe or strong magnetic hold, wireless charging up to 15W, and adjustable angles. Dashcams add security footage beyond what Sentry Mode captures. USB hubs are useful if you have multiple devices to charge.',
  'vent-cover': 'Model 3 and Model Y have exposed HVAC vents under the front seats. Coins, earbuds, and food crumbs fall into these vents and can cause rattling or blockages. Vent covers snap into place without tools, block debris, and still allow airflow to rear passengers. They cost $10-20 and take 2 minutes to install.',
  'mud-flaps': 'Without mud flaps, tires kick up rocks, mud, and salt that chip paint and damage rocker panels. Tesla-specific mud flaps match each model\'s body lines and don\'t create noticeable drag. Flexible materials handle impacts and temperature swings without cracking. Installation takes 15-30 minutes with basic tools.',
  'door-sill': 'Door sills get scratched by shoes, keys, and bags. Protectors prevent this damage and help maintain resale value. Options include clear PPF film (invisible protection) and rigid plates (some with LED illumination). Installation uses adhesive backing and takes about 10 minutes.',
  'phone-mount': 'A phone mount keeps your phone visible without blocking the main screen. Modern mounts support MagSafe, wireless charging up to 15W, and 360° rotation. Dashboard, vent, and screen-side mounting options exist. Good mounts hold firmly on bumpy roads and charge fast enough to keep up with navigation apps.',
  'wireless-charger': 'Wireless charging pads sit in the center console and charge phones without cables. Qi-certified chargers deliver up to 15W for compatible phones. Features to look for: auto-alignment, foreign object detection, and non-slip surfaces. Tesla-specific chargers fit the console storage area and look factory-installed.',
  'cup-holder': 'Cup holder inserts protect the console from drink condensation and spills. Silicone inserts are heat-resistant, removable for cleaning, and stop cups from rattling. Some have dividers for coins or keys. Simple accessory, but it prevents staining and scratches on the original console.',
  'pedals': 'Pedal covers add grip and a sporty look. Made from aluminum alloy with rubber inserts, they clip onto the stock pedals without drilling. Styles include brushed aluminum and carbon fiber patterns. Good covers don\'t affect pedal travel or clearance.',
  'steering-wheel': 'Steering wheel covers add grip and protect the original wheel from wear. Alcantara wraps have a suede texture that performance drivers like. Leather covers add cushioning. If you have heated steering wheel, choose thin covers that don\'t block heat. Custom-fitted covers with stitching stay in place better than universal ones.',
  'frunk': 'The frunk (front trunk) benefits from mats and organizers. Mats keep it clean and prevent scratches from groceries or gear. Organizers with compartments stop items from sliding during acceleration. Custom-fitted accessories match each Tesla model\'s frunk shape and drainage holes.',
  'door-seal': 'Extra door seals reduce wind noise at highway speeds. Tesla\'s frameless windows can let in some noise, and aftermarket weatherstripping helps. Automotive-grade rubber seals compress properly and stay adhered in all weather. Many owners notice the difference immediately after installation.',
  'carbon-fiber': 'Real carbon fiber accessories add motorsport style and are genuinely lightweight. Mirror caps, spoilers, interior trim, and steering wheel covers are available. Look for UV-resistant clear coat to prevent yellowing. Good carbon fiber uses aerospace-grade weave with proper resin curing.',
  'spoiler': 'Spoilers change the look and can reduce rear-end lift at highway speeds. Options range from subtle lip spoilers to full performance wings. Materials include ABS plastic, fiberglass, and carbon fiber. Most mount with adhesive or use existing hardware points, no drilling needed. Color-matched spoilers look factory-installed.',
  'default': 'Tesla accessories protect the car and add functionality. Aftermarket products designed specifically for Tesla have better fitment than universal accessories. When shopping, look for sellers with detailed compatibility info, real customer reviews, and reasonable return policies. Accessories installed correctly don\'t affect warranty coverage.',
};

const STORE_INFO: Record<string, { rating: string; shipping: string; returns: string; established: string }> = {
  'Tesery': { rating: '4.7', shipping: 'Free shipping over $49', returns: '30-day returns', established: '2018' },
  'Tesmanian': { rating: '4.8', shipping: 'Free shipping over $100', returns: '30-day returns', established: '2019' },
  'Yeslak': { rating: '4.6', shipping: 'Free shipping over $59', returns: '30-day returns', established: '2019' },
  'Jowua': { rating: '4.8', shipping: 'Free worldwide shipping', returns: '14-day returns', established: '2017' },
  'Hansshow': { rating: '4.5', shipping: 'Free shipping over $99', returns: '30-day returns', established: '2016' },
  'Shop4Tesla': { rating: '4.6', shipping: 'EU warehouse available', returns: '14-day returns', established: '2019' },
  'TAPTES': { rating: '4.6', shipping: 'Free shipping over $69', returns: '30-day returns', established: '2018' },
  'EVBASE': { rating: '4.5', shipping: 'Free shipping over $79', returns: '30-day returns', established: '2020' },
  'default': { rating: '4.5', shipping: 'Standard shipping', returns: '30-day returns', established: '2018' },
};

// Installation instructions per category - based on real user feedback
const INSTALLATION_GUIDES: Record<string, { steps: string[]; time: string; difficulty: string; tools: string }> = {
  'floor-mats': {
    steps: [
      'Remove existing floor mats or liners from your Tesla',
      'Vacuum the carpet thoroughly to remove dirt and debris',
      'For driver mat: align with the dead pedal and hook onto retention clips',
      'Press firmly along edges to ensure secure fit around seat tracks',
      'IMPORTANT: Verify mat does not interfere with accelerator or brake pedal',
      'Install passenger and rear mats, checking fit around seat rails',
      'For cargo mats: lay flat and press into corners and wheel wells'
    ],
    time: '5-10 minutes',
    difficulty: 'Easy',
    tools: 'None required'
  },
  'screen-protector': {
    steps: [
      'Park in a dust-free environment (garage recommended)',
      'Clean screen with included alcohol wipe, then dry with microfiber cloth',
      'Use dust removal stickers to pick up any remaining particles',
      'If included, attach alignment frame to screen edges first',
      'Peel backing partially and align top edge with screen bezel',
      'Slowly lower protector, using squeegee card to push out air bubbles',
      'Work from center outward to edges for best results',
      'Small bubbles typically disappear within 24-48 hours',
      'TIP: Having a second person helps with larger Tesla screens'
    ],
    time: '10-20 minutes',
    difficulty: 'Medium',
    tools: 'Included kit (alcohol wipe, microfiber cloth, dust stickers, squeegee)'
  },
  'screen-protectors': {
    steps: [
      'Park in a dust-free environment (garage recommended)',
      'Clean screen with included alcohol wipe, then dry with microfiber cloth',
      'Use dust removal stickers to pick up any remaining particles',
      'If included, attach alignment frame to screen edges first',
      'Peel backing partially and align top edge with screen bezel',
      'Slowly lower protector, using squeegee card to push out air bubbles',
      'Work from center outward to edges for best results',
      'Small bubbles typically disappear within 24-48 hours',
      'TIP: Having a second person helps with larger Tesla screens'
    ],
    time: '10-20 minutes',
    difficulty: 'Medium',
    tools: 'Included kit (alcohol wipe, microfiber cloth, dust stickers, squeegee)'
  },
  'center-console': {
    steps: [
      'Clean the console surface with isopropyl alcohol',
      'Ensure the surface is completely dry',
      'Test fit the piece before removing adhesive backing',
      'Peel back a small portion of the adhesive backing',
      'Align carefully and press into place',
      'Apply firm pressure across the entire surface',
      'Avoid touching the console for 24 hours to allow adhesive to cure'
    ],
    time: '15-20 minutes',
    difficulty: 'Medium',
    tools: 'Isopropyl alcohol, microfiber cloth'
  },
  'vent-cover': {
    steps: [
      'Locate under-seat vents: driver side is near door, passenger side is near center console',
      'Optional: vacuum the vent area to remove existing dust and debris',
      'Align the cover with the vent opening, noting correct orientation',
      'Gently press or snap the cover into place until it clicks',
      'Ensure the cover sits flush with the carpet and doesn\'t rattle',
      'Test rear seat airflow to verify vents are not blocked',
      'Repeat for additional vents (most kits include 2 pieces)'
    ],
    time: '1-2 minutes per cover',
    difficulty: 'Very Easy',
    tools: 'None required'
  },
  'mud-flaps': {
    steps: [
      'Lift your Tesla safely using jack stands or a lift',
      'Remove the wheel for easier access (optional)',
      'Clean the mounting area thoroughly',
      'Align the mud flap with existing mounting holes',
      'Install supplied screws or clips',
      'Tighten securely but don\'t overtorque',
      'Repeat for all four wheels',
      'Lower vehicle and check clearance'
    ],
    time: '30-60 minutes',
    difficulty: 'Medium',
    tools: 'Socket set, screwdriver, jack stands'
  },
  'phone-mount': {
    steps: [
      'Clean the mounting surface with alcohol wipe',
      'Choose optimal mounting location for visibility and reach',
      'Remove adhesive backing and press firmly for 30 seconds',
      'Wait 24 hours before attaching phone for maximum bond strength',
      'Adjust mount angle as needed',
      'Test with your phone to ensure secure hold'
    ],
    time: '5 minutes',
    difficulty: 'Easy',
    tools: 'None required'
  },
  'wireless-charger': {
    steps: [
      'Remove any existing center console items',
      'Clean the installation area',
      'Connect the USB cable to your Tesla\'s port',
      'Route cable neatly along console edges',
      'Place charger in designated position',
      'Test with your phone to verify charging works',
      'Adjust positioning for optimal charging alignment'
    ],
    time: '10-15 minutes',
    difficulty: 'Easy',
    tools: 'None required'
  },
  'lighting': {
    steps: [
      'Turn off your Tesla and open relevant doors/trunk',
      'Carefully pry out the existing light housing with trim tool',
      'Disconnect the electrical connector',
      'Connect new LED light to the connector',
      'Test the light before fully installing',
      'Press the new housing into place until it clicks',
      'Repeat for additional lights'
    ],
    time: '5-10 minutes per light',
    difficulty: 'Easy',
    tools: 'Plastic trim removal tool'
  },
  'default': {
    steps: [
      'Read all included instructions before starting',
      'Clean the installation area thoroughly',
      'Test fit the product before final installation',
      'Follow the specific mounting method (clips, adhesive, or screws)',
      'Verify proper fit and function',
      'Allow adhesives to cure if applicable'
    ],
    time: '10-30 minutes',
    difficulty: 'Easy to Medium',
    tools: 'Varies by product'
  }
};

// Buying guide content per category
const BUYING_GUIDES: Record<string, { considerations: string[]; whatToAvoid: string[]; priceRange: string }> = {
  'floor-mats': {
    considerations: [
      'Material quality: TPE (thermoplastic elastomer) offers the best balance of durability and flexibility',
      'Full coverage: Look for mats that protect the entire floor area including under the seats',
      'Raised edges: Essential for containing water, mud, and spills',
      'Non-slip backing: Prevents dangerous mat shifting while driving',
      'Exact fit: Custom-molded mats for your specific Tesla model year',
      'Easy cleaning: Mats should be removable and washable'
    ],
    whatToAvoid: [
      'Universal fit mats that don\'t match Tesla\'s unique floor shape',
      'Thin, flimsy materials that won\'t last',
      'Mats without proper anchoring systems',
      'Strong chemical odors indicating low-quality materials'
    ],
    priceRange: 'Budget: $50-80 | Mid-range: $80-150 | Premium: $150-300'
  },
  'screen-protector': {
    considerations: [
      'Tempered glass vs film: Glass offers better scratch protection, film is more flexible',
      '9H hardness rating: Industry standard for scratch resistance',
      'Oleophobic coating: Reduces fingerprints and makes cleaning easier',
      'Proper cutouts: Should match your Tesla\'s screen exactly',
      'Touch sensitivity: Should not impact touchscreen responsiveness',
      'Anti-glare option: Reduces reflections in bright sunlight'
    ],
    whatToAvoid: [
      'Protectors that reduce touch sensitivity',
      'Those without proper adhesive (air bubbles)',
      'Products without installation tools included',
      'Non-specific sizing that requires trimming'
    ],
    priceRange: 'Budget: $15-25 | Mid-range: $25-50 | Premium: $50-80'
  },
  'screen-protectors': {
    considerations: [
      'Tempered glass vs film: Glass offers better scratch protection, film is more flexible',
      '9H hardness rating: Industry standard for scratch resistance',
      'Oleophobic coating: Reduces fingerprints and makes cleaning easier',
      'Proper cutouts: Should match your Tesla\'s screen exactly',
      'Touch sensitivity: Should not impact touchscreen responsiveness',
      'Anti-glare option: Reduces reflections in bright sunlight'
    ],
    whatToAvoid: [
      'Protectors that reduce touch sensitivity',
      'Those without proper adhesive (air bubbles)',
      'Products without installation tools included',
      'Non-specific sizing that requires trimming'
    ],
    priceRange: 'Budget: $15-25 | Mid-range: $25-50 | Premium: $50-80'
  },
  'vent-cover': {
    considerations: [
      'Exact fit for your Tesla model: Vent sizes differ between models',
      'Material quality: ABS plastic or silicone for durability',
      'Airflow: Should protect vents without restricting air circulation',
      'Color matching: Choose covers that match your interior',
      'Easy removal: For cleaning the vents periodically'
    ],
    whatToAvoid: [
      'Covers that completely block airflow',
      'Poor quality plastic that may crack',
      'Loose-fitting covers that rattle',
      'Bright colors that clash with Tesla interiors'
    ],
    priceRange: 'Budget: $8-15 | Mid-range: $15-25 | Premium: $25-40'
  },
  'charging': {
    considerations: [
      'Amperage and charging speed: Higher amps = faster charging',
      'Cable length: Consider where you\'ll charge and distance to outlet',
      'Weather rating: For outdoor charging, look for NEMA ratings',
      'Smart features: WiFi connectivity, scheduling, energy monitoring',
      'Certifications: UL listing for safety compliance',
      'Warranty: Look for at least 2-3 year coverage'
    ],
    whatToAvoid: [
      'Uncertified chargers that may damage your Tesla',
      'Undersized cables that overheat',
      'Products without proper safety certifications',
      'Chargers from unknown brands without support'
    ],
    priceRange: 'Portable: $150-300 | Wall Connector: $400-700 | Premium: $500-1000'
  },
  'charger': {
    considerations: [
      'Amperage and charging speed: Higher amps = faster charging',
      'Cable length: Consider where you\'ll charge and distance to outlet',
      'Weather rating: For outdoor charging, look for NEMA ratings',
      'Smart features: WiFi connectivity, scheduling, energy monitoring',
      'Certifications: UL listing for safety compliance',
      'Warranty: Look for at least 2-3 year coverage'
    ],
    whatToAvoid: [
      'Uncertified chargers that may damage your Tesla',
      'Undersized cables that overheat',
      'Products without proper safety certifications',
      'Chargers from unknown brands without support'
    ],
    priceRange: 'Portable: $150-300 | Wall Connector: $400-700 | Premium: $500-1000'
  },
  'default': {
    considerations: [
      'Verify compatibility with your exact Tesla model and year',
      'Read reviews from other Tesla owners',
      'Check return policy before purchasing',
      'Compare prices across multiple stores',
      'Look for products with warranty coverage',
      'Consider bundle deals for better value'
    ],
    whatToAvoid: [
      'Products with no reviews or very few reviews',
      'Suspiciously low prices on premium items',
      'Sellers with poor return policies',
      'Items that require permanent modifications to your Tesla'
    ],
    priceRange: 'Varies by product type'
  }
};

// Maintenance tips per category
const MAINTENANCE_TIPS: Record<string, string[]> = {
  'floor-mats': [
    'Remove and shake out mats weekly to prevent dirt buildup',
    'Deep clean with mild soap and water monthly',
    'Avoid harsh chemicals that can degrade the material',
    'Let mats dry completely before reinstalling to prevent mold',
    'Check mat positioning regularly to ensure they\'re properly secured',
    'Store extra mats flat to prevent warping'
  ],
  'screen-protector': [
    'Clean with a soft microfiber cloth only',
    'Use screen-safe cleaning solution, never ammonia-based products',
    'Avoid pressing too hard on the screen',
    'Replace protector if cracks or chips develop',
    'Keep fingernails trimmed to prevent scratches',
    'Wipe off fingerprints daily for best clarity'
  ],
  'screen-protectors': [
    'Clean with a soft microfiber cloth only',
    'Use screen-safe cleaning solution, never ammonia-based products',
    'Avoid pressing too hard on the screen',
    'Replace protector if cracks or chips develop',
    'Keep fingernails trimmed to prevent scratches',
    'Wipe off fingerprints daily for best clarity'
  ],
  'vent-cover': [
    'Remove and clean covers monthly to maintain airflow',
    'Use compressed air to blow out debris',
    'Wash with mild soap and water if needed',
    'Check for dust buildup on the vent itself',
    'Ensure covers snap back securely after cleaning',
    'Replace if plastic becomes brittle or cracked'
  ],
  'center-console': [
    'Wipe down weekly with a damp microfiber cloth',
    'Avoid abrasive cleaners that can scratch the surface',
    'Clean spills immediately to prevent staining',
    'Use UV protectant on exposed pieces',
    'Check adhesive edges periodically for lifting',
    'Reapply adhesive promoter if edges start to peel'
  ],
  'default': [
    'Follow manufacturer\'s cleaning instructions',
    'Inspect regularly for wear or damage',
    'Keep product clean and free of debris',
    'Address any issues promptly before they worsen',
    'Store spare parts or accessories properly',
    'Contact manufacturer for replacement parts if needed'
  ]
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

function formatCategory(cat: string) {
  return cat.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function cleanDescription(desc: string): string {
  if (!desc) return '';

  let cleaned = desc;

  // Remove style tags and their content
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // Remove script tags and their content
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  // Remove CSS comments /* ... */
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove CSS blocks with selectors { ... }
  cleaned = cleaned.replace(/[.#@]?[\w\-\[\]="':,\s]+\s*\{[^}]*\}/g, '');
  // Remove remaining CSS-like patterns
  cleaned = cleaned.replace(/@[a-z\-]+[^;{]*[;{]/gi, '');
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');
  // Remove any remaining curly braces with content
  cleaned = cleaned.replace(/\{[^}]*\}/g, '');
  // Remove CSS property patterns (property: value;)
  cleaned = cleaned.replace(/[\w\-]+\s*:\s*[^;]+;/g, '');
  // Remove hex colors
  cleaned = cleaned.replace(/#[0-9a-fA-F]{3,8}/g, '');
  // Remove URLs
  cleaned = cleaned.replace(/url\([^)]*\)/gi, '');
  // Remove px, em, rem, % measurements
  cleaned = cleaned.replace(/\d+(\.\d+)?(px|em|rem|%|vh|vw)/gi, '');
  // Remove common CSS keywords that might remain
  cleaned = cleaned.replace(/\b(important|inherit|initial|unset|none|auto|solid|dashed|dotted|flex|grid|block|inline|absolute|relative|fixed|sticky)\b/gi, '');
  // Clean up whitespace and punctuation artifacts
  cleaned = cleaned.replace(/[{}();:!]/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Check if remaining content is still CSS garbage
  const cssKeywords = ['font-family', 'margin', 'padding', 'background', 'border', 'display', 'position', 'width', 'height', 'color', 'text-align', 'line-height', 'overflow', 'opacity', 'transform', 'transition', 'animation', 'box-shadow', 'z-index'];
  const hasCssKeywords = cssKeywords.some(kw => cleaned.toLowerCase().includes(kw));

  // If it has CSS keywords or is mostly special characters/short words, return empty
  if (hasCssKeywords) return '';

  // Check if content is meaningful (has some regular words)
  const words = cleaned.split(/\s+/).filter(w => w.length > 2 && /^[a-zA-Z]+$/.test(w));
  if (words.length < 5) return '';

  return cleaned.slice(0, 500);
}

function getModelNames(models: string[]): string {
  if (!models || models.length === 0) return 'All Tesla Models';
  const filtered = models.filter(m => m !== 'universal');
  if (filtered.length === 0) return 'All Tesla Models';
  return filtered.map(m => MODEL_LABELS[m] || m).join(', ');
}

// Generate a detailed product description from title and category when none exists
function generateProductDescription(title: string, category: string, models: string[], source: string): string {
  const modelNames = getModelNames(models);
  const categoryName = formatCategory(category);
  const titleLower = title.toLowerCase();

  // Extract key details from title
  const pieces = title.match(/(\d+)\s*(pcs|pieces|pack|set)/i);
  const quantity = pieces ? pieces[1] : null;

  // Build description based on product type
  let description = '';

  // Material detection
  const materials: string[] = [];
  if (titleLower.includes('carbon fiber') || titleLower.includes('carbon')) materials.push('carbon fiber');
  if (titleLower.includes('silicone')) materials.push('silicone');
  if (titleLower.includes('leather')) materials.push('leather');
  if (titleLower.includes('aluminum') || titleLower.includes('aluminium')) materials.push('aluminum alloy');
  if (titleLower.includes('abs')) materials.push('durable ABS plastic');
  if (titleLower.includes('tpe')) materials.push('TPE (thermoplastic elastomer)');
  if (titleLower.includes('rubber')) materials.push('rubber');
  if (titleLower.includes('tempered glass')) materials.push('9H tempered glass');
  if (titleLower.includes('stainless')) materials.push('stainless steel');

  // Feature detection
  const features: string[] = [];
  if (titleLower.includes('wireless')) features.push('wireless functionality');
  if (titleLower.includes('led')) features.push('LED illumination');
  if (titleLower.includes('waterproof') || titleLower.includes('water-resistant')) features.push('waterproof design');
  if (titleLower.includes('anti-slip') || titleLower.includes('non-slip')) features.push('anti-slip surface');
  if (titleLower.includes('magnetic') || titleLower.includes('magsafe')) features.push('magnetic mounting');
  if (titleLower.includes('foldable') || titleLower.includes('collapsible')) features.push('foldable design');

  // Start with the main description
  description = `The ${title} is a ${quantity ? quantity + '-piece ' : ''}${categoryName.toLowerCase()} designed specifically for the Tesla ${modelNames}. `;

  // Add material info
  if (materials.length > 0) {
    description += `Made from ${materials.join(' and ')}. `;
  }

  // Add feature info
  if (features.length > 0) {
    description += `Key features include ${features.join(', ')}. `;
  }

  // Add installation and fit info
  description += `Most installations take 10-30 minutes without tools. Custom-fit for your Tesla model. `;

  // Add value proposition
  description += `Sold by ${source}, this product comes with their standard warranty and return policy for your peace of mind.`;

  return description;
}

function generateProductFeatures(title: string, category: string): string[] {
  const titleLower = title.toLowerCase();
  const features: string[] = [];

  // Features based on product keywords
  if (titleLower.includes('leather')) {
    features.push('Leather');
  }
  if (titleLower.includes('waterproof') || titleLower.includes('water')) {
    features.push('Waterproof');
  }
  if (titleLower.includes('wireless')) {
    features.push('Wireless');
  }
  if (titleLower.includes('led') || titleLower.includes('light')) {
    features.push('LED');
  }
  if (titleLower.includes('carbon') || titleLower.includes('fiber')) {
    features.push('Carbon fiber');
  }
  if (titleLower.includes('matte')) {
    features.push('Matte finish');
  }
  if (titleLower.includes('glossy')) {
    features.push('Glossy finish');
  }
  if (titleLower.includes('organizer') || titleLower.includes('storage')) {
    features.push('Storage space');
  }

  // Add category-based features
  const categoryFeatures = CATEGORY_BENEFITS[category] || CATEGORY_BENEFITS['default'];
  for (const f of categoryFeatures) {
    if (!features.includes(f) && features.length < 6) {
      features.push(f);
    }
  }

  return features.slice(0, 6);
}

export default function ProductPageClient({
  product,
  similarProducts
}: {
  product: Product;
  similarProducts: Product[];
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'shipping'>('overview');
  const [showEmail, setShowEmail] = useState(false);

  const discountInfo = getDiscountInfo(product.url);
  const affiliateUrl = getAffiliateUrl(product.url);
  const cleanedDescription = cleanDescription(product.description || '');
  const modelNames = getModelNames(product.models);
  const features = generateProductFeatures(product.title, product.category);
  const storeInfo = STORE_INFO[product.source] || STORE_INFO['default'];

  const discountedPrice = discountInfo
    ? (product.price * (1 - discountInfo.percent / 100)).toFixed(2)
    : null;

  const savingsAmount = discountInfo
    ? (product.price - parseFloat(discountedPrice!)).toFixed(2)
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header */}
      <header style={{
        background: '#0a0a0a',
        padding: '14px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid #222'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
            EV<span style={{ color: '#E82127' }}>PriceHunt</span>
          </Link>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Link href="/" style={{ color: '#a3a3a3', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              All Products
            </Link>
            <Link href="/top-10" style={{ color: '#fbbf24', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Top 10
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#6b7280' }}>
            <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href={`/?category=${product.category}`} style={{ color: '#6b7280', textDecoration: 'none' }}>
              {formatCategory(product.category)}
            </Link>
            <span>›</span>
            <span style={{ color: '#111' }}>{product.title.slice(0, 50)}...</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: 48 }}>

          {/* Left Column */}
          <div>
            {/* Product Image */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
              marginBottom: 24
            }}>
              <div style={{ position: 'relative' }}>
                {product.image ? (
                  <div style={{ aspectRatio: '4/3', background: '#fafafa' }}>
                    <img
                      src={product.image}
                      alt={product.title}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 32 }}
                    />
                  </div>
                ) : (
                  <div style={{
                    aspectRatio: '4/3',
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    fontSize: 16
                  }}>
                    No Image Available
                  </div>
                )}

                {/* Badges */}
                <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
                  {discountInfo && (
                    <div style={{
                      background: '#dc2626',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700
                    }}>
                      {discountInfo.percent}% OFF
                    </div>
                  )}
                  <div style={{
                    background: '#0a0a0a',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600
                  }}>
                    {product.source}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              {/* Tab Headers */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'specs', label: 'Specifications' },
                  { id: 'shipping', label: 'Shipping & Returns' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    style={{
                      flex: 1,
                      padding: '16px 20px',
                      fontSize: 14,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: activeTab === tab.id ? '#fff' : '#f9fafb',
                      color: activeTab === tab.id ? '#111' : '#6b7280',
                      borderBottom: activeTab === tab.id ? '2px solid #E82127' : '2px solid transparent',
                      marginBottom: -1
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{ padding: 24 }}>
                {activeTab === 'overview' && (
                  <div>
                    {/* Product Description */}
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#111' }}>
                      About This Product
                    </h2>
                    <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, marginBottom: 20 }}>
                      {cleanedDescription || generateProductDescription(product.title, product.category, product.models, product.source)}
                    </p>

                    {/* Why This Category */}
                    <div style={{
                      background: '#f9fafb',
                      borderRadius: 12,
                      padding: 20,
                      marginBottom: 28,
                      borderLeft: '4px solid #E82127'
                    }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: '#111' }}>
                        Why Do You Need {formatCategory(product.category)}?
                      </h3>
                      <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
                        {CATEGORY_DESCRIPTIONS[product.category] || CATEGORY_DESCRIPTIONS['default']}
                      </p>
                    </div>

                    {/* Key Features */}
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111' }}>
                      Key Features & Benefits
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
                      {features.map((feature, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
                          <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: '#dcfce7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            color: '#16a34a',
                            flexShrink: 0
                          }}>
                            ✓
                          </div>
                          <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Installation Guide */}
                    {(() => {
                      const guide = INSTALLATION_GUIDES[product.category] || INSTALLATION_GUIDES['default'];
                      return (
                        <div style={{ marginBottom: 28 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111' }}>
                            Installation Guide
                          </h3>
                          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                            <div style={{ background: '#f0fdf4', padding: '10px 16px', borderRadius: 8 }}>
                              <span style={{ fontSize: 12, color: '#6b7280' }}>Time</span>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#16a34a' }}>{guide.time}</div>
                            </div>
                            <div style={{ background: '#fef3c7', padding: '10px 16px', borderRadius: 8 }}>
                              <span style={{ fontSize: 12, color: '#6b7280' }}>Difficulty</span>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>{guide.difficulty}</div>
                            </div>
                            <div style={{ background: '#f3f4f6', padding: '10px 16px', borderRadius: 8 }}>
                              <span style={{ fontSize: 12, color: '#6b7280' }}>Tools</span>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{guide.tools}</div>
                            </div>
                          </div>
                          <ol style={{ paddingLeft: 20, margin: 0 }}>
                            {guide.steps.map((step, i) => (
                              <li key={i} style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.8, marginBottom: 8 }}>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      );
                    })()}

                    {/* Buying Guide */}
                    {(() => {
                      const buyingGuide = BUYING_GUIDES[product.category] || BUYING_GUIDES['default'];
                      return (
                        <div style={{ marginBottom: 28 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111' }}>
                            {formatCategory(product.category)} Buying Guide
                          </h3>

                          <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#111' }}>
                            What to Look For
                          </h4>
                          <ul style={{ paddingLeft: 20, margin: '0 0 20px 0' }}>
                            {buyingGuide.considerations.map((item, i) => (
                              <li key={i} style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 6 }}>
                                {item}
                              </li>
                            ))}
                          </ul>

                          <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#dc2626' }}>
                            What to Avoid
                          </h4>
                          <ul style={{ paddingLeft: 20, margin: '0 0 20px 0' }}>
                            {buyingGuide.whatToAvoid.map((item, i) => (
                              <li key={i} style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 6 }}>
                                {item}
                              </li>
                            ))}
                          </ul>

                          <div style={{ background: '#f9fafb', padding: '14px 18px', borderRadius: 8 }}>
                            <span style={{ fontSize: 13, color: '#6b7280' }}>Typical Price Range:</span>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginTop: 4 }}>{buyingGuide.priceRange}</div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Maintenance Tips */}
                    {(() => {
                      const tips = MAINTENANCE_TIPS[product.category] || MAINTENANCE_TIPS['default'];
                      return (
                        <div style={{ marginBottom: 28 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111' }}>
                            Care & Maintenance Tips
                          </h3>
                          <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 20, border: '1px solid #bae6fd' }}>
                            <ul style={{ paddingLeft: 20, margin: 0 }}>
                              {tips.map((tip, i) => (
                                <li key={i} style={{ fontSize: 14, color: '#0369a1', lineHeight: 1.7, marginBottom: 8 }}>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Compatibility note */}
                    <div style={{
                      background: '#fef3c7',
                      borderRadius: 12,
                      padding: 16,
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start'
                    }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#fbbf24',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        color: '#fff',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>!</div>
                      <div>
                        <p style={{ fontSize: 14, color: '#92400e', margin: 0, fontWeight: 600 }}>
                          Compatibility Check
                        </p>
                        <p style={{ fontSize: 14, color: '#92400e', margin: '6px 0 0 0', lineHeight: 1.6 }}>
                          This product is designed for Tesla {modelNames} ({product.models?.filter(m => m !== 'universal').map(m => MODEL_YEARS[m] || 'All Years').join(', ') || 'All Years'}).
                          Please verify your exact model and year before purchasing. If you&apos;re unsure about compatibility, contact {product.source} customer support.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111' }}>
                      Technical Specifications
                    </h2>
                    <div style={{ display: 'grid', gap: 0 }}>
                      {[
                        { label: 'Category', value: formatCategory(product.category) },
                        { label: 'Compatible Models', value: modelNames },
                        { label: 'Model Years', value: product.models?.filter(m => m !== 'universal').map(m => MODEL_YEARS[m] || 'All Years').join(', ') || 'All Years' },
                        { label: 'Sold By', value: product.source },
                        { label: 'Brand', value: product.vendor || product.source },
                        { label: 'Price', value: `$${product.price.toFixed(2)} USD` },
                        { label: 'SKU', value: `TPC-${product.sourceId?.slice(0, 8) || 'N/A'}` },
                      ].map((spec, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '14px 0',
                            borderBottom: '1px solid #f3f4f6',
                            fontSize: 14
                          }}
                        >
                          <span style={{ color: '#6b7280' }}>{spec.label}</span>
                          <span style={{ color: '#111', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111' }}>
                      Shipping & Returns
                    </h2>

                    <div style={{ display: 'grid', gap: 20 }}>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#374151'
                        }}>
                          SHIP
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 4 }}>
                            Shipping Policy
                          </div>
                          <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                            {storeInfo.shipping}. Most orders ship within 1-3 business days.
                            International shipping available to most countries.
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#374151'
                        }}>
                          RET
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 4 }}>
                            Return Policy
                          </div>
                          <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                            {storeInfo.returns} for unused items in original packaging.
                            Contact {product.source} customer service to initiate a return.
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#374151'
                        }}>
                          WTY
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 4 }}>
                            Warranty
                          </div>
                          <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                            Products are covered by manufacturer warranty.
                            Contact {product.source} for warranty claims and support.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Purchase Card */}
          <div>
            <div style={{ position: 'sticky', top: 80 }}>
              {/* Main Purchase Card */}
              <div style={{
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                marginBottom: 16
              }}>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
                  {/* Model Tags */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                    {product.models?.filter(m => m !== 'universal').slice(0, 3).map(model => (
                      <span
                        key={model}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '4px 10px',
                          background: '#f3f4f6',
                          color: '#374151',
                          borderRadius: 6
                        }}
                      >
                        {MODEL_LABELS[model] || model}
                      </span>
                    ))}
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '4px 10px',
                      background: '#fef3c7',
                      color: '#92400e',
                      borderRadius: 6
                    }}>
                      {formatCategory(product.category)}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#111',
                    lineHeight: 1.3,
                    marginBottom: 8
                  }}>
                    {product.title}
                  </h1>

                  {/* Compatibility */}
                  <p style={{ fontSize: 13, color: '#6b7280' }}>
                    Fits: {modelNames}
                  </p>
                </div>

                {/* Price Section */}
                <div style={{ padding: '20px 24px', background: '#fafafa' }}>
                  {discountInfo ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                        <span style={{ fontSize: 36, fontWeight: 800, color: '#16a34a' }}>
                          ${discountedPrice}
                        </span>
                        <span style={{ fontSize: 18, color: '#9ca3af', textDecoration: 'line-through' }}>
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 14,
                        color: '#16a34a',
                        fontWeight: 600
                      }}>
                        You save ${savingsAmount} ({discountInfo.percent}% off)
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 36, fontWeight: 800, color: '#111' }}>
                      ${product.price.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Discount Code */}
                {discountInfo && (
                  <div style={{ padding: '0 24px 24px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      borderRadius: 12,
                      padding: '16px 20px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8
                      }}>
                        <div>
                          <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>
                            Exclusive Discount Code
                          </div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                            Copy and apply at checkout
                          </div>
                        </div>
                        <div style={{
                          background: '#fff',
                          padding: '10px 20px',
                          borderRadius: 8,
                          fontFamily: 'monospace',
                          fontSize: 18,
                          fontWeight: 800,
                          color: '#15803d',
                          letterSpacing: '0.1em'
                        }}>
                          {discountInfo.code}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <div style={{ padding: '0 24px 24px' }}>
                  <a
                    href={affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '18px 24px',
                      background: '#E82127',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: 12,
                      fontSize: 16,
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 14px rgba(232, 33, 39, 0.35)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#c81d22';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(232, 33, 39, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#E82127';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(232, 33, 39, 0.35)';
                    }}
                  >
                    {discountInfo ? (
                      <>
                        Visit {product.source} - {discountInfo.percent}% Off
                        <span style={{ fontSize: 18 }}>→</span>
                      </>
                    ) : (
                      <>
                        Visit {product.source}
                        <span style={{ fontSize: 18 }}>→</span>
                      </>
                    )}
                  </a>

                  <p style={{
                    fontSize: 12,
                    color: '#9ca3af',
                    textAlign: 'center',
                    marginTop: 12
                  }}>
                    Secure checkout on {product.source}
                  </p>
                </div>
              </div>

              {/* Store Info Card */}
              <div style={{
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                padding: 20
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#374151'
                  }}>
                    {product.source.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>{product.source}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>Verified Tesla Accessories Seller</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: '#f9fafb', padding: '12px 14px', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Rating</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{storeInfo.rating}/5</div>
                  </div>
                  <div style={{ background: '#f9fafb', padding: '12px 14px', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Since</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{storeInfo.established}</div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: 16,
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: '1px solid #f3f4f6'
                }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {storeInfo.shipping.split('.')[0]}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {storeInfo.returns}
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 20,
                marginTop: 16,
                padding: '16px 20px',
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', marginBottom: 2 }}>SSL</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Secure</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', marginBottom: 2 }}>✓</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Verified</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 2 }}>FAST</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Shipping</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 2 }}>SAFE</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Payment</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {(() => {
          const partnerProducts = similarProducts.filter(p => isAffiliatePartner(p.url));
          if (partnerProducts.length === 0) return null;

          return (
            <section style={{ marginTop: 64 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24
              }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111' }}>
                  You Might Also Like
                </h2>
                <Link href="/" style={{
                  fontSize: 14,
                  color: '#E82127',
                  textDecoration: 'none',
                  fontWeight: 600
                }}>
                  View All →
                </Link>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 20
              }}>
                {partnerProducts.slice(0, 8).map((p, idx) => {
                  const pDiscount = getDiscountInfo(p.url);
                  return (
                    <Link
                      key={idx}
                      href={`/product/${generateSlug(p.title)}`}
                      style={{
                        background: '#fff',
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        {p.image && (
                          <div style={{ aspectRatio: '4/3', background: '#f9fafb', overflow: 'hidden' }}>
                            <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        {pDiscount && (
                          <div style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: '#16a34a',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700
                          }}>
                            {pDiscount.percent}% OFF
                          </div>
                        )}
                      </div>
                      <div style={{ padding: 16 }}>
                        <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{p.source}</p>
                        <p style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#111',
                          marginBottom: 10,
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: 40
                        }}>
                          {p.title}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>
                            ${p.price.toFixed(0)}
                          </span>
                          {pDiscount && (
                            <span style={{
                              fontSize: 11,
                              color: '#16a34a',
                              fontWeight: 600,
                              background: '#dcfce7',
                              padding: '3px 8px',
                              borderRadius: 4
                            }}>
                              Code: {pDiscount.code}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })()}

        {/* Internal Linking - Related Categories & Models */}
        <section style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 24 }}>
            Explore More Tesla Accessories
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {/* Shop by Model */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              padding: 24
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 16 }}>
                Shop by Tesla Model
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {[
                  { slug: 'model-3', name: 'Model 3', years: '2017-2023' },
                  { slug: 'highland', name: 'Model 3 Highland', years: '2024+' },
                  { slug: 'model-y', name: 'Model Y', years: '2020-2024' },
                  { slug: 'juniper', name: 'Model Y Juniper', years: '2025+' },
                  { slug: 'model-s', name: 'Model S', years: '2012+' },
                  { slug: 'model-x', name: 'Model X', years: '2015+' },
                  { slug: 'cybertruck', name: 'Cybertruck', years: '2024+' },
                ].map(model => (
                  <Link
                    key={model.slug}
                    href={`/model/${model.slug}`}
                    style={{
                      display: 'inline-block',
                      padding: '10px 16px',
                      background: product.models?.includes(model.slug) ? '#fee2e2' : '#f3f4f6',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 500,
                      color: product.models?.includes(model.slug) ? '#dc2626' : '#374151',
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {model.name}
                    <span style={{ display: 'block', fontSize: 11, color: '#6b7280', marginTop: 2 }}>{model.years}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Shop by Category */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              padding: 24
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 16 }}>
                Popular Categories
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {[
                  { slug: 'floor-mats', name: 'Floor Mats' },
                  { slug: 'screen-protectors', name: 'Screen Protectors' },
                  { slug: 'cargo-mats', name: 'Cargo Mats' },
                  { slug: 'sunshade', name: 'Sunshades' },
                  { slug: 'seat-covers', name: 'Seat Covers' },
                  { slug: 'wheel-covers', name: 'Wheel Covers' },
                  { slug: 'charging', name: 'Charging' },
                  { slug: 'lighting', name: 'Lighting' },
                  { slug: 'center-console', name: 'Center Console' },
                  { slug: 'mud-flaps', name: 'Mud Flaps' },
                ].map(cat => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    style={{
                      display: 'inline-block',
                      padding: '8px 14px',
                      background: product.category === cat.slug ? '#fef3c7' : '#f3f4f6',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 500,
                      color: product.category === cat.slug ? '#92400e' : '#374151',
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Common Accessories Recommendation */}
          <div style={{
            marginTop: 24,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: 16,
            padding: 32,
            color: '#fff'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              Popular {modelNames.split(',')[0]} Accessories
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 20, lineHeight: 1.6 }}>
              Most Tesla owners start with: <strong>Floor mats</strong> to protect the carpet,
              a <strong>screen protector</strong> for the touchscreen, and a <strong>sunshade</strong> for hot days.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href={`/category/floor-mats`} style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#fff',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 500,
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                Browse Floor Mats
              </Link>
              <Link href={`/category/screen-protectors`} style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#fff',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 500,
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                Browse Screen Protectors
              </Link>
              <Link href={`/category/sunshade`} style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#fff',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 500,
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                Browse Sunshades
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ marginTop: 64 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111', marginBottom: 12 }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 600, margin: '0 auto' }}>
              Everything you need to know about this {formatCategory(product.category).toLowerCase()} for your Tesla
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20
          }}>
            {[
              {
                q: `Is this ${formatCategory(product.category).toLowerCase()} compatible with my Tesla?`,
                a: `This product is specifically designed for Tesla ${modelNames}. It fits model years ${product.models?.filter(m => m !== 'universal').map(m => MODEL_YEARS[m] || 'All Years').join(', ') || 'All Years'}. Before ordering, verify your Tesla\'s model year by checking the vehicle identification plate or your Tesla app.`
              },
              {
                q: 'How do I install this product?',
                a: (() => {
                  const guide = INSTALLATION_GUIDES[product.category] || INSTALLATION_GUIDES['default'];
                  return `Installation typically takes ${guide.time} and is rated as ${guide.difficulty}. ${guide.tools === 'None required' ? 'No tools are required.' : `You will need: ${guide.tools}.`} Detailed step-by-step instructions are included with the product.`;
                })()
              },
              {
                q: 'How do I get the best price on this product?',
                a: discountInfo
                  ? `Use the exclusive discount code "${discountInfo.code}" at checkout on ${product.source} to save ${discountInfo.percent}% off the regular price of $${product.price.toFixed(2)}. This brings your final price to just $${(product.price * (1 - discountInfo.percent / 100)).toFixed(2)}.`
                  : `The current price at ${product.source} is $${product.price.toFixed(2)}. Check our site regularly for exclusive discount codes and seasonal promotions. Signing up for ${product.source}'s newsletter may also unlock first-time buyer discounts.`
              },
              {
                q: `What is ${product.source}'s return policy?`,
                a: `${product.source} offers ${storeInfo.returns} for items in original, unused condition with all packaging and tags intact. To initiate a return, contact ${product.source} customer service with your order number. Refunds are typically processed within 5-7 business days after the return is received.`
              },
              {
                q: 'How long does shipping take?',
                a: `${storeInfo.shipping}. Orders are typically processed and shipped within 1-3 business days. Standard delivery takes 5-10 business days depending on your location. Expedited shipping options may be available at checkout. International shipping is available to most countries.`
              },
              {
                q: 'What materials is this product made from?',
                a: (() => {
                  const titleLower = product.title.toLowerCase();
                  if (titleLower.includes('tpe')) return 'Made from TPE (thermoplastic elastomer). TPE handles temperatures from -58°F to 176°F, is odorless and non-toxic, and can be recycled.';
                  if (titleLower.includes('carbon fiber')) return 'Made from real carbon fiber with UV-resistant clear coating. Carbon fiber is lightweight and strong, with a distinctive woven pattern.';
                  if (titleLower.includes('tempered glass')) return 'Made from 9H hardness tempered glass, which resists scratches from keys and coins. Most include oleophobic coating to reduce fingerprints.';
                  if (titleLower.includes('silicone')) return 'Made from silicone, which is flexible, heat-resistant, and non-toxic. Works well across a wide temperature range.';
                  if (titleLower.includes('aluminum') || titleLower.includes('aluminium')) return 'Made from aluminum alloy. The anodized finish resists corrosion and scratches.';
                  return `Check the ${product.source} product page for specific material details.`;
                })()
              },
              {
                q: 'Does this come with a warranty?',
                a: `Products from ${product.source} are covered by their standard manufacturer warranty, which protects against defects in materials and workmanship. For warranty claims or product issues, contact ${product.source} customer service with your order details and photos of any defects. ${product.source} has been a trusted Tesla accessories seller since ${storeInfo.established}.`
              },
              {
                q: 'How do I care for and maintain this product?',
                a: (() => {
                  const tips = MAINTENANCE_TIPS[product.category] || MAINTENANCE_TIPS['default'];
                  return `For best results: ${tips.slice(0, 2).join(' ')} Regular maintenance will extend the life of your ${formatCategory(product.category).toLowerCase()} and keep it looking new.`;
                })()
              },
              {
                q: 'Is this an official Tesla product?',
                a: `This is an aftermarket accessory from ${product.vendor || product.source}, not an official Tesla product. Many aftermarket products are designed specifically for Tesla and can match or beat OEM at lower prices. ${product.source} specializes in Tesla accessories.`
              },
              {
                q: 'What if this product doesn\'t fit my Tesla?',
                a: `If the product doesn\'t fit correctly, ${product.source} offers ${storeInfo.returns}. Before installing, always do a test fit to verify compatibility. If you have fitment issues, contact ${product.source} customer service—they may be able to help troubleshoot or offer an exchange for the correct variant. Keep the original packaging until you\'ve confirmed the product fits properly.`
              }
            ].map((faq, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  padding: 24
                }}
              >
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 10, lineHeight: 1.4 }}>
                  {faq.q}
                </h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#0a0a0a',
        color: '#9ca3af',
        padding: '48px 24px',
        marginTop: 64
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
                EV<span style={{ color: '#E82127' }}>PriceHunt</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                Find the best prices on Tesla accessories from verified retailers with exclusive discount codes.
              </p>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Shop by Model</div>
              {['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'].map(m => (
                <Link key={m} href={`/model/${m.toLowerCase().replace(' ', '-')}`} style={{ display: 'block', fontSize: 13, color: '#9ca3af', textDecoration: 'none', marginBottom: 8 }}>
                  {m} Accessories
                </Link>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Categories</div>
              {['Floor Mats', 'Screen Protectors', 'Charging', 'Interior', 'Exterior'].map(c => (
                <Link key={c} href={`/category/${c.toLowerCase().replace(' ', '-')}`} style={{ display: 'block', fontSize: 13, color: '#9ca3af', textDecoration: 'none', marginBottom: 8 }}>
                  {c}
                </Link>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Our Partners</div>
              {['Tesery', 'Tesmanian', 'Yeslak', 'Jowua', 'Hansshow'].map(s => (
                <span key={s} style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>
                  {s}
                </span>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Contact Us</div>
              <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6, marginBottom: 12 }}>
                Have questions, feedback, or partnership inquiries? We&apos;d love to hear from you.
              </p>
              {showEmail ? (
                <a
                  href="mailto:kontakt@statika-as.com"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: '#E82127',
                    textDecoration: 'none',
                    padding: '8px 12px',
                    background: 'rgba(232, 33, 39, 0.1)',
                    borderRadius: 6
                  }}
                >
                  <span>kontakt@statika-as.com</span>
                </a>
              ) : (
                <button
                  onClick={() => setShowEmail(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: '#fff',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>Show Email Address</span>
                </button>
              )}
              <p style={{ fontSize: 11, color: '#6b7280', marginTop: 12 }}>
                Operated by Statika AS, Norway
              </p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #333', paddingTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 12 }}>
              © 2026 EVPriceHunt. Not affiliated with Tesla, Inc. All prices subject to change.
            </p>
          </div>
        </div>
      </footer>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 1024px) {
          main > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          section > div:last-child {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          section > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
