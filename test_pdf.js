import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Set viewport to mobile size
  await page.setViewport({ width: 390, height: 844 });
  
  await page.goto('http://localhost:5173/');
  
  // Fill the form
  await page.type('input[name="contractNumber"]', '12345');
  await page.type('input[name="name"]', 'Тестовый Клиент');
  
  // Click Generate PDF button
  const buttons = await page.$$('button');
  for (const button of buttons) {
    const text = await page.evaluate(el => el.textContent, button);
    if (text.includes('Скачать PDF')) {
      await button.click();
      break;
    }
  }
  
  // Wait a moment for generation
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("PDF generation triggered successfully.");
  await browser.close();
})();
