// Configuration for all Tesla accessories sites
export const SITES = [
  {
    name: 'Tesla Official',
    id: 'tesla',
    baseUrl: 'https://shop.tesla.com',
    collectionsUrl: 'https://shop.tesla.com/category/vehicle-accessories',
    selectors: {
      productList: '.product-tile, .product-card, [data-testid="product"]',
      title: '.product-tile__name, .product-name, h3',
      price: '.product-tile__price, .price',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'scroll', maxPages: 5 }
  },
  {
    name: 'Tesmanian',
    id: 'tesmanian',
    baseUrl: 'https://www.tesmanian.com',
    collectionsUrls: [
      'https://www.tesmanian.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, .product-item__title, h3 a',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'Tesery',
    id: 'tesery',
    baseUrl: 'https://www.tesery.com',
    collectionsUrls: [
      'https://www.tesery.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid-product',
      title: '.product-card__title, .product-title, h3',
      price: '.price, .money, .product-price',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'Teslarati Shop',
    id: 'teslarati',
    baseUrl: 'https://shop.teslarati.com',
    collectionsUrls: [
      'https://shop.teslarati.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3 a, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'Yeslak',
    id: 'yeslak',
    baseUrl: 'https://www.yeslak.com',
    collectionsUrls: [
      'https://www.yeslak.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'Accessories For Tesla',
    id: 'aft',
    baseUrl: 'https://www.accessoriesfortesla.com',
    collectionsUrls: [
      'https://www.accessoriesfortesla.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'Teslahubs',
    id: 'teslahubs',
    baseUrl: 'https://teslahubs.com',
    collectionsUrls: [
      'https://teslahubs.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'Tesloid',
    id: 'tesloid',
    baseUrl: 'https://tesloid.com',
    collectionsUrls: [
      'https://tesloid.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'EVANNEX',
    id: 'evannex',
    baseUrl: 'https://evannex.com',
    collectionsUrls: [
      'https://evannex.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'Abstract Ocean',
    id: 'abstractocean',
    baseUrl: 'https://abstractocean.com',
    collectionsUrls: [
      'https://abstractocean.com/collections/all'
    ],
    selectors: {
      productList: '.product-item, .product-card, .grid__item',
      title: '.product-item-meta__title, h3, .product-title',
      price: '.price-list .price, .price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'RPM Tesla',
    id: 'rpmtesla',
    baseUrl: 'https://www.rpmtesla.com',
    collectionsUrls: [
      'https://www.rpmtesla.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'TESBROS',
    id: 'tesbros',
    baseUrl: 'https://tesbros.com',
    collectionsUrls: [
      'https://tesbros.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'Hansshow',
    id: 'hansshow',
    baseUrl: 'https://www.hautopart.com',
    collectionsUrls: [
      'https://www.hautopart.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'TapTes',
    id: 'taptes',
    baseUrl: 'https://www.taptes.com',
    collectionsUrls: [
      'https://www.taptes.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'Topfit',
    id: 'topfit',
    baseUrl: 'https://topfit.com',
    collectionsUrls: [
      'https://topfit.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'Tesloid',
    id: 'tesloid',
    baseUrl: 'https://tesloid.com',
    collectionsUrls: [
      'https://tesloid.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'Accessories for Tesla',
    id: 'accessoriesfortesla',
    baseUrl: 'https://www.accessoriesfortesla.com',
    collectionsUrls: [
      'https://www.accessoriesfortesla.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'EV Sportline',
    id: 'evsportline',
    baseUrl: 'https://evsportline.com',
    collectionsUrls: [
      'https://evsportline.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'Proven Tesla',
    id: 'proventesla',
    baseUrl: 'https://proventesla.com',
    collectionsUrls: [
      'https://proventesla.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'Tesla Offered',
    id: 'teslaoffered',
    baseUrl: 'https://teslaoffered.com',
    collectionsUrls: [
      'https://teslaoffered.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'Jowua',
    id: 'jowua',
    baseUrl: 'https://www.jowua.com',
    collectionsUrls: [
      'https://www.jowua.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'Tesla Icons',
    id: 'teslaicons',
    baseUrl: 'https://teslaicons.com',
    collectionsUrls: [
      'https://teslaicons.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  },
  {
    name: 'TESLAXS',
    id: 'teslaxs',
    baseUrl: 'https://teslaxs.com',
    collectionsUrls: [
      'https://teslaxs.com/collections/all'
    ],
    selectors: {
      productList: '.product-card, .product-item, .grid__item',
      title: '.product-card__title, h3, .product-title',
      price: '.price, .money',
      image: 'img',
      link: 'a'
    },
    pagination: { type: 'url', param: 'page', maxPages: 10 }
  }
];

// Product categories for matching (order matters - first match wins)
export const PRODUCT_CATEGORIES = [
  // Exterior body parts
  { id: 'spoiler', keywords: ['spoiler', 'rear wing', 'trunk wing', 'lip spoiler', 'duckbill'] },
  { id: 'diffuser', keywords: ['diffuser', 'rear diffuser'] },
  { id: 'side-skirts', keywords: ['side skirt', 'rocker panel', 'side splitter'] },
  { id: 'front-lip', keywords: ['front lip', 'front splitter', 'front bumper lip', 'lower bumper'] },
  { id: 'mirror-covers', keywords: ['mirror cover', 'side mirror', 'mirror cap', 'mirror trim', 'mirror replacement', 'rearview mirror cover'] },
  { id: 'door-handles', keywords: ['door handle', 'handle cover', 'handle wrap'] },
  { id: 'mud-flaps', keywords: ['mud flap', 'splash guard', 'mudguard'] },

  // Interior - Mats & Liners
  { id: 'floor-mats', keywords: ['floor mat', 'floor liner', 'all-weather mat', 'carpet mat', 'rubber mat'] },
  { id: 'cargo-mats', keywords: ['cargo mat', 'cargo liner', 'trunk mat', 'trunk liner', 'trunk well', 'cargo cover', 'trunk cover'] },
  { id: 'frunk', keywords: ['frunk', 'front trunk'] },

  // Interior - Storage & Organization
  { id: 'center-console', keywords: ['center console', 'console wrap', 'console cover', 'console organizer', 'armrest box', 'armrest storage', 'console storage', 'console tray'] },
  { id: 'storage', keywords: ['storage box', 'storage bin', 'organizer', 'glove box', 'door pocket', 'underseat storage', 'seat back storage', 'sunglasses holder', 'sunglass holder', 'glasses case', 'visor', 'door storage', 'tissue box', 'side protector', 'privacy box', 'seat gap filler', 'gap filler', 'seat gap', 'storage pack', 'storage tray'] },
  { id: 'cup-holder', keywords: ['cup holder', 'cupholder', 'drink holder', 'cup insert'] },
  { id: 'hooks', keywords: ['trunk hook', 'seat hook', 'cargo hook', 'bag hook', 'umbrella holder', 'seat back hook', 'hidden hook'] },
  { id: 'trash-can', keywords: ['trash can', 'garbage', 'trash bin', 'waste bin'] },

  // Interior - Trim & Covers
  { id: 'interior-trim', keywords: ['door panel', 'trim cover', 'dashboard cover', 'dash cover', 'door trim', 'pillar cover', 'alcantara', 'overlay', 'applique', 'a-pillar', 'b-pillar', 'c-pillar', 'carbon fiber door', 'carbon fiber dash', 'door protection kit', 'interior kit', 'interior protection', 'front end inlay'] },
  { id: 'door-sill', keywords: ['door sill', 'sill protector', 'sill guard', 'threshold', 'door edge guard', 'door edge protector'] },
  { id: 'seat-covers', keywords: ['seat cover', 'seat cushion', 'seat protector', 'kick mat', 'kick protector', 'seat back cover', 'seat back mat', 'seats back cover', 'seat back protector', 'kick guard', 'anti-kick', 'ice silk cushion', 'seat cushion pad'] },
  { id: 'armrest', keywords: ['armrest pad', 'armrest cover', 'arm rest', 'armrest cushion'] },
  { id: 'headrest', keywords: ['headrest', 'head rest', 'neck pillow', 'neck support', 'leg cushion', 'leg support'] },
  { id: 'door-seal', keywords: ['door seal', 'seal kit', 'wind noise', 'noise reduction seal', 'weatherstrip', 'weather strip'] },
  { id: 'anti-collision', keywords: ['anti-collision', 'collision strip', 'edge protector', 'door edge'] },

  // Steering & Controls
  { id: 'steering-wheel', keywords: ['steering wheel', 'yoke', 'wheel cover', 'wheel wrap', 'steering cover'] },
  { id: 'gear-shift', keywords: ['gear shift', 'gear stalk', 'turn signal', 'shift lever', 'stalk cover'] },
  { id: 'pedals', keywords: ['pedal', 'pedal cover', 'foot rest', 'dead pedal', 'pedal set'] },

  // Electronics & Displays
  { id: 'display', keywords: ['dashboard display', 'instrument cluster', 'screen display', 'heads up', 'hud', 'touch screen', 'lcd display', 'screen swivel', 'screen mount', 'rotating mount', 'screen frame'] },
  { id: 'screen-protectors', keywords: ['screen protector', 'display protector', 'tempered glass', 'screen protection', 'glass protector', 'matte screen', 'anti-glare screen'] },
  { id: 'phone-mount', keywords: ['phone mount', 'phone holder', 'phone stand', 'tablet holder', 'magnetic mount', 'vacuum mount', 'phone display', 'parking phone'] },
  { id: 'wireless-charger', keywords: ['wireless charger', 'phone charger', 'qi charger', 'charging pad', 'charging frame', 'wireless charging'] },
  { id: 'usb-hub', keywords: ['usb hub', 'usb dock', 'docking station', 'usb adapter', 'usb port', 'charging port'] },
  { id: 'dashcam', keywords: ['dashcam', 'dash cam', 'sentry usb', 'sentry drive', 'rearview camera', 'streaming mirror', 'rear view mirror camera', 'streaming rearview', 'mirror recorder', 'dvr'] },

  // Lighting
  { id: 'lighting', keywords: ['led', 'light', 'puddle light', 'ambient light', 'footwell', 'headlight', 'taillight', 'fog light', 'interior light', 'door light', 'trunk light', 'frunk light'] },

  // Charging & Power
  { id: 'charger', keywords: ['wall connector', 'mobile connector', 'ev charger', 'charging cable', 'charge port', 'nema', 'j1772', 'ccs adapter', 'nacs adapter', 'charging adapter', 'tesla charger', 'home charging', 'level 2 charger', 'charging station'] },
  { id: 'power-adapter', keywords: ['power adapter', 'power supply', 'v2l', 'power bank', 'battery pack', 'inverter', 'discharger', 'vehicle to load', '12v battery', 'auxiliary battery'] },

  // Starlink
  { id: 'starlink', keywords: ['starlink', 'starlink mini', 'starlink gen'] },

  // Protection
  { id: 'ppf', keywords: ['ppf', 'paint protection', 'clear bra', 'vinyl wrap', 'chrome delete', 'paint film', 'protection film', 'diy ppf', 'colored ppf'] },
  { id: 'bumper-protector', keywords: ['bumper protector', 'bumper guard', 'tailgate protector', 'trunk protector', 'rear bumper'] },
  { id: 'wheel-covers', keywords: ['wheel cover', 'hubcap', 'wheel cap', 'aero cover', 'hub cap', 'rim protector', 'nova wheel', 'aftermarket wheel', 'forged wheel'] },

  // Privacy & Shading
  { id: 'sunshade', keywords: ['sunshade', 'sun shade', 'windshield shade', 'roof shade', 'sunroof shade', 'retractable shade', 'glass roof shade', 'retractable sunshade', 'electric sunshade'] },
  { id: 'privacy', keywords: ['privacy shade', 'window shade', 'window tint', 'privacy curtain', 'divider curtain', 'side shade', 'privacy screen'] },

  // Keys & Accessories
  { id: 'key-accessories', keywords: ['key cover', 'key fob', 'key case', 'key chain', 'keychain', 'key holder', 'key protector', 'card holder', 'key card'] },

  // Emblems & Decals
  { id: 'emblems', keywords: ['emblem', 'badge', 'logo', 'decal', 'sticker', 'lettering', 'nameplate', 'label decoration', 'side label'] },

  // License Plate
  { id: 'license-plate', keywords: ['license plate', 'plate frame', 'plate holder', 'plate bracket'] },

  // Exterior Accessories
  { id: 'roof-rack', keywords: ['roof rack', 'roof box', 'roof carrier', 'crossbar', 'roof rail'] },
  { id: 'bike-rack', keywords: ['bike rack', 'bicycle', 'hitch rack', 'bike carrier', 'bike tailgate', 'tailgate shield'] },
  { id: 'tow', keywords: ['tow hitch', 'trailer hitch', 'tow hook', 'd-ring', 'tow cover'] },

  // Comfort & Air
  { id: 'air-freshener', keywords: ['air freshener', 'perfume', 'scent', 'fragrance', 'aromatherapy', 'humidifier'] },
  { id: 'vent-cover', keywords: ['air vent', 'vent cover', 'ac vent', 'vent outlet', 'air outlet', 'seat vent', 'vent protector'] },

  // Cleaning & Care
  { id: 'cleaning', keywords: ['cleaning', 'cleaner', 'brush', 'duster', 'dryer', 'detailing', 'polish', 'wax', 'dent puller', 'dent removal'] },

  // Camping & Travel
  { id: 'camping', keywords: ['camping', 'tent', 'mattress', 'camp mode', 'sleeping', 'air mattress'] },
  { id: 'pet', keywords: ['pet', 'dog', 'cat', 'pet carrier', 'pet seat'] },
  { id: 'baby', keywords: ['baby', 'child', 'car seat', 'baby mirror'] },

  // Performance & Suspension
  { id: 'suspension', keywords: ['suspension', 'lowering', 'control arm', 'spring', 'shock', 'strut', 'coilover'] },
  { id: 'wheels', keywords: ['wheel set', 'rim', 'performance wheel', 'alloy wheel', 'forged wheel', 'nova wheels', '18 wheel', '19 wheel', '20 wheel', '21 wheel', 'aftermarket forged'] },
  { id: 'brakes', keywords: ['brake', 'caliper', 'rotor', 'brake pad', 'big brake'] },
  { id: 'tires', keywords: ['tire', 'tyre', 'all-season tire', 'winter tire', 'summer tire'] },

  // Covers & Protection
  { id: 'car-cover', keywords: ['car cover', 'vehicle cover', 'outdoor cover', 'indoor cover'] },
  { id: 'windshield', keywords: ['windshield', 'wiper', 'washer', 'rain guard', 'wiper blade'] },

  // Electronics & Displays
  { id: 'entertainment', keywords: ['entertainment screen', 'entertainment display', 'rear screen', 'rear display', 'passenger screen', 'rear entertainment', 'climate control screen'] },
  { id: 'air-filter', keywords: ['air filter', 'cabin filter', 'hepa filter', 'cabin air'] },
  { id: 'seat-belt', keywords: ['seat belt', 'seatbelt', 'belt buckle', 'belt cover', 'belt pad', 'belt extender'] },
  { id: 'soft-close', keywords: ['soft-close', 'soft close', 'suction door', 'automatic door'] },
  { id: 'refrigerator', keywords: ['refrigerator', 'fridge', 'freezer', 'cooler', 'ice box'] },

  // Cybertruck Specific
  { id: 'running-boards', keywords: ['running board', 'side step', 'step bar'] },
  { id: 'bed-accessories', keywords: ['bed liner', 'truck bed', 'l-track', 'tie-down', 'cargo divider', 'molle panel', 'loading ramp', 'bed cover', 'bed mat'] },
  { id: 'grille', keywords: ['grille', 'grill', 'insect net', 'bug screen', 'mesh grill'] },
  { id: 'silicone-frame', keywords: ['silicone frame', 'protective frame', 'silicone protector'] },

  // Safety & Security
  { id: 'safety', keywords: ['emergency release', 'emergency handle', 'safety cord', 'door lock', 'lock cover', 'anti-theft', 'sentry mode'] },
  { id: 'tpms', keywords: ['tpms', 'tire pressure', 'tire monitor'] },

  // Tools & Accessories
  { id: 'tools', keywords: ['tool kit', 'tool set', 'schwaben', 'torque wrench', 'jack', 'lift pad'] },
  { id: 'bundle', keywords: ['bundle', 'package', 'combo', 'kit set', 'complete kit', 'full set'] },

  // Misc
  { id: 'carbon-fiber', keywords: ['carbon fiber hood', 'carbon fiber trunk', 'carbon fiber fender'] },
];

// Tesla model identifiers
export const TESLA_MODELS = [
  { id: 'model-3', keywords: ['model 3', 'm3', 'model3'] },
  { id: 'model-y', keywords: ['model y', 'my', 'modely'] },
  { id: 'model-s', keywords: ['model s', 'ms', 'models'] },
  { id: 'model-x', keywords: ['model x', 'mx', 'modelx'] },
  { id: 'cybertruck', keywords: ['cybertruck', 'cyber truck', 'ct'] },
  { id: 'highland', keywords: ['highland', '2024 model 3'] },
  { id: 'juniper', keywords: ['juniper', '2025 model y'] }
];
