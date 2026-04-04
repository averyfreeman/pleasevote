import os
from playwright.sync_api import sync_playwright, expect

def verify_hero_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Wait for dev server to be ready
        url = "http://localhost:3000"
        max_retries = 10
        import time
        for i in range(max_retries):
            try:
                page.goto(url)
                break
            except Exception:
                if i == max_retries - 1:
                    raise
                print(f"Waiting for server... {i+1}")
                time.sleep(2)

        # Take screenshot of the Hero section
        page.set_viewport_size({"width": 1280, "height": 800})

        # Check if the title is visible and not overlapped (visually check from screenshot)
        # We can also check if the elements exist
        expect(page.get_by_role("heading", name="PLEASE VOTE™")).to_be_visible()

        page.screenshot(path="/home/jules/verification/hero_fixed.png")
        print("Screenshot saved to /home/jules/verification/hero_fixed.png")

        # Check favicon in HTML
        favicon = page.locator('link[rel="icon"]').first
        print(f"Favicon href: {favicon.get_attribute('href')}")

        browser.close()

if __name__ == "__main__":
    os.makedirs("/home/jules/verification", exist_ok=True)
    verify_hero_fix()
