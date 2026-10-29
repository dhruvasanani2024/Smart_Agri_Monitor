<div align="center">

# 🌱 Smart Agri Monitor

### Satellite-Powered Precision Agriculture & Farm Health Analytics

*Empowering farmers and agronomists with on-demand satellite imagery analysis to monitor crop vitality, water stress, soil moisture, salinity, and burn damage — directly from any browser or mobile device.*

<p align="center">
  <a href="https://github.com/dhruvasanani2024/Smart_Agri_Monitor/stargazers"><img src="https://img.shields.io/github/stars/dhruvasanani2024/Smart_Agri_Monitor?style=for-the-badge&color=2e7d32&logo=github" alt="GitHub Stars"></a>
  <a href="https://github.com/dhruvasanani2024/Smart_Agri_Monitor/network/members"><img src="https://img.shields.io/github/forks/dhruvasanani2024/Smart_Agri_Monitor?style=for-the-badge&color=388e3c&logo=github" alt="GitHub Forks"></a>
  <a href="https://github.com/dhruvasanani2024/Smart_Agri_Monitor/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-43a047?style=for-the-badge" alt="License MIT"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19.3-61dafb?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Python-3.12-3776ab?style=flat-square&logo=python" alt="Python">
  <img src="https://img.shields.io/badge/Google%20Earth%20Engine-4285F4?style=flat-square&logo=google-earth" alt="Earth Engine">
  <img src="https://img.shields.io/badge/Sentinel--2-ESA%20Copernicus-003399?style=flat-square" alt="Sentinel-2">
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47a248?style=flat-square&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Leaflet-1.9-199900?style=flat-square&logo=leaflet" alt="Leaflet">
  <img src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel" alt="Vercel">
</p>

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-spectral-indices--agronomic-insights">Spectral Indices</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-license">License</a>
</p>

</div>

---

## 📖 Overview

**Smart Agri Monitor** bridges the gap between sophisticated Earth Observation science and everyday farming decisions. By harnessing high-resolution **Sentinel-2 Surface Reflectance (Harmonized)** imagery from the **European Space Agency (ESA)** and computational power from **Google Earth Engine (GEE)**, the platform turns complex multispectral data into simple, actionable visual maps.

Farmers can delineate their fields on an interactive map, run remote-sensing analyses in seconds, interpret results through intuitive plain-language legends, and manage multiple farm boundaries with cloud persistence.

---

## ✨ Key Features

### 🛰️ Multispectral Remote Sensing (Sentinel-2 & GEE)
- **7 Comprehensive Indices**: Instant computation of NDVI, NDWI, MNDWI, NDMI, Salinity Index, NBR, and True Color composites.
- **Automated Cloud Filtering**: Selects the clearest, least-cloudy Sentinel-2 scene for your selected field geometry and target timeframe.
- **Dynamic Tile Streaming**: Google Earth Engine generates optimized map tiles streamed directly onto the map overlay with near-zero latency.

### 🗺️ Interactive Geospatial Mapping
- **Polygon Drawing Tools**: Integrated `leaflet-draw` interface allows precise parcel boundary delineation.
- **3 Basemap Layers**: Seamlessly toggle between **Street** (OpenStreetMap), **Satellite** (Esri World Imagery High-Res), and **Terrain** (OpenTopoMap).
- **GPS Auto-Location**: One-click "Find My Location" to locate your current field coordinates via browser geolocation.
- **Dynamic Interpretive Legend**: Real-time legend updates for every analysis mode, mapping color bands to actionable agronomic advice.

### 💾 Farm Parcel Management & Cloud Storage
- **Named Field Profiles**: Save drawn field boundaries with custom labels (e.g., *"North Wheat Field"*).
- **Multi-Farm Switching**: Instant recall of saved parcels with automatic map centering.
- **Cloud Persistence**: Backed by **MongoDB Atlas** for reliable cross-session synchronization.

### 🔐 Secure User Authentication
- **Account Protection**: Built-in signup and login with secure **bcrypt** password hashing (salt rounds: 10).
- **Data Isolation**: User parcels are securely isolated per user account.
- **Persistent Sessions**: Seamless automatic login restoration with `localStorage` fallback.

