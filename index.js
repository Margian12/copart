const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.get("/fetch", async (req, res) => {
  const lot = req.query.lot;
  if (!lot) return res.status(400).send("Lot not provided");

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto(`https://www.copart.com/lot/${lot}`, { waitUntil: "domcontentloaded" });

    const result = await page.evaluate(() => {
      const priceEl = document.querySelector(".lot-details-right .bid-status span");
      const titleEl = document.querySelector(".lot-details-left h1");
      const engineEl = document.querySelector('li[data-uname="lotdetailEnginetypevalue"]');

      const price = priceEl ? priceEl.innerText : "N/A";
      const title = titleEl ? titleEl.innerText : "No title";
      const engine = engineEl ? engineEl.innerText : "Unknown";

      return { title, price, engine };
    });

    await browser.close();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Copart API running at http://localhost:${port}`);
});
