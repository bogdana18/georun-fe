import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = `e2e-admin-${Date.now()}@georun.test`;
const TEST_PASSWORD = 'e2ePassword!1';
const TRACK_TITLE = `E2E Track ${Date.now()}`;
async function doLogin(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForSelector('#login-email');
  await page.fill('#login-email', email);
  await page.fill('#login-password', password);
  await page.click('#auth-submit');
  await page.waitForURL('/', { timeout: 15_000 });
}

// ─── Helper: register then login ─────────────────────────────────────────────
async function doRegisterAndLogin(page: Page) {
  await page.goto('/login');
  await page.waitForSelector('#tab-register');
  await page.click('#tab-register');

  await page.fill('#login-email', TEST_EMAIL);
  await page.fill('#login-password', TEST_PASSWORD);

  // Select "admin" role so we can create tracks
  await page.selectOption('#register-role', 'admin');
  await page.click('#auth-submit');

  // After registration + auto-login, we should land on /
  await page.waitForURL('/', { timeout: 15_000 });
}

// ─── Helper: click at a pixel offset inside the map container ────────────────
async function clickMapAt(page: Page, xOffset: number, yOffset: number) {
  const mapBox = await page.locator('#route-map').boundingBox();
  if (!mapBox) throw new Error('Map container not found in DOM');
  await page.mouse.click(
    mapBox.x + xOffset,
    mapBox.y + yOffset,
    { delay: 80 }
  );
}

// =============================================================================
// Test Suite
// =============================================================================

test.describe('GeoRun Authentication', () => {
  test('unauthenticated visitor is redirected to /login', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/');
    await page.waitForURL('/login', { timeout: 10_000 });
    await expect(page).toHaveURL('/login');
    await expect(page.locator('#auth-form')).toBeVisible();
  });

  test('login page renders sign-in and register tabs', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#tab-login')).toBeVisible();
    await expect(page.locator('#tab-register')).toBeVisible();
    await expect(page.locator('#auth-submit')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-email', 'nonexistent@example.com');
    await page.fill('#login-password', 'wrongpassword');
    await page.click('#auth-submit');

    await expect(page.locator('#auth-error')).toBeVisible({ timeout: 8_000 });
    const errorText = await page.locator('#auth-error').textContent();
    expect(errorText).toBeTruthy();
  });
});

test.describe('GeoRun Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await doRegisterAndLogin(page);
  });

  test('dashboard loads with admin role badge after login', async ({ page }) => {
    await expect(page).toHaveURL('/');

    const roleBadge = page.locator('div').filter({ hasText: /admin/ }).first();
    await expect(roleBadge).toBeVisible();
  });

  test('logout clears session and redirects to /login', async ({ page }) => {
    await page.click('#logout-btn');
    await page.waitForURL('/login', { timeout: 10_000 });
    await expect(page).toHaveURL('/login');
  });

  test('New Track button is visible for admin role', async ({ page }) => {
    await expect(page.locator('#open-create-modal')).toBeVisible();
  });
});

test.describe('GeoRun Track Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await doRegisterAndLogin(page);
  });

  test('full flow: open modal → fill form → draw route → submit → track appears', async ({ page }) => {
    await page.click('#open-create-modal');

    await expect(page.locator('[role="dialog"], .modal, form#track-form, form'
    ).first()).toBeVisible({ timeout: 6_000 });

    await page.fill('#track-title', TRACK_TITLE);

    await page.selectOption('#track-difficulty', 'medium');

    await page.waitForSelector('#route-map', { timeout: 15_000 });

    await page.waitForTimeout(800);

    await clickMapAt(page, 150, 180);
    await page.waitForTimeout(400);
    await clickMapAt(page, 260, 220);
    await page.waitForTimeout(400);
    await clickMapAt(page, 340, 160);
    await page.waitForTimeout(300);

    const submitBtn = page.locator('button[type="submit"]').filter({ hasText: /Create Track/i });
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
    await submitBtn.click();

    await expect(submitBtn).not.toBeVisible({ timeout: 12_000 });

    const trackCard = page.locator('text=' + TRACK_TITLE);
    await expect(trackCard).toBeVisible({ timeout: 12_000 });
  });

  test('form shows validation errors when submitted empty', async ({ page }) => {
    await page.click('#open-create-modal');
    await page.waitForSelector('#track-title', { timeout: 6_000 });

    const submitBtn = page.locator('button[type="submit"]').filter({ hasText: /Create Track/i });
    await submitBtn.click();

    const errorMsg = page.locator('.form-error').first();
    await expect(errorMsg).toBeVisible({ timeout: 5_000 });
  });
});


test.describe('GeoRun User Role (view-only)', () => {
  const USER_EMAIL = `e2e-user-${Date.now()}@georun.test`;

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.click('#tab-register');
    await page.fill('#login-email', USER_EMAIL);
    await page.fill('#login-password', TEST_PASSWORD);
    await page.selectOption('#register-role', 'user');
    await page.click('#auth-submit');
    await page.waitForURL('/', { timeout: 15_000 });
  });

  test('New Track button is NOT visible for regular users', async ({ page }) => {
    await expect(page.locator('#open-create-modal')).not.toBeVisible();
  });

  test('user role badge is displayed', async ({ page }) => {
    const roleBadge = page.locator('div').filter({ hasText: /user/ }).first();
    await expect(roleBadge).toBeVisible();
  });
});
