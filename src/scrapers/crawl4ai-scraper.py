#!/usr/bin/env python3
"""
EVPriceHunt Enhanced Scraper with Crawl4AI
- Scrapes product data from Tesla accessory stores
- Generates AI descriptions using Claude
- Discovers new products automatically
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional
import anthropic

# Check for crawl4ai (requires Python 3.10+)
CRAWL4AI_AVAILABLE = False
try:
    from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
    from crawl4ai.extraction_strategy import JsonCssExtractionStrategy, LLMExtractionStrategy
    CRAWL4AI_AVAILABLE = True
except (ImportError, TypeError) as e:
    # TypeError: Python 3.9 can't parse the new union type hints (X | None)
    print(f"Note: crawl4ai not available ({type(e).__name__}). Using Shopify API only.")

# Paths
BASE_DIR = Path(__file__).parent.parent.parent
DATA_DIR = BASE_DIR / "data"
LATEST_JSON = DATA_DIR / "latest.json"

# Store configurations for Crawl4AI
STORES = {
    "tesery": {
        "name": "Tesery",
        "url": "https://www.tesery.com",
        "products_url": "https://www.tesery.com/collections/all",
        "affiliate": True,
        "discount": 5,
    },
    "yeslak": {
        "name": "Yeslak",
        "url": "https://yeslak.com",
        "products_url": "https://yeslak.com/collections/all",
        "affiliate": True,
        "discount": 20,
    },
    "hansshow": {
        "name": "Hansshow",
        "url": "https://www.hautopart.com",
        "products_url": "https://www.hautopart.com/collections/all",
        "affiliate": True,
        "discount": 20,
    },
    "jowua": {
        "name": "Jowua",
        "url": "https://www.jowua.com",
        "products_url": "https://www.jowua.com/collections/all",
        "affiliate": True,
        "discount": 5,
    },
}

# Tesla model keywords
MODEL_KEYWORDS = {
    "model-3": ["model 3", "model3", "m3", "tesla 3"],
    "model-y": ["model y", "modely", "my", "tesla y"],
    "model-s": ["model s", "models", "ms", "tesla s"],
    "model-x": ["model x", "modelx", "mx", "tesla x"],
    "cybertruck": ["cybertruck", "cyber truck", "ct"],
    "highland": ["highland", "2024 model 3", "new model 3"],
    "juniper": ["juniper", "2025 model y", "new model y"],
}

# Category keywords
CATEGORY_KEYWORDS = {
    "floor-mats": ["floor mat", "floor liner", "carpet", "all-weather mat"],
    "screen-protector": ["screen protector", "tempered glass", "display protector"],
    "center-console": ["center console", "console wrap", "armrest"],
    "charging": ["charger", "charging", "wall connector", "mobile connector"],
    "sunshade": ["sunshade", "sun shade", "windshield shade", "roof shade"],
    "spoiler": ["spoiler", "wing", "lip spoiler"],
    "wheel-covers": ["wheel cover", "hub cap", "aero cover"],
    "lighting": ["led", "light", "puddle light", "ambient"],
    "cargo-mats": ["cargo mat", "trunk liner", "cargo liner"],
    "seat-covers": ["seat cover", "seat protector"],
    "mud-flaps": ["mud flap", "splash guard"],
    "phone-mount": ["phone mount", "phone holder", "magsafe"],
}


def detect_models(title: str, description: str = "") -> list[str]:
    """Detect Tesla models from product title/description"""
    text = f"{title} {description}".lower()
    models = []
    for model_id, keywords in MODEL_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            models.append(model_id)
    return models if models else ["universal"]


def detect_category(title: str, product_type: str = "") -> str:
    """Detect product category from title"""
    text = f"{title} {product_type}".lower()
    for cat_id, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return cat_id
    return "other"


def generate_match_key(title: str) -> str:
    """Generate normalized match key for product deduplication"""
    import re
    # Remove special chars, lowercase, normalize spaces
    key = re.sub(r'[^a-z0-9\s]', '', title.lower())
    key = ' '.join(key.split())
    return key[:100]


class AIDescriptionGenerator:
    """Generate SEO-optimized product descriptions using Claude"""

    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if api_key:
            self.client = anthropic.Anthropic(api_key=api_key)
        else:
            self.client = None
            print("Warning: ANTHROPIC_API_KEY not set. AI descriptions disabled.")

    async def generate_description(self, product: dict) -> str:
        """Generate an SEO-optimized description for a product"""
        if not self.client:
            return self._fallback_description(product)

        try:
            models = ", ".join(product.get("models", ["Tesla"]))

            response = self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=200,
                messages=[{
                    "role": "user",
                    "content": f"""Write a concise 2-sentence product description for SEO.

Product: {product.get('title', '')}
Category: {product.get('category', '')}
Compatible with: {models}
Store: {product.get('source', '')}

