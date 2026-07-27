#!/bin/bash
# Bhrmshree Setup & Launch Utility

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
cat << 'EOF'
  ██████╗ ██╗  ██╗██████╗ ███╗   ███╗███████╗██╗  ██╗██████╗ ███████╗███████╗
  ██╔══██╗██║  ██║██╔══██╗████╗ ████║██╔════╝██║  ██║██╔══██╗██╔════╝██╔════╝
  ██████╔╝███████║██████╔╝██╔████╔██║███████╗███████║██████╔╝█████╗  █████╗  
  ██╔══██╗██╔══██║██╔══██╗██║╚██╔╝██║╚════██║██╔══██║██╔══██╗██╔══╝  ██╔══╝  
  ██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║███████║██║  ██║██║  ██║███████╗███████╗
  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝
EOF
echo -e "${NC}"

echo -e "${GREEN}Welcome to Bhrmshree - The Unified DevSecQA Engine${NC}"
echo "-------------------------------------------------------"

# 1. Check Prerequisites
echo -e "\n${BLUE}[1/4] Checking Prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    exit 1
fi
echo -e "✓ Node.js found: $(node -v)"

# 2. Install Dependencies
echo -e "\n${BLUE}[2/4] Installing Dependencies (this may take a minute)...${NC}"
npm install --silent
cd dashboard && npm install --silent && cd ..
npx playwright install chromium --silent
echo -e "✓ All dependencies installed successfully."

# 3. Setup Configuration
echo -e "\n${BLUE}[3/4] Configuring Bhrmshree...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Ask for API Key if not set
current_key=$(grep GITHUB_API_KEY .env | cut -d '=' -f2)
if [[ $current_key == *"your-github-api-key"* || -z $current_key ]]; then
    echo -e "${GREEN}Please enter your GitHub API Key / Token:${NC}"
    read -p "> " api_key
    sed -i "s/GITHUB_API_KEY=.*/GITHUB_API_KEY=$api_key/" .env
    echo -e "✓ GitHub API Key saved to .env"
else
    echo -e "✓ GitHub API Key already configured."
fi

# 4. Launch Options
echo -e "\n${BLUE}[4/4] What would you like to do?${NC}"
echo "1) Start a new Scan (Interactive)"
echo "2) Launch the Visual Dashboard"
echo "3) Exit setup"
read -p "Selection (1-3): " choice

case $choice in
    1)
        echo -e "\n${GREEN}--- Interactive Scan Setup ---${NC}"
        read -p "Enter Target URL (e.g. https://example.com): " target_url
        read -p "Enter local REPO path for code analysis: " repo_path
        echo -e "\n🚀 Starting Bhrmshree Scan for $target_url..."
        ./bhrmshree start URL=$target_url REPO=$repo_path
        ;;
    2)
        echo -e "\n🌍 Launching Bhrmshree Dashboard at http://localhost:3000..."
        ./bhrmshree dashboard
        ;;
    *)
        echo -e "\nSetup complete. You can run './bhrmshree help' at any time."
        exit 0
        ;;
esac
