"""
Smart Agri Monitor – Vercel Serverless Python Function
======================================================
Handles POST /api/analyze with a JSON body { "coordinates": [...], "analysis": "ndvi" | ... }
Uses a plain BaseHTTPRequestHandler so we don't need FastAPI/Pydantic (avoids
the pydantic_core native‑extension crash in Vercel's Python runtime).
"""

import os
import json
import traceback
from http.server import BaseHTTPRequestHandler

import ee
from google.oauth2 import service_account


_ee_initialized = False


def _init_ee():
    """Initialise Earth Engine using the service‑account key stored in EE_PRIVATE_KEY."""
    global _ee_initialized
    if _ee_initialized:
        return

    key_string = os.environ.get("EE_PRIVATE_KEY", "")
    if not key_string:
        raise RuntimeError("Missing EE_PRIVATE_KEY environment variable")

    # The env var may be wrapped in quotes by some shells / .env parsers
    key_string = key_string.strip()
    # Remove surrounding single or double quotes (possibly nested)
    while key_string and key_string[0] in ("'", '"') and key_string[-1] == key_string[0]:
        key_string = key_string[1:-1].strip()

    try:
        key_dict = json.loads(key_string)
    except json.JSONDecodeError as e:
        # Print the first 80 chars for debugging
        print(f"EE_PRIVATE_KEY starts with: {repr(key_string[:80])}")
        raise RuntimeError(f"Failed to parse EE_PRIVATE_KEY as JSON: {e}")

    scopes = getattr(getattr(ee, "oauth", None), "SCOPES", None) or [
        "https://www.googleapis.com/auth/earthengine",
        "https://www.googleapis.com/auth/cloud-platform",
    ]
    credentials = service_account.Credentials.from_service_account_info(
        key_dict,
        scopes=scopes,
    )
    project_id = key_dict.get("project_id", "")
    if not project_id:
        raise RuntimeError("project_id not found inside the service‑account JSON")

    ee.Initialize(credentials, project=project_id)
    _ee_initialized = True


def _get_best_image(roi, date_start="2024-01-01", date_end="2024-12-31"):
    """Return the least‑cloudy Sentinel‑2 SR image clipped to *roi*."""
    return (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(roi)
        .filterDate(date_start, date_end)
        .sort("CLOUDY_PIXEL_PERCENTAGE")
        .first()
        .clip(roi)
    )


# ── Index calculators ────────────────────────────────────────────────
def _ndvi(image):
    """NDVI = (NIR – Red) / (NIR + Red)  →  B8, B4"""
    idx = image.normalizedDifference(["B8", "B4"]).rename("NDVI")
    vis = {"min": -0.2, "max": 0.8, "palette": ["d73027", "fee08b", "1a9850"]}
    return idx, vis, "NDVI – Crop Health"


def _ndwi(image):
    """NDWI = (Green – NIR) / (Green + NIR)  →  B3, B8"""
    idx = image.normalizedDifference(["B3", "B8"]).rename("NDWI")
    vis = {"min": -0.5, "max": 0.5, "palette": ["d7191c", "ffffbf", "2c7bb6"]}
    return idx, vis, "NDWI – Water Bodies"


def _mndwi(image):
    """MNDWI = (Green – SWIR) / (Green + SWIR)  →  B3, B11"""
    idx = image.normalizedDifference(["B3", "B11"]).rename("MNDWI")
    vis = {"min": -0.5, "max": 0.5, "palette": ["d7191c", "ffffbf", "2c7bb6"]}
    return idx, vis, "MNDWI – Modified Water Index"


def _ndmi(image):
    """NDMI = (NIR – SWIR) / (NIR + SWIR)  →  B8, B11"""
    idx = image.normalizedDifference(["B8", "B11"]).rename("NDMI")
    vis = {"min": -0.5, "max": 0.5, "palette": ["d73027", "fee08b", "1a9850"]}
    return idx, vis, "NDMI – Soil / Vegetation Moisture"


def _salinity(image):
    """Simple Salinity Index = sqrt(Blue * Red)  →  B2, B4"""
    idx = image.select("B2").multiply(image.select("B4")).sqrt().rename("SI")
    vis = {"min": 0, "max": 0.4, "palette": ["f7f7f7", "fee090", "d73027"]}
    return idx, vis, "Salinity Index"


def _nbr(image):
    """NBR = (NIR – SWIR2) / (NIR + SWIR2)  →  B8, B12"""
    idx = image.normalizedDifference(["B8", "B12"]).rename("NBR")
    vis = {"min": -0.5, "max": 0.5, "palette": ["d73027", "fee08b", "1a9850"]}
    return idx, vis, "NBR – Burn Ratio"


def _true_color(image):
    """True‑colour composite (R‑G‑B) for visual reference."""
    idx = image.select(["B4", "B3", "B2"])
    vis = {"min": 0, "max": 3000}
    return idx, vis, "True Colour"


ANALYSES = {
    "ndvi": _ndvi,
    "ndwi": _ndwi,
    "mndwi": _mndwi,
    "ndmi": _ndmi,
    "salinity": _salinity,
    "nbr": _nbr,
    "true_color": _true_color,
}


class handler(BaseHTTPRequestHandler):
    """Vercel expects a class called ``handler`` that extends BaseHTTPRequestHandler."""

    def do_POST(self):
        try:
            # --- Parse body ---------------------------------------------------
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)

            coordinates = data.get("coordinates")
            analysis_key = data.get("analysis", "ndvi")

            if not coordinates:
                self._json(400, {"status": "error", "detail": "Missing 'coordinates' in request body"})
                return

            if analysis_key not in ANALYSES:
                self._json(400, {"status": "error", "detail": f"Unknown analysis '{analysis_key}'. Choose from: {', '.join(ANALYSES.keys())}"})
                return

            # --- Init Earth Engine -------------------------------------------
            _init_ee()

            # --- Run analysis ------------------------------------------------
            roi = ee.Geometry.Polygon(coordinates)
            image = _get_best_image(roi)
            idx, vis, label = ANALYSES[analysis_key](image)
            map_id = idx.getMapId(vis)
            tile_url = map_id["tile_fetcher"].url_format

            self._json(200, {
                "status": "success",
                "analysis": analysis_key,
                "label": label,
                "tile_url": tile_url,
            })

        except Exception as exc:
            traceback.print_exc()
            self._json(500, {"status": "error", "detail": f"Server error: {exc}"})

    def do_GET(self):
        """Health‑check / info endpoint."""
        self._json(200, {
            "status": "ok",
            "analyses": list(ANALYSES.keys()),
            "message": "POST /api/analyze with { coordinates: [...], analysis: 'ndvi' }",
        })

    # ── helpers ──────────────────────────────────────────────────────
    def _json(self, code, obj):
        payload = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)