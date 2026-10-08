const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function scrape() {
    const browser = await chromium.launch({
        headless: false
    });

    try {
        const page = await browser.newPage({
            userAgent:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
        });

        await page.goto(
            "https://us-store.msi.com/Motherboards/Intel-Platform-Motherboard/INTEL-Z890/MAG-Z890-TOMAHAWK-WIFI",
            {
                waitUntil: "domcontentloaded"
            }
        );

        const title = await page
            .locator(".crop-text-2.title")
            .textContent();

        const brand = (await page.title()).split(" ")[0];

        const description = await page
            .locator(".crop-text-2.title")
            .locator("xpath=following-sibling::div[1]//p")
            .textContent();

        const priceText = await page
            .locator("#prices-new")
            .textContent();

        const price = Number(
            priceText.replace(/[^0-9.]/g, "")
        );

        const salePrice = null;

        const availabilityText = await page
            .locator("#prices-wrapper span")
            .nth(1)
            .textContent();

        const availabilityMap = {
            "In Stock": "in_stock",
            "Out of Stock": "out_of_stock",
            "Pre-Order": "pre_order"
        };

        const availability =
            availabilityMap[availabilityText.trim()] || null;

        const imageUrl = await page
            .locator("#imagePopup")
            .getAttribute("src");

        const images = await page
            .locator(".product-detail img")
            .evaluateAll(images =>
                images
                    .map(img => img.src)
                    .filter(src => src.includes("Z890TOMAHAWKWIFI"))
            );

        const additionalImageUrls = images
            .filter(url => url !== imageUrl)
            .filter(url => url.includes("1024x1024"));

        const categoryTree = await page
            .locator(".breadcrumb-item")
            .evaluateAll(items =>
                items.map(item => {
                    const link = item.querySelector("a");

                    return {
                        name: item.textContent.trim(),
                        url: link ? link.href : null
                    };
                })
            );

        const productCategory = categoryTree[1]?.name || null;

        const specs = await page.locator("table tr").evaluateAll(rows =>
            rows
                .map(row => {
                    const name = row.querySelector("th")?.textContent.trim();
                    const value = row.querySelector("td")?.textContent.trim();

                    return {
                        name: name || null,
                        value: value || null
                    };
                })
                .filter(spec => spec.name)
        );

        const ratingText = await page
            .locator("#description-list-average-rating")
            .textContent();

        const ratingMatch = ratingText.match(
            /([\d.]+)\s*\((\d+)\)/
        );

        const starRating = ratingMatch
            ? Number(ratingMatch[1])
            : null;

        const reviewCount = ratingMatch
            ? Number(ratingMatch[2])
            : null;

        const gtin =
            specs.find(
                spec => spec.name.toLowerCase() === "gtin"
            )?.value || null;

        const mpn =
            specs.find(
                spec => spec.name.toLowerCase() === "mpn"
            )?.value || null;

        const itemId = null;

        const scrapedAt = new Date().toISOString();

        const product = {
            url: "https://us-store.msi.com/Motherboards/Intel-Platform-Motherboard/INTEL-Z890/MAG-Z890-TOMAHAWK-WIFI",
            item_id: itemId,
            title,
            brand,
            product_category: productCategory,
            category_tree: categoryTree,
            description,
            price,
            sale_price: salePrice,
            availability,
            image_url: imageUrl,
            additional_image_urls: additionalImageUrls,
            specs,
            star_rating: starRating,
            review_count: reviewCount,
            gtin,
            mpn,
            scraped_at: scrapedAt
        };

        const outputPath = path.join(
            __dirname,
            "../output/product.json"
        );

        fs.writeFileSync(
            outputPath,
            JSON.stringify(product, null, 2)
        );

        console.log(`Product saved to ${outputPath}`);
    } catch (error) {
        console.error("Scraping failed:", error);
    } finally {
        await browser.close();
    }
}

scrape();