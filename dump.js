const { chromium } = require("playwright");

const PRODUCT_URL = "https://demo.inelabteamdev.com/item/2609";

async function handleConsent(page) {
  const scrim = page.locator(".consent-scrim");

  try {
    await scrim.waitFor({
      state: "visible",
      timeout: 3000,
    });

    console.log("Consent scrim detected.");

    const allowButton = scrim
      .getByRole("button", { name: /allow/i })
      .first();

    if (await allowButton.count()) {
      console.log("Clicking Allow...");
      await allowButton.click({ timeout: 5000 });
      await scrim.waitFor({
        state: "hidden",
        timeout: 5000,
      });

      console.log("Consent scrim dismissed.");
    }
  } catch {
    console.log("No blocking consent scrim.");
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  try {
    console.log("Opening product page...");

    await page.goto(PRODUCT_URL, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForTimeout(1000);

    await handleConsent(page);

    // Select option
    const optionButton = page
      .locator("button.opt-chip")
      .filter({ hasText: "Warm white" })
      .first();

    if (!(await optionButton.count())) {
      throw new Error("Warm white option not found.");
    }

    await optionButton.click();

    console.log("Warm white selected.");

    await page.waitForTimeout(500);

    await handleConsent(page);

    // Offer panel
    const offerPanel = page.locator(".offer-panel").first();

    await offerPanel.waitFor({
      state: "visible",
      timeout: 10000,
    });

    const box = await offerPanel.boundingBox();

    if (!box) {
      throw new Error("Could not get offer panel bounding box.");
    }

    // Trigger price-area interaction
    console.log("Moving mouse across offer panel...");

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

    // Wait for button
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

    console.log("Check Price button enabled.");

    await handleConsent(page);

    console.log("Clicking Check Price...");

    await checkButton.click();

    console.log("Check Price clicked.");

    // Give the demo site time to update
    await page.waitForTimeout(5000);

    console.log("\n=== HTML AFTER CLICK ===");

    console.log(
      await offerPanel.evaluate((el) => el.outerHTML)
    );

    await page.screenshot({
      path: "screenshot.png",
      fullPage: false,
    });

    console.log("\nScreenshot saved as screenshot.png");

  } catch (error) {
    console.error("\nDUMP TEST FAILED:");
    console.error(error.message);
  } finally {
    await browser.close();
  }
}

main();