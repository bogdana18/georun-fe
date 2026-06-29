# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: track-creation.spec.ts >> GeoRun User Role (view-only) >> user role badge is displayed
- Location: tests\track-creation.spec.ts:166:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation to "/" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]: 🏃
    - heading "GeoRun" [level=1] [ref=e5]
    - paragraph [ref=e6]: Create a new account to get started.
    - tablist [ref=e7]:
      - tab "Sign In" [ref=e8] [cursor=pointer]
      - tab "Register" [selected] [ref=e9] [cursor=pointer]
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: Email
        - textbox "Email" [ref=e13]:
          - /placeholder: you@example.com
          - text: e2e-user-1782715544411@georun.test
      - generic [ref=e14]:
        - generic [ref=e15]: Password
        - textbox "Password" [ref=e16]:
          - /placeholder: At least 6 characters
          - text: e2ePassword!1
      - generic [ref=e17]:
        - generic [ref=e18]: Account Role
        - combobox "Account Role" [ref=e19] [cursor=pointer]:
          - option "User — can view tracks" [selected]
          - option "Admin — can create tracks"
      - alert [ref=e20]:
        - generic [ref=e21]: ⚠️
        - text: Failed to fetch
      - button "Create Account" [ref=e22] [cursor=pointer]
    - generic [ref=e23]: or
    - generic [ref=e24]:
      - strong [ref=e25]: "Quick demo:"
      - text: Register with
      - strong [ref=e26]: admin
      - text: role
      - text: to unlock the ability to create new tracks.
  - button "Open Next.js Dev Tools" [ref=e32] [cursor=pointer]:
    - img [ref=e33]
  - alert [ref=e36]
```

# Test source

```ts
  59  |     await page.goto('/login');
  60  |     await expect(page.locator('#tab-login')).toBeVisible();
  61  |     await expect(page.locator('#tab-register')).toBeVisible();
  62  |     await expect(page.locator('#auth-submit')).toBeVisible();
  63  |   });
  64  | 
  65  |   test('shows error for invalid credentials', async ({ page }) => {
  66  |     await page.goto('/login');
  67  |     await page.fill('#login-email', 'nonexistent@example.com');
  68  |     await page.fill('#login-password', 'wrongpassword');
  69  |     await page.click('#auth-submit');
  70  | 
  71  |     await expect(page.locator('#auth-error')).toBeVisible({ timeout: 8_000 });
  72  |     const errorText = await page.locator('#auth-error').textContent();
  73  |     expect(errorText).toBeTruthy();
  74  |   });
  75  | });
  76  | 
  77  | test.describe('GeoRun Dashboard', () => {
  78  |   test.beforeEach(async ({ page }) => {
  79  |     await doRegisterAndLogin(page);
  80  |   });
  81  | 
  82  |   test('dashboard loads with admin role badge after login', async ({ page }) => {
  83  |     await expect(page).toHaveURL('/');
  84  | 
  85  |     const roleBadge = page.locator('div').filter({ hasText: /admin/ }).first();
  86  |     await expect(roleBadge).toBeVisible();
  87  |   });
  88  | 
  89  |   test('logout clears session and redirects to /login', async ({ page }) => {
  90  |     await page.click('#logout-btn');
  91  |     await page.waitForURL('/login', { timeout: 10_000 });
  92  |     await expect(page).toHaveURL('/login');
  93  |   });
  94  | 
  95  |   test('New Track button is visible for admin role', async ({ page }) => {
  96  |     await expect(page.locator('#open-create-modal')).toBeVisible();
  97  |   });
  98  | });
  99  | 
  100 | test.describe('GeoRun Track Creation Flow', () => {
  101 |   test.beforeEach(async ({ page }) => {
  102 |     await doRegisterAndLogin(page);
  103 |   });
  104 | 
  105 |   test('full flow: open modal → fill form → draw route → submit → track appears', async ({ page }) => {
  106 |     await page.click('#open-create-modal');
  107 | 
  108 |     await expect(page.locator('[role="dialog"], .modal, form#track-form, form'
  109 |     ).first()).toBeVisible({ timeout: 6_000 });
  110 | 
  111 |     await page.fill('#track-title', TRACK_TITLE);
  112 | 
  113 |     await page.selectOption('#track-difficulty', 'medium');
  114 | 
  115 |     await page.waitForSelector('#route-map', { timeout: 15_000 });
  116 | 
  117 |     await page.waitForTimeout(800);
  118 | 
  119 |     await clickMapAt(page, 150, 180);
  120 |     await page.waitForTimeout(400);
  121 |     await clickMapAt(page, 260, 220);
  122 |     await page.waitForTimeout(400);
  123 |     await clickMapAt(page, 340, 160);
  124 |     await page.waitForTimeout(300);
  125 | 
  126 |     const submitBtn = page.locator('button[type="submit"]').filter({ hasText: /Create Track/i });
  127 |     await expect(submitBtn).toBeEnabled({ timeout: 5_000 });
  128 |     await submitBtn.click();
  129 | 
  130 |     await expect(submitBtn).not.toBeVisible({ timeout: 12_000 });
  131 | 
  132 |     const trackCard = page.locator('text=' + TRACK_TITLE);
  133 |     await expect(trackCard).toBeVisible({ timeout: 12_000 });
  134 |   });
  135 | 
  136 |   test('form shows validation errors when submitted empty', async ({ page }) => {
  137 |     await page.click('#open-create-modal');
  138 |     await page.waitForSelector('#track-title', { timeout: 6_000 });
  139 | 
  140 |     const submitBtn = page.locator('button[type="submit"]').filter({ hasText: /Create Track/i });
  141 |     await submitBtn.click();
  142 | 
  143 |     const errorMsg = page.locator('.form-error').first();
  144 |     await expect(errorMsg).toBeVisible({ timeout: 5_000 });
  145 |   });
  146 | });
  147 | 
  148 | 
  149 | test.describe('GeoRun User Role (view-only)', () => {
  150 |   const USER_EMAIL = `e2e-user-${Date.now()}@georun.test`;
  151 | 
  152 |   test.beforeEach(async ({ page }) => {
  153 |     await page.goto('/login');
  154 |     await page.click('#tab-register');
  155 |     await page.fill('#login-email', USER_EMAIL);
  156 |     await page.fill('#login-password', TEST_PASSWORD);
  157 |     await page.selectOption('#register-role', 'user');
  158 |     await page.click('#auth-submit');
> 159 |     await page.waitForURL('/', { timeout: 15_000 });
      |                ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  160 |   });
  161 | 
  162 |   test('New Track button is NOT visible for regular users', async ({ page }) => {
  163 |     await expect(page.locator('#open-create-modal')).not.toBeVisible();
  164 |   });
  165 | 
  166 |   test('user role badge is displayed', async ({ page }) => {
  167 |     const roleBadge = page.locator('div').filter({ hasText: /user/ }).first();
  168 |     await expect(roleBadge).toBeVisible();
  169 |   });
  170 | });
  171 | 
```