### 📱 Farmer-Centric & Mobile Responsive
- **Touch-Optimized**: Designed for field use on smartphones, tablets, and desktops.
- **Collapsible Bottom-Sheet Drawer**: Maximizes map viewport on mobile screens while keeping analytical controls one tap away.
- **First-Time Guided Walkthrough**: Built-in prompts guide users through polygon drawing and analysis selection without requiring technical training.

---

## 📊 Spectral Indices & Agronomic Insights

Smart Agri Monitor computes indices directly from calibrated Sentinel-2 bottom-of-atmosphere reflectance bands:

| Index | Name | Spectral Formula | Sentinel-2 Bands | What It Detects | Farmer Actionable Guidance |
|:---:|:---|:---:|:---:|:---|:---|
| **🌿 NDVI** | Normalized Difference Vegetation Index | $\frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}}$ | `B8`, `B4` | Chlorophyll density, biomass, and overall crop vigor | **Green**: Vigorous growth.<br>**Yellow/Red**: Check for nutrient deficiency, pest infestation, or water stress. |
| **💧 NDWI** | Normalized Difference Water Index | $\frac{\text{Green} - \text{NIR}}{\text{Green} + \text{NIR}}$ | `B3`, `B8` | Open surface water, waterlogged furrows, and flood zones | **Blue**: Standing surface water.<br>**Yellow/Orange**: Dry cropland. |
| **🌊 MNDWI** | Modified Normalized Difference Water Index | $\frac{\text{Green} - \text{SWIR}}{\text{Green} + \text{SWIR}}$ | `B3`, `B11` | Canals, shallow ditches, and irrigation runoffs | Detects fine water features and farm drainage lines without bare-soil interference. |
| **💦 NDMI** | Normalized Difference Moisture Index | $\frac{\text{NIR} - \text{SWIR}}{\text{NIR} + \text{SWIR}}$ | `B8`, `B11` | Canopy water content and root-zone moisture levels | **Green**: Well-irrigated crops.<br>**Red**: Critical water stress — schedule irrigation immediately. |
| **🧂 Salinity** | Soil Salinity Index | $\sqrt{\text{Blue} \times \text{Red}}$ | `B2`, `B4` | White salt encrustation and soil salinization | **Red**: High salt concentration — treat with soil conditioning (e.g., gypsum) or leaching. |
| **🔥 NBR** | Normalized Burn Ratio | $\frac{\text{NIR} - \text{SWIR2}}{\text{NIR} + \text{SWIR2}}$ | `B8`, `B12` | Post-harvest crop residue burn, fire severity, and char | **Red/Orange**: Active burn scar or scorched ground.<br>**Green**: Unburned, healthy biomass. |
| **🛰️ True Color** | Natural Visual Composite | Composite RGB | `B4`, `B3`, `B2` | Optical satellite photograph | Ground-truth visual verification of physical boundaries, tracks, and soil patterns. |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend (Next.js 16 + React 19)"]
        UI[Farmer Web / Mobile UI]
        Map[Leaflet Map Container]
        Draw[Leaflet-Draw Polygon Vector]
        Auth[Auth Gate & Session Store]
    end

    subgraph Serverless["Vercel Serverless Layer"]
        NextAPI["Next.js Node API Routes (/api/auth, /api/farms)"]
        PythonAPI["Python 3.12 Engine (/api/analyze)"]
        Rewrite["vercel.json Routing Rewrite"]
    end

    subgraph CloudServices["External Cloud Platforms"]
        GEE["Google Earth Engine (Sentinel-2 Harmonized)"]
        Mongo[("MongoDB Atlas Cloud Database")]
    end

    UI -->|1. Draw boundary| Draw
    Draw -->|2. Coordinates & index| Map
    Map -->|3. POST /api/analyze| Rewrite
    Rewrite -->|4. Proxies request| PythonAPI
    PythonAPI -->|5. Service Account Auth| GEE
    GEE -->|6. Computes index & generates MapID| PythonAPI
    PythonAPI -->|7. Returns tile URL template| Map
    Map -->|8. Renders XYZ TileLayer overlay| UI

    Auth -->|User credentials| NextAPI
    UI -->|Save / Load farms| NextAPI
    NextAPI -->|Query / Persist| Mongo
