const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  
  console.log('Loading page...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  
  // Wait for cards to load
  console.log('Waiting for cards...');
  await page.waitForSelector('.group.bg-white.border.border-gray-200', { timeout: 10000 });
  
  // Click the first comparison card
  console.log('Clicking first card...');
  await page.click('.group.bg-white.border.border-gray-200');
  
  // Wait for modal to appear
  console.log('Waiting for modal...');
  await page.waitForSelector('.fixed.inset-0.z-50', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 800));
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: '/tmp/modal.png', fullPage: false });
  
  console.log('Done!');
  await browser.close();
})();
