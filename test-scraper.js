const { chromium } = require("playwright");

const PRODUCT_URL =
  "https://demo.inelabteamdev.com/item/2609";

async function main() {
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  try {
    await page.goto(PRODUCT_URL, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForTimeout(1000);

    // --------------------------------------------------
    // SELECT WARM WHITE
    // --------------------------------------------------

    const optionButton = page
      .locator("button.opt-chip")
      .filter({ hasText: "Warm white" })
      .first();

    console.log(
      "Warm white before:",
      await optionButton.evaluate(
        (el) => el.outerHTML
      )
    );

    await optionButton.click();

    console.log("Warm white clicked.");

    await page.waitForTimeout(1000);

    console.log(
      "Warm white after:",
      await optionButton.evaluate(
        (el) => el.outerHTML
      )
    );

    // --------------------------------------------------
    // OFFER PANEL
    // --------------------------------------------------

    const offerPanel = page.locator(".offer-panel").first();
    const priceMessage = page.locator(".offer-msg").first();
    const checkButton = page.locator(
      'button.ctl-main[aria-label="Check today’s price"]'
    );

    const panelBox = await offerPanel.boundingBox();
    const messageBox = await priceMessage.boundingBox();

    console.log("Panel:", panelBox);
    console.log("Price message:", messageBox);

    async function buttonState(label) {
      console.log(
        `${label} -> disabled:`,
        await checkButton.isDisabled()
      );
    }

    await buttonState("Before mouse");

    if (panelBox) {
      console.log("\n=== MOVE TO PANEL TOP LEFT ===");

      await page.mouse.move(
        panelBox.x + 5,
        panelBox.y + 5
      );

      await page.waitForTimeout(300);
      await buttonState("Top left");

      console.log("\n=== MOVE TO PRICE MESSAGE ===");

      if (messageBox) {
        await page.mouse.move(
          messageBox.x + messageBox.width / 2,
          messageBox.y + messageBox.height / 2,
          { steps: 30 }
        );
      }

      await page.waitForTimeout(300);
      await buttonState("Price message");

      console.log("\n=== MOVE TO PANEL CENTER ===");

      await page.mouse.move(
        panelBox.x + panelBox.width / 2,
        panelBox.y + panelBox.height / 2,
        { steps: 30 }
      );

      await page.waitForTimeout(300);
      await buttonState("Panel center");

      console.log("\n=== MOVE ACROSS PRICE AREA ===");

      const y = panelBox.y + panelBox.height / 2;

      await page.mouse.move(
        panelBox.x + 10,
        y,
        { steps: 20 }
      );

      await page.mouse.move(
        panelBox.x + panelBox.width / 2,
        y,
        { steps: 30 }
      );

      await page.mouse.move(
        panelBox.x + panelBox.width - 10,
        y,
        { steps: 30 }
      );

      await page.waitForTimeout(1000);
      await buttonState("After horizontal trajectory");
    }

    // --------------------------------------------------

    console.log(
      "\n=== FINAL BUTTON ==="
    );

    console.log(
      await checkButton.evaluate(
        (el) => el.outerHTML
      )
    );

    await page.waitForFunction(
      () => {
        const button = document.querySelector(
          'button.ctl-main[aria-label="Check today’s price"]'
        );

        return button && !button.disabled;
      },
      { timeout: 8000, polling: 200 }
    );

    console.log("Check Price button is ENABLED.");

    console.log("\n=== CHECKING CONSENT BEFORE CLICK ===");

    const scrim = page.locator(".consent-scrim");

    if (await scrim.count()) {
      console.log("Consent scrim exists.");

      if (await scrim.isVisible()) {
        console.log("Consent scrim is VISIBLE. Attempting dismissal...");

        const allowButton = scrim.locator(
          'button:has-text("Allow"), button[aria-label*="Allow"]'
        ).first();

        if (await allowButton.count()) {
          await allowButton.click({ timeout: 5000 });
          console.log("Allow clicked.");
        }

        await scrim.waitFor({
          state: "hidden",
          timeout: 5000,
        });

        console.log("Consent scrim is hidden.");
      }
    } else {
      console.log("No consent scrim exists.");
    }

    console.log("\n=== VERIFYING BUTTON BEFORE CLICK ===");

    console.log(
      "Button disabled:",
      await checkButton.isDisabled()
    );

    console.log(
      "Scrim visible:",
      await scrim.isVisible().catch(() => false)
    );

    console.log("\n=== CLICKING CHECK PRICE ===");

    await checkButton.click();

    console.log("Check Price clicked.");

    console.log("\n=== WAITING FOR PRICE RESOLUTION ===");

    await page.waitForFunction(
      () => {
        const panel = document.querySelector(".offer-panel");

        if (!panel) return false;

        // Still locked
        if (panel.classList.contains("offer-locked")) {
          return false;
        }

        // Still loading
        const text = panel.innerText || "";
        if (/loading/i.test(text)) {
          return false;
        }

        // Look for a visible price
        const candidates = Array.from(
          panel.querySelectorAll(
            '[data-price="true"], .amount, .price-value, strong'
          )
        );

        return candidates.some((el) => {
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();

          return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0" &&
            rect.width > 0 &&
            rect.height > 0 &&
            el.textContent.trim().length > 0
          );
        });
      },
      {
        timeout: 30000,
        polling: 500,
      }
    );

    console.log("Price resolved.");

    console.log("\n=== FINAL OFFER PANEL ===");

    console.log(
      await offerPanel.evaluate((el) => el.outerHTML)
    );

    const price = await offerPanel.evaluate((panel) => {
      const candidates = Array.from(
        panel.querySelectorAll(
          "strong.amt-h8, strong, [data-price='true'], .amount, .price-value"
        )
      );

      const visible = candidates.find((el) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0" &&
          el.getAttribute("aria-hidden") !== "true" &&
          rect.width > 0 &&
          rect.height > 0 &&
          el.textContent.trim().length > 0
        );
      });

      if (!visible) {
        return null;
      }

      return visible.textContent
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .trim();
    });

    console.log("\n=== FINAL RESULT ===");
    console.log("Price:", price);

  } catch (error) {
    console.error(
      "\nTEST FAILED:"
    );

    console.error(error);
  } finally {
    await browser.close();
  }
}

main();