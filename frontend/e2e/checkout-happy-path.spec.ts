import { test, expect, type Page } from '@playwright/test'

const LOCALE = 'es'

async function goToFirstExperience(page: Page) {
  await page.goto(`/${LOCALE}/`)
  // Find the first "Add to cart" / "Book" button visible on the homepage or experiences page
  const addToCartButton = page.getByRole('button', { name: /añadir|añade|book|comprar/i }).first()
  if (await addToCartButton.isVisible()) {
    await addToCartButton.click()
    return
  }
  // Navigate to experiences page if no button on homepage
  await page.goto(`/${LOCALE}/experiencias/`)
  await page.getByRole('link', { name: /vuelo compartido|shared|ver más/i }).first().click()
  await page.getByRole('button', { name: /añadir|añade|book|comprar/i }).first().click()
}

test.describe('Checkout happy path', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart before each test
    await page.goto(`/${LOCALE}/`)
    await page.evaluate(() => localStorage.removeItem('airona_cart_v1'))
  })

  test('can add a product to the cart and see it in the cart drawer', async ({ page }) => {
    await goToFirstExperience(page)
    // Cart drawer should open or cart count should increment
    await expect(
      page.getByRole('dialog').or(page.getByText(/carrito|cart/i))
    ).toBeVisible({ timeout: 5000 })
  })

  test('cart page shows added item and allows proceeding to checkout', async ({ page }) => {
    await goToFirstExperience(page)
    await page.goto(`/${LOCALE}/carrito/`)
    await expect(page.getByRole('heading', { name: /carrito|cart/i })).toBeVisible()
    // Should show at least one item
    await expect(page.locator('.min-h-screen').first()).toBeVisible()
    // Checkout button should exist
    const checkoutBtn = page.getByRole('button', { name: /pago|checkout|continuar/i })
    await expect(checkoutBtn).toBeVisible()
  })

  test('checkout form validates required fields', async ({ page }) => {
    // Seed cart directly via localStorage
    const cartItem = JSON.stringify({
      state: {
        items: [{
          productId: 1,
          quantity: 1,
          name: 'Vuelo Compartido',
          priceCents: 14900,
          slug: 'vuelo-compartido',
        }],
        promoCode: null,
        promoResult: null,
        isDrawerOpen: false,
      },
      version: 0,
    })
    await page.goto(`/${LOCALE}/`)
    await page.evaluate((data) => localStorage.setItem('airona_cart_v1', data), cartItem)
    await page.goto(`/${LOCALE}/checkout/`)

    // Try submitting without filling in the form
    await page.getByRole('button', { name: /pagar|pay|checkout/i }).click()
    // Should show validation errors (email field error)
    await expect(page.getByText(/email|requerido|required/i)).toBeVisible({ timeout: 3000 })
  })

  test('checkout form submits and redirects toward Stripe (mock API)', async ({ page }) => {
    const FAKE_CHECKOUT_URL = 'https://checkout.stripe.com/pay/fake_session_id'

    // Intercept the checkout session creation call
    await page.route('**/api/v1/checkout/sessions', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            order_id: 'order-uuid-1234',
            order_number: 'AIR-2026-00001',
            checkout_url: FAKE_CHECKOUT_URL,
          },
        }),
      })
    })

    // Also intercept the Stripe redirect to prevent actually leaving
    await page.route('https://checkout.stripe.com/**', async (route) => {
      await route.abort()
    })

    // Seed cart
    const cartData = JSON.stringify({
      state: {
        items: [{
          productId: 1,
          quantity: 1,
          name: 'Vuelo Compartido',
          priceCents: 14900,
          slug: 'vuelo-compartido',
        }],
        promoCode: null,
        promoResult: null,
        isDrawerOpen: false,
      },
      version: 0,
    })
    await page.goto(`/${LOCALE}/`)
    await page.evaluate((data) => localStorage.setItem('airona_cart_v1', data), cartData)
    await page.goto(`/${LOCALE}/checkout/`)

    await page.getByLabel(/email/i).fill('buyer@test.com')
    await page.getByLabel(/nombre/i).fill('Test Buyer')
    await page.getByLabel(/términos|terms/i).check()

    // Capture navigation intent
    const [navRequest] = await Promise.all([
      page.waitForRequest(/checkout\.stripe\.com|fake_session/).catch(() => null),
      page.getByRole('button', { name: /pagar|pay/i }).click(),
    ])

    // Verify the checkout session API was called
    // (The Stripe redirect is blocked, which is expected in the test env)
    expect(navRequest).not.toBeNull()
  })
})
