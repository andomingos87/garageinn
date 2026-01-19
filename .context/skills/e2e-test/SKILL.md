---
name: e2e-test
description: Create E2E tests with Playwright following GarageInn project standards
phases: [E, V]
---

# E2E Test - Playwright

Skill for creating E2E (End-to-End) tests using Playwright following the standards established in the GarageInn project.

## When to Use

- When implementing integration tests for new features
- To validate critical user flows (login, CRUD, permissions)
- When needing to test interactions between frontend and backend
- To validate RLS (Row Level Security) of Supabase
- After fixing bugs to ensure non-regression

## Project Structure

```
apps/web/
├── e2e/                          # E2E Tests
│   ├── fixtures/                 # Helpers and fixtures
│   │   └── auth.ts              # Authentication functions
│   ├── checklists/              # Tests per module
│   ├── *.spec.ts                # Test files
│   └── playwright-report/       # Generated reports
└── playwright.config.ts         # Playwright configuration
```

## Instructions

### 1. Create Test File

Create the file in `apps/web/e2e/` with `.spec.ts` extension:

```typescript
/**
 * E2E Tests for [Module Name]
 *
 * Scenarios tested:
 * 1. [Scenario 1]
 * 2. [Scenario 2]
 *
 * NOTE: These tests require:
 * - Playwright installed
 * - Test users in the database
 * - Development server running
 */

import { test, expect } from "@playwright/test";
import { login, loginAsAdmin, TEST_USERS } from "./fixtures/auth";

test.describe("[Module Name]", () => {
  test.describe("[Test Group]", () => {
    test("should [expected action]", async ({ page }) => {
      // Arrange
      await loginAsAdmin(page);
      await page.goto("/route");

      // Act
      await page.click("text=Button");

      // Assert
      await expect(page.locator("h1")).toContainText("Expected Title");
    });
  });
});
```

### 2. Use Authentication Fixtures

Import the helpers from `./fixtures/auth.ts`:

```typescript
import { login, loginAsAdmin, loginAsSupervisor, logout, TEST_USERS } from "./fixtures/auth";

// Login as admin
await loginAsAdmin(page);

// Login as supervisor
await loginAsSupervisor(page);

// Custom login
await login(page, "email@test.com", "password123");

// Access test user data
console.log(TEST_USERS.admin.email);
```

### 3. Selector Patterns

Use robust selectors in order of preference:

```typescript
// 1. Role-based (preferred)
await page.getByRole("button", { name: "Save" });
await page.getByRole("heading", { name: "Title" });

// 2. Label-based
await page.getByLabel("Email");
await page.getByPlaceholder("Enter your email");

// 3. Text-based
await page.locator("text=New Ticket");
await page.getByText("Success");

// 4. CSS selectors (when necessary)
await page.locator('input[name="email"]');
await page.locator('button[type="submit"]');

// 5. Test IDs (for complex elements)
await page.locator('[data-testid="user-menu"]');
```

### 4. Waits and Assertions

```typescript
// Wait for navigation
await page.waitForURL(/\/dashboard/);
await page.waitForURL("/tickets/commercial");

// Wait for element
await page.waitForSelector("table tbody tr", { timeout: 10000 });

// Assertions
await expect(page.locator("h1")).toContainText("Title");
await expect(page.locator("button")).toBeVisible();
await expect(page.locator("input")).toBeEnabled();
await expect(page).toHaveURL(/\/tickets/);
await expect(page).toHaveTitle(/GarageInn/);
```

### 5. Complete Test Structure

```typescript
test.describe("Module X", () => {
  // Logical grouping
  test.describe("Listing", () => {
    test("should display list of items", async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto("/module-x");
      await expect(page.locator("table")).toBeVisible();
    });
  });

  test.describe("Creation", () => {
    test("should create item successfully", async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto("/module-x/new");

      // Fill form
      await page.fill('input[id="title"]', "E2E Test");
      await page.fill('textarea[id="description"]', "Test description");

      // Select option
      await page.click('button[id="category"]');
      await page.locator('[role="option"]').first().click();

      // Submit
      await page.click('button:has-text("Create")');

      // Verify redirect
      await page.waitForURL(/\/module-x\/[\w-]+/);
    });
  });

  test.describe("Permissions (RLS)", () => {
    test("admin should see all items", async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto("/module-x");
      await expect(page.locator("h2")).toContainText("Module X");
    });

    test.skip("user without permission should not access", async ({ page }) => {
      // Use test.skip for pending tests
    });
  });
});
```

## Commands

```bash
# Run all tests
npm run test:e2e

# Run with interactive UI
npm run test:e2e:ui

# Run specific test
npx playwright test apps/web/e2e/test-name.spec.ts

# Test debug
npm run test:e2e:debug

# Generate HTML report
npx playwright show-report apps/web/playwright-report
```

## Guidelines

### Naming
- File: `module-name.spec.ts` or `bug-NNN-description.spec.ts`
- Describe: Module or functionality name in English
- Test: Should + action in English (ex: "should display list of tickets")

### Best Practices
- Use `test.describe()` to group related tests
- Use `test.skip()` for pending implementation tests
- Capture screenshots on error for debugging
- Wait for loading with appropriate timeouts
- Avoid fixed sleeps, prefer `waitForSelector` or `waitForURL`

### Debug
```typescript
// Capture screenshot
await page.screenshot({ path: "playwright-report/debug.png", fullPage: true });

// Capture console logs
const consoleMessages: string[] = [];
page.on("console", (msg) => {
  consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
});

// Capture network requests
page.on("request", (request) => {
  console.log(`${request.method()} ${request.url()}`);
});
```

### Available Test Users

```typescript
TEST_USERS = {
  admin: {
    email: "administrador_global_teste@garageinn.com",
    password: "Teste123!",
  },
  supervisor: {
    email: "supervisor_operacoes_teste@garageinn.com",
    password: "Teste123!",
  },
  coordinator: {
    email: "encarregado_operacoes_teste@garageinn.com",
    password: "Teste123!",
  },
};
```

## Examples

### Login Test
```typescript
test("Should login successfully", async ({ page }) => {
  await page.goto("/login");

  await page.fill('input[name="email"]', "admin@garageinn.com.br");
  await page.fill('input[name="password"]', "Teste123!");
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/(dashboard|checklists)/);
  expect(page.url()).not.toContain("/login");
});
```

### CRUD Test
```typescript
test("should create and view ticket", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/tickets/commercial/new");

  await page.fill('input[id="title"]', "E2E Test Ticket");
  await page.fill('textarea[id="description"]', "Ticket description.");

  await page.click('button[id="commercial_type"]');
  await page.click("text=New Contract");

  await page.click('button:has-text("Create Ticket")');
  await page.waitForURL(/\/tickets\/commercial\/[\w-]+/);

  await expect(page.locator("h1")).toContainText("E2E Test Ticket");
});
```

### Permissions Test
```typescript
test.describe("Permissions", () => {
  test("admin should see triage button", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/tickets/commercial?status=awaiting_triage");

    await page.waitForSelector("table tbody tr");
    await page.locator("table tbody tr").first().click();

    await expect(
      page.locator('button:has-text("Perform Triage")')
    ).toBeVisible();
  });
});
```
