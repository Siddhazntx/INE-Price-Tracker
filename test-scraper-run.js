const { scrapeProduct } = require("./src/scraper/scraper");

const PRODUCT_URL = "https://demo.inelabteamdev.com/item/2609";

async function main() {
  console.log("========================================");
  console.log("        RUNNING REAL SCRAPER");
  console.log("========================================");

  try {
    const result = await scrapeProduct(
      PRODUCT_URL,
      "Warm white"
    );

    console.log("\n========================================");
    console.log("             RESULT");
    console.log("========================================");

    console.log(
      JSON.stringify(result, null, 2)
    );

  } catch (error) {
    console.error("\n========================================");
    console.error("          SCRAPER FAILED");
    console.error("========================================");

    console.error(error.message);

    if (error.stack) {
      console.error("\nStack:");
      console.error(error.stack);
    }

    process.exitCode = 1;
  }
}

main();