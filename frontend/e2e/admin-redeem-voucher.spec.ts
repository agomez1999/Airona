import { test, expect } from '@playwright/test'

const TEST_VOUCHER_CODE = process.env.E2E_TEST_VOUCHER ?? 'AIRONA-TEST-ABCD-EFGH'

// These tests depend on admin-setup project (saved auth state from admin-login.spec.ts)
test.describe('Admin — Voucher Redemption', () => {
  test('validate page renders QR scanner and manual entry', async ({ page }) => {
    await page.goto('/admin/vouchers/validate')
    await expect(page.getByRole('heading', { name: /validate|validar/i })).toBeVisible()
    // Manual code input should be visible
    await expect(page.getByPlaceholder(/AIRONA|code|código/i)).toBeVisible()
  })

  test('validate page shows error for non-existent code', async ({ page }) => {
    await page.route('**/api/v1/admin/vouchers/validate**', async (route) => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Voucher not found.', valid: false }),
      })
    })

    await page.goto('/admin/vouchers/validate')
    await page.getByPlaceholder(/AIRONA|code|código/i).fill('AIRONA-FAKE-FAKE-FAKE')
    await page.getByRole('button', { name: /validate|validar|check/i }).click()
    await expect(page.getByText(/not found|no encontrado|invalid|inválido/i)).toBeVisible({ timeout: 5000 })
  })

  test('validate page shows redemption preview for valid active voucher', async ({ page }) => {
    await page.route('**/api/v1/admin/vouchers/validate**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            valid: true,
            code: TEST_VOUCHER_CODE,
            status: 'active',
            customer_email: 'guest@test.com',
            product_name: 'Vuelo Compartido',
            expires_at: '2027-05-01T00:00:00Z',
          },
        }),
      })
    })

    await page.goto('/admin/vouchers/validate')
    await page.getByPlaceholder(/AIRONA|code|código/i).fill(TEST_VOUCHER_CODE)
    await page.getByRole('button', { name: /validate|validar|check/i }).click()

    // Preview step should show voucher details
    await expect(page.getByText(/Vuelo Compartido|voucher|vale/i)).toBeVisible({ timeout: 5000 })
    // Confirm redeem button should appear
    await expect(page.getByRole('button', { name: /redeem|canjear|confirm/i })).toBeVisible()
  })

  test('confirms redemption and shows success state', async ({ page }) => {
    // Step 1: validate (returns preview)
    await page.route('**/api/v1/admin/vouchers/validate**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            valid: true,
            code: TEST_VOUCHER_CODE,
            status: 'active',
            customer_email: 'guest@test.com',
            product_name: 'Vuelo Compartido',
            expires_at: '2027-05-01T00:00:00Z',
          },
        }),
      })
    })

    // Step 2: redeem endpoint
    await page.route(`**/api/v1/admin/vouchers/**/redeem`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Vale canjeado con éxito.',
          voucher: {
            code: TEST_VOUCHER_CODE,
            status: 'redeemed',
            redeemed_at: new Date().toISOString(),
          },
        }),
      })
    })

    await page.goto('/admin/vouchers/validate')
    await page.getByPlaceholder(/AIRONA|code|código/i).fill(TEST_VOUCHER_CODE)
    await page.getByRole('button', { name: /validate|validar|check/i }).click()

    // Wait for preview to appear, then confirm
    await page.getByRole('button', { name: /redeem|canjear|confirm/i }).click()

    // Success state should show "redeemed" status
    await expect(
      page.getByText(/redeemed|canjeado|success|éxito/i)
    ).toBeVisible({ timeout: 5000 })
  })

  test('vouchers list page shows filter controls', async ({ page }) => {
    await page.goto('/admin/vouchers')
    await expect(page.getByRole('heading', { name: /vouchers|vales/i })).toBeVisible()
    // Should show search or filter UI
    await expect(
      page.getByPlaceholder(/search|buscar/i)
        .or(page.getByRole('combobox'))
    ).toBeVisible()
  })
})
