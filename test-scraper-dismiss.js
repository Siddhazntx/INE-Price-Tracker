const { chromium } = require("playwright");

const PRODUCT_URL = "https://demo.inelabteamdev.com/item/2609";

async function dismissConsent(page, label) {
  console.log(`\n=== CONSENT CHECK: ${label} ===`);

  const scrim = page.locator(".consent-scrim");

  try {
    await scrim.waitFor({
      state: "visible",
      timeout: 3000,
    });

    console.log("Consent scrim is visible.");

    const allowButton = scrim
      .getByRole("button", { name: /allow/i })
      .first();

    if (!(await allowButton.count())) {
      console.log("Scrim exists, but Allow button was not found.");
      return false;
    }

    console.log("Allow button found. Clicking...");

    await allowButton.click({
      timeout: 5000,
    });

    await scrim.waitFor({
      state: "hidden",
      timeout: 5000,
    });

    console.log("Consent scrim successfully dismissed.");

    return true;
  } catch {
    console.log("No visible consent scrim.");

    return false;
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  try {
    console.log("Opening:", PRODUCT_URL);

    await page.goto(PRODUCT_URL, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForTimeout(1000);

    // First consent check
    await dismissConsent(
      page,
      "Immediately after page load"
    );

    // Select Warm white
    const optionButton = page
      .locator("button.opt-chip")
      .filter({ hasText: "Warm white" })
      .first();

    if (!(await optionButton.count())) {
      throw new Error("Warm white option not found.");
    }

    console.log("\n=== SELECTING WARM WHITE ===");

    console.log(
      "Before:",
      await optionButton.evaluate((el) => el.outerHTML)
    );

    await optionButton.click();

    console.log("Warm white clicked.");

    await page.waitForTimeout(1000);

    console.log(
      "After:",
      await optionButton.evaluate((el) => el.outerHTML)
    );

    // Second consent check
    await dismissConsent(
      page,
      "After selecting Warm white"
    );

    // Offer panel
    const offerPanel = page.locator(".offer-panel").first();

    await offerPanel.waitFor({
      state: "visible",
      timeout: 10000,
    });

    const box = await offerPanel.boundingBox();

    if (!box) {
      throw new Error("Offer panel has no bounding box.");
    }

    console.log("\n=== MOVING MOUSE ACROSS OFFER PANEL ===");

    await page.mouse.move(box.x, box.y, {
      steps: 10,
    });

    await page.mouse.move(
      box.x + box.width / 2,
      box.y + box.height / 2,
      {
        steps: 20,
      }
    );

    await page.mouse.move(
      box.x + box.width - 10,
      box.y + box.height / 2,
      {
        steps: 20,
      }
    );

    // Wait for button to enable
    const checkButton = page.locator(
      'button.ctl-main[aria-label="Check today’s price"]'
    );

    await page.waitForFunction(
      () => {
        const button = document.querySelector(
          'button.ctl-main[aria-label="Check today’s price"]'
        );

        return button && !button.disabled;
      },
      {
        timeout: 8000,
        polling: 200,
      }
    );

    console.log("Check Price button is enabled.");

    // IMPORTANT: verify consent one final time
    await dismissConsent(
      page,
      "Immediately before Check Price click"
    );

    console.log("\n=== CLICKING CHECK PRICE ===");

    await checkButton.click({
      timeout: 5000,
    });

    console.log("Check Price clicked successfully.");

    console.log("\n=== TEST PASSED ===");

  } catch (error) {
    console.error("\nTEST FAILED:");
    console.error(error.message);
  } finally {
    await browser.close();
  }
}

main();