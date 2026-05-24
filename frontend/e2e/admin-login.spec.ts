import { test, expect } from '@playwright/test'
import path from 'path'

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@airona.com'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'secret123'

test.describe('Admin Authentication', () => {
  test('redirects unauthenticated visits to /admin to the login page', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('shows validation errors for empty login form', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByRole('button', { name: /sign in/i }).click()
    // Form should prevent submission or show HTML5 validation
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('shows error for wrong credentials', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel(/email/i).fill('wrong@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/invalid|credentials|unauthorized/i)).toBeVisible({ timeout: 5000 })
  })

  test('logs in with valid credentials and saves auth state', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL)
    await page.getByLabel(/password/i).fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin$|\/admin\/$/, { timeout: 10000 })
    await expect(page.getByText(/dashboard/i)).toBeVisible()

    // Save auth state for dependent tests
    await page.context().storageState({
      path: path.join(__dirname, '.auth', 'admin.json'),
    })
  })
})
