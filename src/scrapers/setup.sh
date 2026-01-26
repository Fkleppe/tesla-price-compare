#!/bin/bash
# EVPriceHunt Scraper Setup
# Run this once to set up the scraper environment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "========================================"
echo "EVPriceHunt Scraper Setup"
echo "========================================"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
echo ""
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Install Crawl4AI browser dependencies
echo ""
echo "Setting up Crawl4AI browser..."
crawl4ai-setup || echo "Note: crawl4ai-setup may require manual browser installation"

# Create data directory if it doesn't exist
mkdir -p data

# Make run script executable
chmod +x src/scrapers/run-scraper.sh

echo ""
echo "========================================"
echo "Setup complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Set your API key: export ANTHROPIC_API_KEY='your-key'"
echo "2. Run the scraper: ./src/scrapers/run-scraper.sh"
echo ""
echo "Optional: Set up daily cron job:"
echo "  crontab -e"
echo "  Add: 0 6 * * * cd $PROJECT_ROOT && ./src/scrapers/run-scraper.sh >> logs/scraper.log 2>&1"
echo ""
echo "Optional: Set VERCEL_DEPLOY_HOOK to auto-rebuild after scraping"
