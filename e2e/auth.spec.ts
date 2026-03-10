import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/admin/overview')
    await expect(page).toHaveURL(/\/login/)
  })

  test('should show register page', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
  })
})
