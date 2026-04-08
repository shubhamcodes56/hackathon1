# DigiGuard - Onion Layer Scam Prevention

This workspace now contains a privacy-first DigiGuard implementation with a multi-stage Onion detection engine and a UI integration over your provided template.

## Structure

- `frontend/index.html`: Your attached template, now wired with live risk hooks.
- `frontend/js/digiguard-client.js`: API client + live websocket risk updates.
- `frontend-react/`: React + Framer Motion implementation for buttery-smooth transitions.
- `backend/src/onion_engine.js`: Core 4-layer scoring and fail-safe logic.
- `backend/src/nlp_utils.js`: Lightweight urgency/fear pattern analyzer.
- `backend/src/shield_middleware.js`: Helmet, rate limit, and CSRF protection.
- `backend/src/routes/analyze.js`: `/api/analyze`, `/api/intercept`, `/api/csrf-token`.
- `backend/src/server.js`: Express + websocket server.

## Onion Layers

1. **Layer 1 - Perimeter**
   - Hidden sender IDs
   - Homoglyph checks (Cyrillic lookalikes)
   - URL shorteners

2. **Layer 2 - Behavioral Filter**
   - Local urgency/fear marker detection
   - No persistence of message payloads

3. **Layer 3 - Action Interceptor**
   - URL and file extension pre-open scan
   - APK-from-browser high-risk detection

4. **Layer 4 - Fail-Safe**
   - Triggers final warning when Layer 2 is high and Layer 3 is high

## Risk Formula

`S = (w1 * L) + (w2 * U) + (w3 * B)`

- `L` = link/perimeter risk
- `U` = urgency/fear risk
- `B` = behavior/interceptor risk
- Weights: `w1=0.45`, `w2=0.30`, `w3=0.25`

## Security Controls

- Helmet secure headers
- Rate limiting (`120 req/min`)
- CSRF token (double-submit cookie pattern)
- CORS allow-list with credentials

## Run

1. Start backend:
   - `cd backend`
   - `npm install`
   - `npm start`

2. Run original template frontend:
   - Example: `npx serve frontend -l 5500`

3. Run React + Framer Motion frontend:
   - `cd frontend-react`
   - `npm install`
   - `npm run dev`

4. Open:
   - `http://127.0.0.1:5500`
   - `http://localhost:5173`

5. Click **Run Onion Analysis** in the Live Demo section or **Run Onion Scan** in Motion Console.

## Privacy Model

- Input telemetry is processed in-memory only.
- A short SHA-256 trace ID is generated for transient correlation.
- No raw payload storage is implemented.
- No user content is logged by the backend.
