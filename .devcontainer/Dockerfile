FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Upgrade base containers
RUN apt-get update && apt-get upgrade -y

# Install node
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && \
    apt-get install -y nodejs
