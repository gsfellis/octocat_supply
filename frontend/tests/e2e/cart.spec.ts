import { expect, test } from '@playwright/test';

const product = {
  productId: 42,
  name: 'Test Solar Panel',
  description: 'A solar panel for testing cart interactions.',
  price: 100,
  imgName: 'solar-panel.png',
  sku: 'SOLAR-42',
  unit: 'each',
  supplierId: 1,
};

test.describe('Shopping cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products', (route) =>
      route.fulfill({ json: [product] }),
    );
    await page.goto('/products');
  });

  test('adds products, updates quantities, persists, and removes items', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Increase quantity of Test Solar Panel' }).click();
    await page.getByRole('button', { name: 'Increase quantity of Test Solar Panel' }).click();
    await page.getByRole('button', { name: 'Add 2 Test Solar Panel to cart' }).click();
    await expect(
      page.getByRole('link', { name: 'Shopping cart, 2 items' }),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Shopping cart, 2 items' }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByText('Test Solar Panel', { exact: true }).first()).toBeVisible();
    await expect(page.locator('aside dd').first()).toHaveText('$200.00');
    await expect(page.getByText('-$10.00')).toBeVisible();
    await expect(page.locator('dd').last()).toHaveText('$200.00');

    await page.getByRole('spinbutton', { name: 'Quantity of Test Solar Panel' }).fill('3');
    await page.getByRole('button', { name: 'Update Cart' }).click();
    await expect(page.getByRole('status')).toContainText('Cart updated.');
    await expect(page.getByText('$300.00').first()).toBeVisible();
    await expect(page.getByText('-$15.00')).toBeVisible();
    await expect(page.locator('dd').last()).toHaveText('$295.00');

    await page.reload();
    await expect(
      page.getByRole('link', { name: 'Shopping cart, 3 items' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Remove Test Solar Panel from cart' }).click();
    await expect(page.getByText('Your cart is empty.')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Shopping cart, 0 items' }),
    ).toBeVisible();
  });

  test('shows usable cart controls on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Increase quantity of Test Solar Panel' }).click();
    await page.getByRole('button', { name: 'Add 1 Test Solar Panel to cart' }).click();
    await page.getByRole('link', { name: 'Shopping cart, 1 item' }).click();

    await expect(
      page.getByRole('spinbutton', { name: 'Quantity' }),
    ).toBeVisible();
    await page.getByRole('spinbutton', { name: 'Quantity' }).fill('2');
    await page.getByRole('button', { name: 'Update Cart' }).click();
    await expect(page.locator('aside dd').first()).toHaveText('$200.00');
  });
});