Requirements:
- Natural, not salesy
- Include compatibility info
- Mention key benefit
- Under 160 characters total"""
                }]
            )

            return response.content[0].text.strip()
        except Exception as e:
            print(f"AI description error: {e}")
            return self._fallback_description(product)

    def _fallback_description(self, product: dict) -> str:
        """Fallback description without AI"""
        title = product.get("title", "Tesla accessory")
        models = product.get("models", ["Tesla vehicles"])
        category = product.get("category", "accessory")
        source = product.get("source", "")

        model_text = ", ".join(m.replace("-", " ").title() for m in models if m != "universal")
        if not model_text:
            model_text = "all Tesla vehicles"

        return f"Premium {category.replace('-', ' ')} designed for {model_text}. Quality Tesla accessory from {source}."


class EnhancedProductScraper:
    """Enhanced scraper using Crawl4AI"""

    def __init__(self):
        self.ai_gen = AIDescriptionGenerator()
        self.products = []

    async def scrape_shopify_api(self, store_id: str, store_config: dict) -> list[dict]:
        """Scrape products via Shopify JSON API (existing method, most reliable)"""
        import aiohttp

        products = []
        page = 1
        base_url = store_config["url"]

        async with aiohttp.ClientSession() as session:
            while True:
                url = f"{base_url}/products.json?limit=250&page={page}"
                try:
                    async with session.get(url, timeout=30) as resp:
                        if resp.status != 200:
                            break
                        data = await resp.json()

                        if not data.get("products"):
                            break

                        for p in data["products"]:
                            for variant in p.get("variants", [{}]):
                                product = {
                                    "title": p.get("title", ""),
                                    "price": float(variant.get("price", 0)),
                                    "currency": "USD",
                                    "url": f"{base_url}/products/{p.get('handle', '')}",
                                    "image": p.get("images", [{}])[0].get("src", "") if p.get("images") else "",
                                    "source": store_config["name"],
                                    "sourceId": store_id,
                                    "description": (p.get("body_html", "") or "")[:200],
                                    "vendor": p.get("vendor", ""),
                                    "productType": p.get("product_type", ""),
                                    "tags": p.get("tags", []) if isinstance(p.get("tags"), list) else p.get("tags", "").split(", "),
                                    "scrapedAt": datetime.utcnow().isoformat() + "Z",
                                }

                                # Detect models and category
                                product["models"] = detect_models(product["title"], product["description"])
                                product["category"] = detect_category(product["title"], product["productType"])
                                product["matchKey"] = generate_match_key(product["title"])

                                if product["price"] >= 10:  # Min price filter
                                    products.append(product)

                        page += 1
                        await asyncio.sleep(0.5)  # Rate limiting

                except Exception as e:
                    print(f"Error scraping {store_config['name']} page {page}: {e}")
                    break

        return products

    async def scrape_with_crawl4ai(self, store_id: str, store_config: dict) -> list[dict]:
        """Scrape products using Crawl4AI (for stores without JSON API)"""
        if not CRAWL4AI_AVAILABLE:
            print(f"Crawl4AI not available, skipping {store_config['name']}")
            return []

        products = []

        browser_config = BrowserConfig(
            headless=True,
            verbose=False,
        )

        # CSS extraction strategy for Shopify product grids
        extraction_strategy = JsonCssExtractionStrategy(
            schema={
                "name": "products",
                "baseSelector": ".product-card, .product-item, [data-product-id]",
                "fields": [
                    {"name": "title", "selector": ".product-title, .product-name, h2, h3", "type": "text"},
                    {"name": "price", "selector": ".product-price, .price, [data-product-price]", "type": "text"},
                    {"name": "url", "selector": "a", "type": "attribute", "attribute": "href"},
                    {"name": "image", "selector": "img", "type": "attribute", "attribute": "src"},
                ]
            }
        )

        try:
            async with AsyncWebCrawler(config=browser_config) as crawler:
                result = await crawler.arun(
                    url=store_config["products_url"],
                    config=CrawlerRunConfig(
                        extraction_strategy=extraction_strategy,
                        wait_for=".product-card, .product-item",
                        page_timeout=30000,
                    )
                )

                if result.extracted_content:
                    data = json.loads(result.extracted_content)
                    for item in data.get("products", []):
                        # Parse price
                        price_str = item.get("price", "0")
                        price = float(''.join(c for c in price_str if c.isdigit() or c == '.') or 0)

                        product = {
                            "title": item.get("title", "").strip(),
                            "price": price,
                            "currency": "USD",
                            "url": item.get("url", ""),
                            "image": item.get("image", ""),
                            "source": store_config["name"],
                            "sourceId": store_id,
                            "description": "",
                            "vendor": "",
                            "productType": "",
                            "tags": [],
                            "scrapedAt": datetime.utcnow().isoformat() + "Z",
                        }

                        # Fix relative URLs
                        if product["url"] and not product["url"].startswith("http"):
                            product["url"] = store_config["url"] + product["url"]
                        if product["image"] and not product["image"].startswith("http"):
                            product["image"] = "https:" + product["image"]

                        product["models"] = detect_models(product["title"])
                        product["category"] = detect_category(product["title"])
                        product["matchKey"] = generate_match_key(product["title"])

                        if product["price"] >= 10 and product["title"]:
                            products.append(product)

        except Exception as e:
            print(f"Crawl4AI error for {store_config['name']}: {e}")

        return products

    async def enhance_descriptions(self, products: list[dict], batch_size: int = 10) -> list[dict]:
        """Add AI-generated descriptions to products missing them"""
        enhanced = []

        for i, product in enumerate(products):
            # Only generate if description is short/missing
            if len(product.get("description", "")) < 50:
                product["description"] = await self.ai_gen.generate_description(product)

                # Rate limit AI calls
                if (i + 1) % batch_size == 0:
                    await asyncio.sleep(1)

            enhanced.append(product)

            if (i + 1) % 100 == 0:
                print(f"Enhanced {i + 1}/{len(products)} products")

        return enhanced

    async def scrape_all_stores(self, enhance_descriptions: bool = True) -> list[dict]:
        """Scrape all configured stores"""
        all_products = []

        for store_id, config in STORES.items():
            print(f"\nScraping {config['name']}...")

            # Try Shopify API first (most reliable)
            products = await self.scrape_shopify_api(store_id, config)

            # Fall back to Crawl4AI if API fails
            if not products and CRAWL4AI_AVAILABLE:
                print(f"  API failed, trying Crawl4AI...")
                products = await self.scrape_with_crawl4ai(store_id, config)

            print(f"  Found {len(products)} products")
            all_products.extend(products)

        # Enhance descriptions with AI
        if enhance_descriptions and all_products:
            print(f"\nEnhancing descriptions for {len(all_products)} products...")
            all_products = await self.enhance_descriptions(all_products)

        return all_products

    def merge_with_existing(self, new_products: list[dict]) -> list[dict]:
        """Merge new products with existing data, updating prices"""
        # Load existing
        existing = {}
        if LATEST_JSON.exists():
            with open(LATEST_JSON) as f:
                for p in json.load(f):
                    key = f"{p.get('sourceId', '')}:{p.get('matchKey', '')}"
                    existing[key] = p

        # Merge
        merged = {}
        new_count = 0
        updated_count = 0

        for p in new_products:
            key = f"{p.get('sourceId', '')}:{p.get('matchKey', '')}"

            if key in existing:
                # Update price but keep better description
                old = existing[key]
                if len(old.get("description", "")) > len(p.get("description", "")):
                    p["description"] = old["description"]
                updated_count += 1
            else:
                new_count += 1

            merged[key] = p

        # Keep products from other stores not scraped this time
        scraped_stores = {p["sourceId"] for p in new_products}
        for key, p in existing.items():
            if p.get("sourceId") not in scraped_stores:
                merged[key] = p

        print(f"\nMerge results: {new_count} new, {updated_count} updated, {len(merged)} total")
        return list(merged.values())

    def save_products(self, products: list[dict]):
        """Save products to latest.json with backup"""
        DATA_DIR.mkdir(exist_ok=True)

        # Backup existing
        if LATEST_JSON.exists():
            backup_name = f"backup-{datetime.now().strftime('%Y-%m-%d')}.json"
            backup_path = DATA_DIR / backup_name
            if not backup_path.exists():
                import shutil
                shutil.copy(LATEST_JSON, backup_path)
                print(f"Created backup: {backup_name}")

        # Save new data
        with open(LATEST_JSON, "w") as f:
            json.dump(products, f, indent=2)

        print(f"Saved {len(products)} products to latest.json")


async def main():
    """Main entry point"""
    print("=" * 60)
    print("EVPriceHunt Enhanced Scraper")
    print("=" * 60)

    scraper = EnhancedProductScraper()

    # Scrape all stores
    products = await scraper.scrape_all_stores(enhance_descriptions=True)

    if products:
        # Merge with existing data
        merged = scraper.merge_with_existing(products)

        # Save
        scraper.save_products(merged)

        # Stats
        print("\n" + "=" * 60)
        print("SCRAPING COMPLETE")
        print("=" * 60)
        print(f"Total products: {len(merged)}")
        print(f"Stores scraped: {len(STORES)}")

        # By store
        by_store = {}
        for p in merged:
            store = p.get("source", "Unknown")
            by_store[store] = by_store.get(store, 0) + 1

        print("\nProducts by store:")
        for store, count in sorted(by_store.items(), key=lambda x: -x[1]):
            print(f"  {store}: {count}")
    else:
        print("No products scraped!")


if __name__ == "__main__":
    asyncio.run(main())
