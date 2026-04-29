#!/bin/bash

set -e

# ===============================
# 🎨 Colors & UI
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
  echo -e "${GREEN}✅ $1 completed successfully${RESET}\n"
}

print_error() {
  echo -e "${RED}❌ $1 failed${RESET}"
  exit 1
}

# ===============================
# 🔍 Check root
# ===============================
if [[ $EUID -ne 0 ]]; then
  echo -e "${RED}Please run as root (sudo)${RESET}"
  exit 1
fi

# ===============================
# 🔄 Update system
# ===============================
print_header "Updating System Packages"
apt update -y && apt upgrade -y || print_error "System update"
print_success "System updated"

# ===============================
# 🐳 Install Docker
# ===============================
print_header "Installing Docker"

apt remove -y docker docker-engine docker.io containerd runc || true
apt install -y ca-certificates curl gnupg lsb-release unzip git

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) \
  signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list

apt update -y
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable docker
systemctl start docker

print_success "Docker installed"

# ===============================
# ☸️ Install kubectl
# ===============================
print_header "Installing kubectl"

KUBECTL_VERSION=$(curl -L -s https://dl.k8s.io/release/stable.txt)

curl -LO "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl"
install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
rm kubectl

print_success "kubectl installed"

# ===============================
# 🔀 Install kubectx + kubens
# ===============================
print_header "Installing kubectx & kubens"

git clone https://github.com/ahmetb/kubectx /opt/kubectx || true

ln -sf /opt/kubectx/kubectx /usr/local/bin/kubectx
ln -sf /opt/kubectx/kubens /usr/local/bin/kubens

print_success "kubectx & kubens installed"

# ===============================
# 🏗 Install eksctl
# ===============================
print_header "Installing eksctl"

ARCH=amd64
PLATFORM=$(uname -s)_$ARCH

curl -sLO "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_${PLATFORM}.tar.gz"
tar -xzf eksctl_${PLATFORM}.tar.gz -C /tmp
mv /tmp/eksctl /usr/local/bin
rm eksctl_${PLATFORM}.tar.gz

print_success "eksctl installed"

# ===============================
# ☁️ Install AWS CLI v2 (Latest)
# ===============================
print_header "Installing AWS CLI v2"

print_step "Downloading AWS CLI"
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"

print_step "Unzipping package"
unzip -q awscliv2.zip

print_step "Installing AWS CLI"
./aws/install --update

print_step "Cleaning up"
rm -rf aws awscliv2.zip

print_success "AWS CLI installed"

# ===============================
# 🔐 Docker Post Setup
# ===============================
print_header "Docker Post Setup"

usermod -aG docker $SUDO_USER || true

print_success "User added to docker group (logout/login required)"

# ===============================
# 🔍 Validation
# ===============================
print_header "Validating Installations"

docker --version || print_error "Docker"
kubectl version --client || print_error "kubectl"
kubectx -h >/dev/null || print_error "kubectx"
kubens -h >/dev/null || print_error "kubens"
eksctl version || print_error "eksctl"
aws --version || print_error "AWS CLI"

print_success "All tools validated"

# ===============================
# 🎉 Done
# ===============================
echo -e "${GREEN}"
echo "🎉 DevOps Stack Installation Complete!"
echo "-------------------------------------"
echo "✔ Docker"
echo "✔ kubectl"
echo "✔ kubectx / kubens"
echo "✔ eksctl"
echo "✔ AWS CLI"
echo "-------------------------------------"
echo -e "${RESET}"
