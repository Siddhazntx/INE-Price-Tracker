require("dotenv").config();

const {
  saveScrapeResult,
} = require("./src/services/productService");

const fakeScrapeResult = {
  success: true,

  product: {
    storeProductId: 2609,
    name: null,
    brand: null,
    sku: null,
    url: "https://demo.inelabteamdev.com/item/2609",
  },

  option: {
    group: "Color",
    value: "Warm white",
  },

  price: {
    amount: 12765,
    currency: "INR",
  },

  stock: {
    count: 151,
    status: "available",
  },
};

async function main() {
  console.log("=== TESTING DATABASE SAVE ===");

  try {
    const result = await saveScrapeResult(fakeScrapeResult);

    console.log("\n=== DATABASE SAVE SUCCESS ===");

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("\n=== DATABASE SAVE FAILED ===");
    console.error(error.message);
  }
}

main();