# iOS Club Manager 4.0 - Frontend

A retro-styled Netscape Navigator-themed web interface built with **React** and **Vite**, engineered specifically for managing university club operations, team hierarchies, and secure inter-team communications (developed for club events like Gameflix 4.0).

---

## 🚀 Showcased Features & Capabilities

- **Retro Netscape Navigator UI**: A nostalgic, windowed 90s browser aesthetic featuring a classic toolbar (`Back`, `Forward`, `Reload`, `Home`), address bar status, and customized session frames.
- **Granular Role-Based Access Control (RBAC)**: Dynamically evaluates token-encoded permissions to restrict or grant access for **Admins**, **Team Leads**, **Co-Leads**, and **Regular Members**.
- **Team-Specific Chat Rooms**: Automatically maps and isolates chat channels to specific teams using dynamic **team IDs and team names**, ensuring members only interact within their assigned units.
- **Secure Leadership Lounge**: Restricted communication rooms locked down exclusively to authorized leads, co-leads, and administrators.
- **Local Network & Tunnel Deployment**: Pre-configured Vite options (`allowedHosts` and base path resolution) to allow seamless mobile or multi-device testing over local Wi-Fi and secure tunneling tools.

---

## 🛠️ Tech Stack

- **Framework**: React (with Vite)
- **Styling**: Custom CSS mirroring classic 90s browser window layouts
- **Communication**: REST APIs with polling for real-time messaging updates
- **Authentication**: JWT-based session handling

---

## ⚙️ Getting Started & Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd club-manager-frontend
