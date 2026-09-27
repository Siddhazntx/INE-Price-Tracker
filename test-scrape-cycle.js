require("dotenv").config();

const { runScrapeCycle } = require("./src/services/scrapeService");

async function main() {
  console.log("=== TESTING SCRAPE CYCLE ===");

  const result = await runScrapeCycle(
    "https://demo.inelabteamdev.com/item/2609",
    "Warm white",
    {
      maxAttempts: 3,
    }
  );

  console.log("\n=== SCRAPE CYCLE SUCCESS ===");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("\n=== SCRAPE CYCLE FAILED ===");
  console.error(error.message);
});