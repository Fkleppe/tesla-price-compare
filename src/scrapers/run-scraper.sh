#!/bin/bash
# EVPriceHunt Daily Scraper Runner
# Run this script manually or via cron job

set -e

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "========================================"
echo "EVPriceHunt Scraper - $(date)"
echo "========================================"

# Check for virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Check Python version
python3 --version

# Run the scraper
echo ""
echo "Starting scraper..."
python3 src/scrapers/crawl4ai-scraper.py

# Check if data was updated
if [ -f "data/latest.json" ]; then
    PRODUCT_COUNT=$(python3 -c "import json; print(len(json.load(open('data/latest.json'))))")
    echo ""
    echo "✓ Scraping complete: $PRODUCT_COUNT products in latest.json"

    # Optional: Trigger Vercel rebuild if VERCEL_DEPLOY_HOOK is set
    if [ -n "$VERCEL_DEPLOY_HOOK" ]; then
        echo "Triggering Vercel rebuild..."
        curl -s -X POST "$VERCEL_DEPLOY_HOOK" > /dev/null
        echo "✓ Vercel rebuild triggered"
    fi
else
    echo "✗ Error: latest.json not found after scraping"
    exit 1
fi

echo ""
echo "========================================"
echo "Scraper finished at $(date)"
echo "========================================"
