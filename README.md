# Volare Solutions Leo

Leonardo's Crib Cam is composed of two collaborating parts:

1. **Proxy API** – an Express server that authenticates with Nanit, manages MFA, and securely proxies the protected HLS video stream.
2. **React Application** – a gated UI that handles visitor verification, MFA prompts, and the embedded video player experience.

Use the sections below to understand how each side of the stack works and how to run them locally.

---

## Proxy API

### What it does
- Hosts `http://localhost:3001` (configurable via `PROXY_PORT`).
- Provides endpoints for health (`/api/ping`), login, MFA verification, baby-token lookup, and a streaming proxy for the Nanit HLS feed.
- Normalizes headers, forwards cookies/tokens, and pipes the secure stream back to the front end.
- This is exposed indirectly the web application via the `nginx.config` file that proxies /api to port 3001 of the internal (localhost) server.
- That configuration file is observed by the `Dockerfile` for the UI. The API has its own Dockerfile and image.

### Local setup
1. Install dependencies:
   ```bash
   cd api && npm install
   ```
2. Configure environment variables (see `.env.example` if provided) for credentials such as Nanit email/password and any required tokens.
3. Start the server:
   ```bash
   npm start
   ```

### Key endpoints
- `GET /api/ping` – quick health check.
- `POST /api/nanit/login` – forwards login credentials to Nanit and surfaces MFA requirements.
- `POST /api/nanit/verify-mfa` – submits MFA code, returning the session access token when successful.
- `POST /api/nanit/baby-token` – exchanges the session token plus baby ID for a short-lived `baby_token`.
- `GET /api/nanit/video` – proxies the secure HLS manifest using the `baby_token` (passed via `Authorization` header by the React app).

---

## React Application

### What it does
- Vite-powered React UI with routes for the landing page (`/`) and Crib Cam experience (`/crib-cam`).
- Gated access: checks client IP, then prompts for a PIN code if needed before it will attempt Nanit login through the proxy.
- Guides users through MFA by displaying a custom keypad component and forwards the entered code to the proxy.
- Requests a baby token, injects it into the `<VideoPlayer />`, and plays the proxied HLS feed with optional fullscreen autoplay.

### Local setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure Vite env values (e.g., `VITE_ACCESS_CODE`, `VITE_ALLOWED_IP`, `VITE_NANIT_EMAIL`, `VITE_NANIT_PASSWORD`, `VITE_PHONE_SUFFIX`, `VITE_BABY_ID`).
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:5173` (or the port Vite reports) and access `/crib-cam`. Ensure the proxy API is running so login/MFA flows can complete.

### Notable UI pieces
- `Home` page: simple entry point that routes visitors to the camera experience.
- `CribCam` page: orchestrates IP/PIN checks, login, MFA, baby token retrieval, and renders the video player.
- `PinCodeInput` & `VideoPlayer` components: reusable building blocks for secure access flows and video playback.

---

## Helpful Scripts

| Command | Location | Description |
| --- | --- | --- |
| `npm start` | `api/` | Runs the proxy API on the configured port. |
| `npm run dev` | project root | Starts the Vite dev server for the React UI. |
| `npm run build` | project root | Produces an optimized production build of the React app. |

Run the API and React dev server concurrently for a full local experience.

## Deployment

- The `build-image.yml` script contains the GitHub action to build and push the container image to GHCR and deploy the image to Azure
- The Azure credentials / required arugments are stored in secrets on the repository
- Azure has an app registration for GitHub that provides the client login details and has the `Contributor` role on the App Service
- There are 2 images one for UI (main) and API. These are deployed to the Azure Web App's "Sidecar" feature which allows multiple containers to run on a single Web App instance.
- The sitecontainers.json contains the rules for deploying these containers and includes App Setting keys in the file for username and password (PAT) for the GHCP.
