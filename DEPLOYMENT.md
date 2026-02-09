# Deploying DevCommand to Proxmox (Local Network)

This guide explains how to host this system on a Proxmox VM or LXC Container.

## 1. Prerequisites
- A VM or LXC container running (recommended: Ubuntu 22.04 or Debian 12).
- Docker and Docker Compose installed.
- Git installed.

## 2. Server Preparation
On your Proxmox terminal (within the VM/LXC):

```bash
# Clone the repository
git clone <your-repo-url> devcommand
cd devcommand

# Ensure data directory exists for volumes
mkdir -p data
```

## 3. Configuration
The system is configured to work out-of-the-box. The frontend automatically proxies requests to the backend using the server's local network.

## 4. Launching the System
```bash
docker-compose up -d --build
```

## 5. Accessing the App
Once launched, the app will be available at your Proxmox VM's IP address on port **8080**.

- **Web interface:** `http://<PROXMOX_VM_IP>:8080`
- **AI API Docs:** `http://<PROXMOX_VM_IP>:8080/api-docs`

## 6. Proxmox Specific Tips
- **LXC Containers:** If using LXC, ensure "Nesting" is enabled in the container features so Docker can run properly.
- **Port Forwarding:** If you want to access this from outside your local network, you'll need to forward port `8080` on your router to the VM IP, or set up a Cloudflare Tunnel.
- **Backups:** Proxmox has an excellent backup system. Back up the entire VM to safe-keep your `db-data` volume.

## 7. AI Agent Connectivity
To let an AI Agent work with your local Proxmox instance from another machine, provide the agent with your Proxmox IP and the `AI_AGENT_SKILLS.md` guide.
