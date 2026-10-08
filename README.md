## MSI Product Scraper

A Node.js scraper for extracting product information from the MSI Store product page using Playwright.

## Requirements

Node.js
Playwright

## Installation

npm install
npx playwright install chromium

## Run

npm run scrape

The scraper extracts product data and saves the result to:

output/product.json

## Notes

The target MSI Store page blocks automated access in Chromium headless mode, so the scraper currently runs with headless: false.