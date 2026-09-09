export default async function run(page, ui) {
  const result = { steps: [] };

  // Go to a product page
  await page.goto('http://localhost:5173/custom/product/tshirt-standard');
  await page.waitForTimeout(2500);

  // Snapshot to find the order button
  const snap1 = await ui.snapshot();
  result.snapProduct = snap1.slice(0, 1500);

  // Click "Order" / "Commander"
  const orderBtn = snap1.match(/@(e\d+) button [^\n]*(Order|Commander|اطلب)/)?.[1];
  if (!orderBtn) return { ...result, error: 'no order button found' };
  await ui.click(orderBtn);
  await page.waitForTimeout(2000);

  // Snapshot the order form
  const snap2 = await ui.snapshot();
  result.snapForm = snap2.slice(0, 2500);

  // Fill form fields by name
  const fillField = async (names, value) => {
    for (const n of names) {
      const loc = page.locator(`input[name="${n}"], select[name="${n}"], textarea[name="${n}"]`).first();
      if (await loc.count()) {
        try { await loc.fill(value); return true; } catch { try { await loc.selectOption({ label: value }); return true; } catch { } }
      }
    }
    return false;
  };

  result.name = await fillField(['customerName', 'name'], 'Test Client');
  result.phone = await fillField(['phone'], '0555123456');
  result.wilaya = await fillField(['wilaya'], 'Alger');
  result.baladia = await fillField(['baladia'], 'Bab Ezzouar');
  result.address = await fillField(['address'], 'Rue 1');
  result.delivery = await fillField(['deliveryMethod'], 'home');

  // Delivery method may be radio buttons
  const radio = page.locator('input[type="radio"]').first();
  if (await radio.count()) { await radio.check().catch(() => { }); }

  await page.waitForTimeout(500);

  // Find and click the confirm button
  const snap3 = await ui.snapshot();
  result.snapBeforeSubmit = snap3.slice(0, 2000);
  const confirmBtn = snap3.match(/@(e\d+) button[^\n]*(Confirmer|Confirm|تأكيد)/)?.[1];
  if (!confirmBtn) return { ...result, error: 'no confirm button found' };

  await ui.click(confirmBtn);
  await page.waitForTimeout(4000);

  result.urlAfter = page.url();
  result.bodyText = (await page.locator('body').innerText()).slice(0, 800);
  return result;
}