```

### Analysis Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as 👨‍🌾 Farmer
    participant UI as 💻 Next.js Leaflet UI
    participant PyAPI as 🐍 Python Serverless (/api/analyze)
    participant GEE as 🛰️ Google Earth Engine
    participant DB as 🍃 MongoDB Atlas

    Farmer->>UI: Draws polygon boundary around parcel
    Farmer->>UI: Selects "NDVI – Crop Health" & clicks Analyze
    UI->>PyAPI: POST /api/analyze { coordinates, analysis: "ndvi" }
    PyAPI->>GEE: ee.Initialize() via Service Account
    PyAPI->>GEE: Filter COPERNICUS/S2_SR_HARMONIZED by ROI & cloud %
    PyAPI->>GEE: Compute normalizedDifference(['B8', 'B4']) & apply color palette
    GEE-->>PyAPI: Return MapID & tile URL template
    PyAPI-->>UI: { status: "success", tile_url: "https://earthengine.googleapis.com/..." }
    UI-->>Farmer: Renders dynamic satellite overlay on top of field
    Farmer->>UI: Clicks "Save Farm Boundary"
    UI->>DB: POST /api/farms { userEmail, farmName, coordinates }
    DB-->>UI: Farm profile persisted
```

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
|:---|:---|:---|
| **Frontend Framework** | [Next.js 16.4](https://nextjs.org/) | App Router, Dynamic Client Imports, Server-Side Rendering |
| **UI Library** | [React 19](https://react.dev/) | State management, responsive hooks, micro-interactions |
| **Geospatial Mapping** | [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/) | Interactive map rendering, tile layer switching |
| **Vector Drawing** | [Leaflet-Draw](https://github.com/Leaflet/Leaflet.draw) & [React-Leaflet-Draw](https://github.com/alex3165/react-leaflet-draw) | Spatial polygon boundary delineation |
| **Satellite Analytics** | [Google Earth Engine Python API](https://developers.google.com/earth-engine) | Cloud geospatial computation on Sentinel-2 SR |
| **Authentication Engine** | [google-auth](https://pypi.org/project/google-auth/) | Google Cloud IAM Service Account OAuth2 credentials |
| **Backend Runtime** | [Python 3.12](https://www.python.org/) & [Node.js](https://nodejs.org/) | Hybrid Vercel Serverless Architecture |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud NoSQL storage for farm boundaries and user accounts |
| **Security** | [bcryptjs](https://www.npmjs.com/package/bcryptjs) | Cryptographic password hashing |
| **Styling** | Vanilla CSS-in-JS & Inter Typography | Polished glassmorphism, responsive drawer, color-safe badges |
| **Deployment** | [Vercel](https://vercel.com/) | Global edge network with zero-config serverless rewrites |

---

## 📂 Project Structure

```
smart-agri-monitor/
├── .env.example             # Template for required environment variables
├── .gitignore               # Standard Git ignore rules
├── vercel.json              # Vercel serverless rewrite rules (/api/analyze -> /api/index.py)
├── package.json             # Node dependencies and build scripts
├── tsconfig.json            # TypeScript configuration
├── next.config.ts           # Next.js build configuration
│
├── api/                     # 🐍 Python Serverless Analytics Engine
│   ├── index.py             # Earth Engine handler: Sentinel-2 image filtering & band math
│   └── requirements.txt     # Python dependencies (earthengine-api, google-auth)
│
├── app/                     # ⚡ Next.js App Router
│   ├── layout.tsx           # Global HTML layout with Google Inter font
│   ├── page.tsx             # Root page: session gatekeeper & dynamic client component loader
│   ├── globals.css          # Global reset, leaflet overrides, and scroll styling
│   │
│   ├── components/          # Frontend UI Components
│   │   ├── AuthScreen.js    # Login & Registration modal with validation
│   │   └── MapComponent.js  # Main interactive map, draw controls, legend & farm drawer
│   │
│   └── api/                 # 🍃 Node.js Serverless API Routes
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.js # POST: Validate credentials with bcrypt & return user
│       │   └── signup/
│       │       └── route.js # POST: Hash password and register new user document
│       └── farms/
│           ├── route.js     # POST: Save farm boundary | DELETE: Remove farm by ID
│           └── [email]/
│               └── route.js # GET: Fetch all saved parcels for an authenticated email
│
├── lib/
│   └── mongodb.js           # Reusable cached MongoDB client connection pool
│
└── public/                  # Static assets and icons
```

---

## ⚡ Quick Start

### 📋 Prerequisites

Ensure you have the following installed and configured:
1. **Node.js**: `v18.17.0` or higher ([Download Node.js](https://nodejs.org/))
2. **Python**: `3.10` to `3.12` installed locally ([Download Python](https://www.python.org/))
3. **MongoDB Atlas Account**: A free shared cluster ([MongoDB Atlas Signup](https://www.mongodb.com/atlas))
4. **Google Cloud Project**: With **Google Earth Engine API** enabled ([GEE Signup](https://earthengine.google.com/))
5. **Vercel CLI** *(optional but recommended)*: `npm install -g vercel`

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/dhruvasanani2024/Smart_Agri_Monitor.git
cd Smart_Agri_Monitor
```

---

### 2️⃣ Install Node.js Dependencies

```bash
npm install
```

---

### 3️⃣ Configure Environment Variables

Create a `.env` file in the project root directory:

```env
# ---------------------------------------------------------------------------
# 1. MongoDB Atlas Connection String
# Replace <username>, <password>, and <cluster-url> with your Atlas details.
# ---------------------------------------------------------------------------
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/smart_agri?retryWrites=true&w=majority

# ---------------------------------------------------------------------------
# 2. Google Earth Engine Service Account Private Key
# Single-line JSON representation of your downloaded service account key file.
# IMPORTANT: Keep it on a single line with no outer quotes.
# ---------------------------------------------------------------------------
EE_PRIVATE_KEY={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"your-service-account@your-project-id.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

> [!TIP]
> **Converting Service Account JSON to a Single Line:**
> In PowerShell, run:
> ```powershell
> (Get-Content service_account_key.json -Raw).Replace("`r`n","").Replace("`n","") | Set-Clipboard
> ```
> Then paste the clipboard value as `EE_PRIVATE_KEY=` into `.env`.

---

### 4️⃣ Google Cloud Service Account Permissions

To enable satellite data retrieval via Earth Engine:
1. Go to the [Google Cloud Console IAM](https://console.cloud.google.com/iam-admin).
2. Create a dedicated **Service Account** (e.g., `gee-agri-sa@your-project.iam.gserviceaccount.com`).
3. Assign the following IAM roles:
   - `Earth Engine Resource Viewer`
   - `Earth Engine Resource Writer`
   - `Service Usage Consumer`
4. Register the Service Account email on the [Earth Engine Signup Portal](https://signup.earthengine.google.com/#!/service_accounts).
5. Generate and download a **JSON Key** (`Keys` tab -> `Add Key` -> `Create new key` -> `JSON`).

---

### 5️⃣ Run the Application Locally

#### Option A: Using Vercel CLI (Recommended for full Next.js + Python serverless parity)
```bash
vercel dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

#### Option B: Standard Next.js Development Server
```bash
npm run dev
```

---

## 📡 API Reference

### 1. Satellite Remote Sensing Analysis
- **Endpoint:** `POST /api/analyze`
- **Engine:** Python 3.12 (`api/index.py`) via Vercel rewrite
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "analysis": "ndvi",
    "coordinates": [
      [
        [72.5714, 23.0225],
        [72.5750, 23.0225],
        [72.5750, 23.0260],
        [72.5714, 23.0260],
        [72.5714, 23.0225]
      ]
    ]
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "analysis": "ndvi",
    "label": "NDVI – Crop Health",
    "tile_url": "https://earthengine.googleapis.com/v1/projects/.../tiles/{z}/{x}/{y}"
  }
  ```

---

### 2. User Authentication
| Method | Route | Description | Request Body |
|:---:|:---|:---|:---|
| `POST` | `/api/auth/signup` | Register a new user | `{ "name": "Dhruv", "email": "user@example.com", "password": "secretPassword" }` |
| `POST` | `/api/auth/login` | Authenticate existing user | `{ "email": "user@example.com", "password": "secretPassword" }` |

---

### 3. Farm Boundary Management
| Method | Route | Description | Parameters / Body |
|:---:|:---|:---|:---|
| `GET` | `/api/farms/[email]` | List all saved parcels for user | URL Param: `email` (URL-encoded) |
| `POST` | `/api/farms` | Save new parcel geometry | `{ "userEmail": "...", "farmName": "Plot A", "coordinates": [...] }` |
| `DELETE` | `/api/farms` | Delete a parcel by ID | Query Param: `?id=<MongoDB_ObjectId>` |

---

## 🚀 Production Deployment (Vercel)

Deploying Smart Agri Monitor to Vercel takes less than 3 minutes:

1. Push your latest code to your GitHub repository.
2. Go to the [Vercel Dashboard](https://vercel.com/new) and click **"Add New Project"**.
3. Import the `Smart_Agri_Monitor` repository.
4. In **Settings -> Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas production connection URI.
   - `EE_PRIVATE_KEY`: Your full Earth Engine service account single-line JSON.
5. Click **Deploy**. Vercel will build the Next.js frontend and set up the serverless Python environment automatically.

---

## 🛠️ Troubleshooting & FAQ

<details>
<summary><b>1. Error: <code>Failed to parse EE_PRIVATE_KEY as JSON</code></b></summary>
<br>
This happens when newline characters or outer quotes in the JSON file are corrupted by your environment manager.
Ensure the value in <code>.env</code> or Vercel is one continuous line of valid JSON starting with <code>{"type":"service_account"...}</code> with no single or double quotes surrounding the outer object.
</details>

<details>
<summary><b>2. Error: <code>Database not connected. Please replace &lt;db_password&gt; in your .env</code></b></summary>
<br>
The application includes automatic placeholder detection to prevent silent failures. Verify that <code>MONGODB_URI</code> contains your real database user password without angle brackets <code>&lt; &gt;</code>, and ensure your IP is whitelisted in MongoDB Atlas Network Access (e.g., <code>0.0.0.0/0</code> for cloud deployments).
</details>

<details>
<summary><b>3. Why is an analysis tile coming back blank or partially gray?</b></summary>
<br>
The backend queries the least-cloudy Sentinel-2 image in the region for the current year. If a region has heavy monsoonal cloud cover or the drawn polygon is extremely small (less than a few meters), expand your boundary or select a larger field area.
</details>

<details>
<summary><b>4. Leaflet map icons missing or broken in production?</b></summary>
<br>
Leaflet relies on dynamic asset loading that can break in Next.js SSR. Smart Agri Monitor handles this by dynamically importing map modules with <code>{ ssr: false }</code> and resetting default marker icon URLs to reliable CDN endpoints in <code>MapComponent.js</code>.
</details>

---

## 🤝 Contributing

Contributions to make precision agriculture more accessible are always welcome!

1. Fork the Project (`https://github.com/dhruvasanani2024/Smart_Agri_Monitor/fork`)
2. Create your Feature Branch (`git checkout -b feature/SmartAgriFeature`)
3. Commit your Changes (`git commit -m 'Add SmartAgriFeature'`)
4. Push to the Branch (`git push origin feature/SmartAgriFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for full details.

---

## 🙏 Acknowledgements

- [European Space Agency (ESA) Copernicus](https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-2) for providing free and open high-resolution Sentinel-2 multispectral imagery.
- [Google Earth Engine](https://earthengine.google.com/) for cloud-scale geospatial analysis and tile generation.
- [Leaflet](https://leafletjs.com/) for lightweight and extensible interactive web mapping.
- [Vercel](https://vercel.com/) for seamless hybrid Next.js + Python serverless hosting.
- [MongoDB Atlas](https://www.mongodb.com/atlas) for flexible cloud document storage.

---

<div align="center">

Made with 💚 for sustainable agriculture and farmers worldwide.

**[⬆ Back to Top](#-smart-agri-monitor)**

</div>