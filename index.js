const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/fetch', async (req, res) => {
  const lot = req.query.lot;
  if (!lot) return res.status(400).json({ error: 'No lot provided' });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`https://www.copart.com/lot/${lot}`, { waitUntil: 'domcontentloaded' });

    const data = await page.evaluate(() => {
      const price = document.querySelector('.lot-details-right .bid-status span')?.innerText || '0';
      const year = document.querySelector('.lot-details-left h1')?.innerText?.slice(0, 4) || '';
      const engine = document.querySelector('li[data-uname="lotdetailEnginetypevalue"]')?.innerText || '2.0';

      return {
        price: parseFloat(price.replace(/[^\d.]/g, '')) || 0,
        year,
        engine: parseFloat(engine) || 2.0
      };
    });

    await browser.close();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Copart Scraper running on port ${PORT}`));
