# VITALORA — Brutally Honest Technical, Safety, UX & Security Audit

**Live URL:** `https://vitalora-two.vercel.app/`  
**Branch:** `feature/health-prototype`  
**Audit Method:** Direct source-code inspection (`src/`, `api/`, `ml/`), live HTTP endpoint testing against `vitalora-two.vercel.app`, and unit/build verification.

---

## Feature Classification Matrix

| Feature | Classification | Evidence & Findings |
|---|---|---|
| **1. Welcome & Authentication Gate** | **FULLY FUNCTIONAL** | `src/features/auth/AuthWelcomePage.tsx`, `api/auth.ts` backed by private Vercel Blob (`vitalora-auth-store`) with `scrypt` password hashing and HMAC-SHA256 `HttpOnly` cookies. Live `register`, `login`, `logout`, and `401` route protection verified. |
| **2. Health Profile Onboarding & Dashboard** | **FULLY FUNCTIONAL** | `src/features/auth/AuthPanel.tsx`, `src/features/history/HealthHistoryView.tsx`, `api/history.ts`. Stores and retrieves real profile fields and saved assessments. |
| **3. Guided Symptom Checker (Steps 1–4)** | **FULLY FUNCTIONAL** | `Step1SelectSymptoms.tsx`–`Step4ReviewAnswers.tsx`. Search, multi-select, body-map filter, unconfirmed natural-language suggestions, duration/severity/progression, fever/temp & vitals validation all work. |
| **4. Deterministic Safety-First Rule Engine** | **FULLY FUNCTIONAL** | `emergencyRules.ts` + `assessmentEngine.ts`. Evaluates red flags independently of AI, interrupts normal results, and displays `112`. |
| **5. Python ML Pattern Analysis (`/api/predict`)** | **PARTIALLY FUNCTIONAL (Synthetic Dataset)** | Real `scikit-learn` LogisticRegression model runs on Vercel Python (`200 OK`). **Critical flaw:** trained on a synthetically generated dataset (`ml/train_model.py`), yet UI previously displayed `% pattern match` bars that could be mistaken for clinical probabilities. |
| **6. AI Health Assistant (`/api/chat`)** | **BROKEN IN PROD (Missing Billing/Key)** | Backend (`api/chat.ts`) is properly implemented with Gemini, OpenAI, and Vercel AI Gateway support plus deterministic `112` emergency detection, **but** live Vercel AI Gateway returns `403` (`credit card required`) and neither `GEMINI_API_KEY` nor `OPENAI_API_KEY` is configured in Vercel. |
| **7. Nearby Care (`/api/facilities`)** | **FULLY FUNCTIONAL** | Multi-mirror OpenStreetMap Overpass API + Nominatim fallback returns real facilities (`200 OK`, 12 facilities for Bengaluru). Needs explicit label noting OSM community data must be verified by phone. |
| **8. Navigation (`Navbar.tsx` / `Footer.tsx`)** | **BROKEN (Dead Link)** | Both `Navbar.tsx` and `Footer.tsx` link to `#health-awareness`, which no longer exists in `HomePage.tsx`. |
| **9. PDF Health Report Export** | **FULLY FUNCTIONAL** | `src/utils/pdfReport.ts` (`jspdf`) exports real user data, but previously printed `%` ML confidence numbers. |

---

## Verified Issues, Severity & Fixes

### Issue 1: Dead `#health-awareness` Navigation Link
- **Location:** `src/components/layout/Navbar.tsx` (`NAV_LINKS`), `src/components/layout/Footer.tsx`
- **Why it is a problem:** Clicking "Why it matters" in the header or footer attempts to scroll to `#health-awareness`, which does not exist in `HomePage.tsx`.
- **Severity:** Medium (UX / Dead Navigation)
- **Recommended Fix:** Remove the dead `#health-awareness` link and route navigation only to active sections/views (`#how-it-works`, `#body-atlas`, `#safety`, `Dashboard`, `AI Assistant`, `Nearby Care`).
- **Status:** **Fixed**

### Issue 2: Misleading `%` Confidence Scores from Synthetic ML Dataset
- **Location:** `src/features/symptom-check/Step5AssessmentResult.tsx`, `src/utils/pdfReport.ts`, `ml/predictor.py`
- **Why it is a problem:** `ml/disease_symptoms.csv` is synthetically generated, not a clinically validated hospital dataset. Displaying `92% pattern match` bars risks misleading users into treating a prototype score as a medical probability.
- **Severity:** High (Medical Trust & Hackathon Credibility)
- **Recommended Fix:** Replace `%` confidence bars with qualitative pattern overlap (`Strong`, `Moderate`, `Low` overlap) and clearly label the ML section as a **prototype classifier trained on synthetic demo data — not clinically validated**.
- **Status:** **Fixed**

### Issue 3: AI Health Assistant Returns `503` Due to Unfunded Vercel AI Gateway
- **Location:** `api/chat.ts`, `src/features/chatbot/MedicalChatbot.tsx`, Vercel Project Environment Variables
- **Why it is a problem:** Live `/api/chat` fails for non-emergency questions because Vercel AI Gateway requires a credit card on file (`403`) and no `GEMINI_API_KEY` or `OPENAI_API_KEY` is configured.
- **Severity:** High (Core Feature Blocked by External Credential)
- **Recommended Fix:** Keep honest error reporting (never fake AI replies), add a useful deterministic fallback action (link to structured precautions & emergency `112` guidance), and clearly document the exact missing env var (`GEMINI_API_KEY` or `OPENAI_API_KEY`).
- **Status:** **Partially Fixed (Code & fallback fixed; external API key must be added by project owner in Vercel)**

### Issue 4: Assessment Results Hierarchy & Explicit Non-Reassurance Wording
- **Location:** `src/features/symptom-check/Step5AssessmentResult.tsx`, `src/features/symptom-check/assessmentEngine.ts`
- **Why it is a problem:** Results should follow a 6-part patient-friendly structure (**1. Your Symptoms**, **2. What This May Mean**, **3. What You Should Do Next**, **4. When to Seek Medical Help**, **5. Warning Signs**, **6. Limitations**) and explicitly state: *"No urgent warning signs were identified from the information you provided. This does not rule out a serious medical condition."*
- **Severity:** High (Patient Safety & Readability)
- **Recommended Fix:** Reorder and simplify `Step5AssessmentResult.tsx` into the 6 clear sections and update `assessmentEngine.ts` monitor summary wording.
- **Status:** **Fixed**

### Issue 5: Dead Unused Files (`api/_lib/auth.ts`, `api/_lib/db.ts`) & Static `AUTH_SECRET` Fallback
- **Location:** `api/_lib/auth.ts`, `api/_lib/db.ts`, `api/auth.ts`, `api/history.ts`
- **Why it is a problem:** Dead `_lib` files cause confusion, and falling back to a hardcoded string `'vitalora-session-secret'` in production would be insecure if `AUTH_SECRET` were ever unset.
- **Severity:** Medium (Security & Maintainability)
- **Recommended Fix:** Remove unused `api/_lib/` files and fail closed in production (`VERCEL_ENV === 'production'`) if `AUTH_SECRET` is missing.
- **Status:** **Fixed**

### Issue 6: Unverified OpenStreetMap Facility Details Not Explicitly Labeled
- **Location:** `src/features/facilities/NearbyFacilities.tsx`
- **Why it is a problem:** OpenStreetMap phone numbers and opening hours are community-contributed and may be outdated.
- **Severity:** Low (Medical Trust)
- **Recommended Fix:** Add an explicit verification notice on facility cards reminding users to confirm hours/availability by phone before visiting.
- **Status:** **Fixed**
