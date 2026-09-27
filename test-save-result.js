require("dotenv").config();

const { scrapeProduct } = require("./src/scraper/scraper");
const { saveScrapeResult } = require("./src/services/productService");

const PRODUCT_URL =
  "https://demo.inelabteamdev.com/item/2609";

async function main() {
  try {
    console.log("=== SCRAPING PRODUCT ===");

    const result = await scrapeProduct(
      PRODUCT_URL,
      "Warm white"
    );

    console.log("\n=== SAVING TO SUPABASE ===");

    const saved = await saveScrapeResult(result);

    console.log("\n=== DATABASE SAVE SUCCESS ===");

    console.log(
      JSON.stringify(saved, null, 2)
    );

  } catch (error) {
    console.error("\n=== FAILED ===");
    console.error(error.message);

    if (error.stack) {
      console.error(error.stack);
    }

    process.exitCode = 1;
  }
}

main();