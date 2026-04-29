#!/bin/bash

set -e

# ===============================
# 🎨 Colors
# ===============================
GREEN="\033[1;32m"
BLUE="\033[1;34m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
CYAN="\033[1;36m"
RESET="\033[0m"

print_header() {
  echo -e "\n${CYAN}=============================================${RESET}"
  echo -e "${BLUE}🚀 $1${RESET}"
  echo -e "${CYAN}=============================================${RESET}\n"
}

print_step() {
  echo -e "${YELLOW}👉 $1...${RESET}"
}

print_success() {
  echo -e "${GREEN}✅ $1 completed${RESET}\n"
}

# ===============================
# 👤 ROOT CHECK
# ===============================
if [[ "$EUID" -ne 0 ]]; then
  echo -e "${RED}Run this script as root${RESET}"
  exit 1
fi

ROOT_HOME="/root"

print_header "Setting up ROOT Zsh (Theme: fox)"

# ===============================
# 📦 Install Dependencies
# ===============================
print_header "Installing Dependencies"

apt update -y
apt install -y zsh git curl wget unzip

print_success "Dependencies installed"

# ===============================
# 🧹 Clean Broken Install (SAFE)
# ===============================
print_header "Cleaning Old Setup (if any)"

rm -rf "$ROOT_HOME/.oh-my-zsh"

print_success "Old setup cleaned"

# ===============================
# 🐚 Install Oh My Zsh
# ===============================
print_header "Installing Oh My Zsh"

export HOME=$ROOT_HOME
RUNZSH=no CHSH=no sh -c \
"$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

print_success "Oh My Zsh installed"

# ===============================
# 🔌 Install Plugins
# ===============================
print_header "Installing Plugins"

ZSH_CUSTOM="$ROOT_HOME/.oh-my-zsh/custom"

git clone https://github.com/zsh-users/zsh-autosuggestions \
$ZSH_CUSTOM/plugins/zsh-autosuggestions || true

git clone https://github.com/zsh-users/zsh-syntax-highlighting \
$ZSH_CUSTOM/plugins/zsh-syntax-highlighting || true

print_success "Plugins installed"

# ===============================
# ⚙️ Configure Zsh
# ===============================
print_header "Configuring Zsh"

ZSHRC="$ROOT_HOME/.zshrc"

# Backup old file
cp "$ZSHRC" "${ZSHRC}.backup" 2>/dev/null || true

# Write clean config
cat > "$ZSHRC" <<'EOF'
export ZSH="$HOME/.oh-my-zsh"

# Theme
ZSH_THEME="fox"

# Plugins
plugins=(git docker kubectl zsh-autosuggestions zsh-syntax-highlighting)

# Load Oh My Zsh
source $ZSH/oh-my-zsh.sh

# Enable completion
autoload -Uz compinit && compinit

# kubectl autocomplete
if command -v kubectl >/dev/null 2>&1; then
  source <(kubectl completion zsh)
  alias k=kubectl
  compdef __start_kubectl k
fi

# docker autocomplete
if command -v docker >/dev/null 2>&1; then
  source <(docker completion zsh)
fi
EOF

print_success ".zshrc configured"

# ===============================
# 🔁 Set Default Shell
# ===============================
print_header "Setting Default Shell"

chsh -s $(which zsh) root || true

print_success "Shell set to Zsh"

# ===============================
# 🎉 Done
# ===============================
echo -e "${GREEN}"
echo "🎉 ROOT Zsh Setup Complete!"
echo "-------------------------------------"
echo "Theme: fox"
echo "Autocomplete: kubectl, docker"
echo "-------------------------------------"
echo ""
echo "👉 Run: zsh"
echo -e "${RESET}"
