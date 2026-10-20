<div align="center">

# 🌱 Smart Agri Monitor

### Satellite-Powered Precision Agriculture Monitoring

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)](https://python.org/)
[![Earth Engine](https://img.shields.io/badge/Google-Earth%20Engine-4285F4?logo=google-earth)](https://earthengine.google.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?logo=vercel)](https://vercel.com/)

**🔗 Live Demo:** [Website Link]( )

---

*Empowering farmers with real-time satellite imagery analysis to monitor crop health, water bodies, soil moisture, salinity, and more — directly from their browser or mobile device.*

</div>

---

## 📸 Screenshots

| Login Screen | NDVI Crop Health Analysis | NDWI Water Bodies |
|:---:|:---:|:---:|
| Auth screen with sign-up/login | Green = healthy, Red = stressed | Blue = water, Red = dry land |

---

## 🚀 Features

### 🛰️ Satellite Analysis (Sentinel-2 via Google Earth Engine)
- **NDVI** — Crop Health Index (healthy vs stressed vegetation)
- **NDWI** — Water Bodies Detection (floods, irrigation, ponds)
- **MNDWI** — Modified Water Index (canals, shallow water)
- **NDMI** — Soil Moisture Monitoring (irrigation planning)
- **Salinity Index** — Salt content detection in soil
- **NBR** — Burn Ratio (fire damage assessment)
- **True Colour** — Natural satellite view of your field

### 🗺️ Interactive Map
- Draw farm boundary polygons directly on the map
- 3 base layers: **Street**, **Satellite**, and **Terrain**
- GPS-based auto-location ("Find My Location")
- Color-coded legend panel explaining what each analysis color means

### 💾 Farm Management (MongoDB Atlas)
- Save farm boundaries with custom names
- Load previously saved farms instantly
- Delete farms you no longer need
- Per-user farm storage (linked to email)

### 📱 Mobile Responsive
- Bottom sheet panel on mobile devices
- Touch-friendly buttons with larger tap targets
- Auto-hide panel after analysis for full-screen map view
- Works on phones and tablets

### ✏️ Farmer-Friendly UX
- Visual "Draw Your Farm" tooltip for first-time users
- Color legend with plain-language labels (e.g., "Excellent Health", "Needs Irrigation")
- Simple login/signup flow
- No technical knowledge required

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16.4 (React 19), Leaflet, react-leaflet |
| **Backend (Analysis)** | Python 3.12 (Vercel Serverless Functions) |
| **Satellite Data** | Google Earth Engine API, Sentinel-2 SR Harmonized |
| **Database** | MongoDB Atlas (free tier) |
| **Authentication** | Client-side (localStorage), extensible to Firebase Auth |
| **Deployment** | Vercel |
| **Styling** | Vanilla CSS-in-JS (inline styles, Inter font) |

---

## 📂 Project Structure

```
smart-agri-monitor/
├── app/
│   ├── api/
│   │   └── farms/              # Next.js API routes (MongoDB CRUD)
│   │       ├── route.js        # POST /api/farms, DELETE /api/farms
│   │       └── [email]/
│   │           └── route.js    # GET /api/farms/:email
│   ├── components/
│   │   ├── MapComponent.js     # Main map + analysis UI
│   │   └── AuthScreen.js       # Login / Sign-up screen
│   ├── layout.tsx              # Root layout with Inter font
│   ├── page.tsx                # Entry point with auth gate
│   └── globals.css
├── api/
│   ├── index.py                # Python serverless function (Earth Engine)
│   └── requirements.txt        # Python dependencies
├── lib/
│   └── mongodb.js              # MongoDB client utility
├── vercel.json                 # Routing config
├── .env                        # Environment variables (not committed)
└── package.json
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- A [Google Cloud](https://console.cloud.google.com/) project with Earth Engine API enabled
- A [Google Earth Engine](https://earthengine.google.com/) service account
- A [MongoDB Atlas](https://www.mongodb.com/atlas) free cluster
- [Vercel CLI](https://vercel.com/docs/cli) installed globally (`npm i -g vercel`)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-agri-monitor.git
cd smart-agri-monitor
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root:

```env
# Google Earth Engine service account key (entire JSON on one line, no quotes)
EE_PRIVATE_KEY={"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",...}

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/smart_agri?retryWrites=true&w=majority
```

### 4. Google Cloud Setup

1. Create a service account in [IAM & Admin](https://console.cloud.google.com/iam-admin)
2. Grant these roles:
   - `Earth Engine Resource Viewer`
   - `Earth Engine Resource Writer`
   - `Service Usage Consumer`
3. Register the service account for Earth Engine at: https://signup.earthengine.google.com/#!/service_accounts
4. Download the JSON key and paste it as `EE_PRIVATE_KEY` in `.env`

### 5. Run Locally

```bash
vercel dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌍 How It Works

```mermaid
graph LR
    A[👨‍🌾 Farmer] -->|Draws polygon| B[Leaflet Map]
    B -->|Sends coordinates| C[Python API]
    C -->|Queries| D[Google Earth Engine]
    D -->|Returns tiles| C
    C -->|Tile URL| B
    B -->|Renders overlay| A
    A -->|Saves farm| E[MongoDB Atlas]
    E -->|Loads farms| A
```

1. **Farmer draws** a polygon around their field on the interactive map
2. **Selects an analysis** type (NDVI, NDWI, etc.)
3. **Backend queries** Google Earth Engine for the latest Sentinel-2 satellite imagery
4. **Earth Engine computes** the vegetation/water/soil index and returns map tiles
5. **Overlay renders** on the map with color-coded results
6. **Legend panel** explains what each color means in simple language
7. **Farm boundaries** can be saved to MongoDB for future use

---

## 📊 Analysis Types Explained

| Index | Full Name | What It Detects | Farmer Action |
|---|---|---|---|
| 🌿 **NDVI** | Normalized Difference Vegetation Index | Crop health & density | Check irrigation for red zones |
| 💧 **NDWI** | Normalized Difference Water Index | Water bodies & flooding | Investigate blue waterlogged areas |
| 🌊 **MNDWI** | Modified NDWI | Canals, shallow water | Better for small water features |
| 💦 **NDMI** | Normalized Difference Moisture Index | Soil moisture levels | Plan watering for dry (red) zones |
| 🧂 **Salinity** | Salinity Index | Salt content in soil | Treat red zones with gypsum |
| 🔥 **NBR** | Normalized Burn Ratio | Fire/burn damage | Monitor red zones for replanting |
| 🛰️ **True Color** | RGB Composite | Natural satellite view | Visual field inspection |

---

## 🚀 Deployment (Vercel)

1. Push to GitHub
2. Import the repo in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables (`EE_PRIVATE_KEY`, `MONGODB_URI`) in Vercel project settings
4. Deploy!

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Google Earth Engine](https://earthengine.google.com/) — Satellite imagery & computation platform
- [Sentinel-2](https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-2) — ESA's high-resolution optical satellite
- [Leaflet](https://leafletjs.com/) — Interactive mapping library
- [Next.js](https://nextjs.org/) — React framework
- [MongoDB Atlas](https://www.mongodb.com/atlas) — Cloud database
- [Vercel](https://vercel.com/) — Deployment platform

---

<div align="center">

**Built with 💚 for farmers**

*Making precision agriculture accessible to everyone*

</div>
#   S m a r t _ A g r i _ M o n i t o r  
 