import { GoogleGenAI } from '@google/genai'

/**
 * VITALORA Structured AI Symptom Analysis Endpoint (/api/analyze)
 *
 * - Runs deterministic emergency safety checks BEFORE calling Gemini.
 * - Uses @google/genai server-side with GEMINI_API_KEY.
 * - Returns concise, plain-English JSON for the Symptom Checker result cards.
 * - Never prescribes medicines, never diagnoses, and never fabricates results on failure.
 */

interface AnalyzeRequestBody {
  symptoms?: string[]
  notes?: string
  duration?: string
  severity?: string
  progression?: string
  measurements?: {
    temperature?: string
    bloodPressure?: string
    heartRate?: string
    spo2?: string
  }
  isEmergency?: boolean
  emergencyTriggers?: string[]
}

interface PossibleCondition {
  name: string
  explanation: string
}

interface AnalyzeResponsePayload {
  symptomSummary: string
  possibleConditions: PossibleCondition[]
  urgencyLevel: 'low' | 'moderate' | 'high' | 'emergency'
  urgencyReason: string
  recommendedSpecialist: {
    name: string
    reason: string
  }
  followUpQuestion?: string
  nextStep: string
  provider?: string
  model?: string
}

const EMERGENCY_PATTERNS =
  /\b(chest pain|crushing chest|can'?t breathe|cannot breathe|struggling to breathe|difficulty breathing|fainting|passed out|unconscious|stroke|slurred speech|seizure|suicidal|kill myself|coughing blood|vomiting blood)\b/i

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function parseJsonSafe(raw: string): Partial<AnalyzeResponsePayload> | null {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()
  try {
    return JSON.parse(cleaned) as Partial<AnalyzeResponsePayload>
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as Partial<AnalyzeResponsePayload>
      } catch {
        return null
      }
    }
    return null
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    let body: AnalyzeRequestBody
    try {
      body = (await request.json()) as AnalyzeRequestBody
    } catch {
      return jsonResponse({ error: 'Invalid JSON request body.' }, 400)
    }

    const symptoms = Array.isArray(body.symptoms)
      ? body.symptoms.map((s) => String(s).trim()).filter(Boolean)
      : []
    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 1200) : ''

    if (symptoms.length === 0 && notes.length === 0) {
      return jsonResponse(
        {
          error: 'INSUFFICIENT_SYMPTOMS',
          message: 'Please select or describe at least one symptom.',
        },
        400,
      )
    }

    // 1. Deterministic emergency check first
    if (body.isEmergency || EMERGENCY_PATTERNS.test(notes)) {
      const triggerText =
        body.emergencyTriggers?.[0] ||
        'Your symptoms include warning signs that require immediate emergency care.'
      return jsonResponse({
        symptomSummary:
          symptoms.length > 0
            ? `You reported ${symptoms.join(', ')}.`
            : 'You described urgent symptoms.',
        possibleConditions: [],
        urgencyLevel: 'emergency',
        urgencyReason: triggerText,
        recommendedSpecialist: {
          name: 'Emergency Medicine / Nearest Hospital',
          reason:
            'Urgent warning signs should be evaluated immediately in an emergency room.',
        },
        nextStep:
          'Call 112 (or your local emergency number) or go to the nearest emergency hospital immediately.',
        provider: 'safety-rules',
      } satisfies AnalyzeResponsePayload)
    }

    // 2. Require GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY?.trim()
    if (!apiKey) {
      return jsonResponse(
        {
          error: 'GEMINI_NOT_CONFIGURED',
          message: 'GEMINI_API_KEY is not configured on the server.',
        },
        503,
      )
    }

    const measurementParts: string[] = []
    if (body.measurements?.temperature) {
      measurementParts.push(`Temperature: ${body.measurements.temperature}`)
    }
    if (body.measurements?.bloodPressure) {
      measurementParts.push(`Blood pressure: ${body.measurements.bloodPressure}`)
    }
    if (body.measurements?.heartRate) {
      measurementParts.push(`Heart rate: ${body.measurements.heartRate}`)
    }
    if (body.measurements?.spo2) {
      measurementParts.push(`SpO2: ${body.measurements.spo2}`)
    }

    const userPrompt = [
      `Symptoms selected: ${symptoms.length > 0 ? symptoms.join(', ') : 'None selected'}`,
      notes ? `User description: ${notes}` : null,
      body.duration ? `Duration: ${body.duration}` : null,
      body.severity ? `Severity: ${body.severity}` : null,
      body.progression ? `Progression: ${body.progression}` : null,
      measurementParts.length > 0 ? `Measurements: ${measurementParts.join('; ')}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    const systemInstruction = `You are VITALORA's symptom guidance assistant.
Return ONLY valid JSON (no markdown, no extra commentary) with this exact structure:
{
  "symptomSummary": "1 short, plain-English sentence summarizing the user's symptoms.",
  "possibleConditions": [
    {
      "name": "Simple condition name",
      "explanation": "1 to 2 short, simple sentences explaining why this could be related. Never present it as a confirmed diagnosis."
    }
  ],
  "urgencyLevel": "low" | "moderate" | "high" | "emergency",
  "urgencyReason": "1 short sentence explaining the urgency level.",
  "recommendedSpecialist": {
    "name": "One relevant specialist (e.g., General Physician, Dermatologist, Cardiologist, Neurologist, Gastroenterologist, Ophthalmologist, ENT Specialist, Pulmonologist, Orthopedist)",
    "reason": "1 short sentence explaining why this specialist is recommended."
  },
  "followUpQuestion": "1 short question ONLY if symptoms are too vague or insufficient, otherwise empty string.",
  "nextStep": "1 to 2 short, practical sentences advising consultation with a qualified healthcare professional."
}

Strict rules:
- Use simple, everyday English that anyone can understand. Avoid medical jargon.
- List 1 to 3 possibleConditions maximum. Do not repeat the same information.
- Never present a possible condition as a confirmed diagnosis.
- Never prescribe medicines or suggest self-medication (no drug names, no dosages).
- Do not invent medical facts.
- If symptoms are unclear or very brief, keep possibleConditions to 1-2 general possibilities and add 1 helpful followUpQuestion.
- If there are potentially serious warning signs (e.g. severe chest pain, breathing trouble, sudden weakness, high fever with stiff neck), set urgencyLevel to "emergency" or "high".`

    const ai = new GoogleGenAI({ apiKey })
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)

    try {
      const candidateModels = [
        'gemini-3.6-flash',
        'gemini-3.7-flash',
        'gemini-3.8-flash',
        'gemini-flash-latest',
      ]

      const tryGenerate = async (modelName: string) =>
        ai.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          config: {
            systemInstruction,
            temperature: 0.2,
            maxOutputTokens: 550,
            responseMimeType: 'application/json',
            abortSignal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(8000),
            ]),
          },
        })

      let response
      let usedModel = candidateModels[0]
      let lastErr: unknown = null
      const tried = new Set<string>()

      const shouldRetryModel = (err: unknown) => {
        if (controller.signal.aborted) return false
        const msg = err instanceof Error ? err.message : String(err)
        return /404|not found|no longer available|unsupported|429|quota|resource_exhausted|limit:\s*0|503|high demand|overloaded|unavailable|abort|timeout/i.test(
          msg,
        )
      }

      for (const modelName of candidateModels) {
        tried.add(modelName)
        try {
          usedModel = modelName
          response = await tryGenerate(modelName)
          lastErr = null
          break
        } catch (err) {
          lastErr = err
          if (!shouldRetryModel(err)) throw err
        }
      }

      if (!response && lastErr) {
        const pager = await ai.models.list()
        const discovered: string[] = []
        for await (const m of pager) {
          const name = m.name?.replace(/^models\//, '') ?? ''
          if (
            name.startsWith('gemini-') &&
            !tried.has(name) &&
            !/(image|tts|audio|embedding|robotics|computer-use|deep-research|live|omni)/i.test(
              name,
            )
          ) {
            discovered.push(name)
          }
        }
        discovered.sort((a, b) => {
          const aFlash = a.includes('flash') ? 0 : 1
          const bFlash = b.includes('flash') ? 0 : 1
          if (aFlash !== bFlash) return aFlash - bFlash
          return b.localeCompare(a)
        })

        for (const modelName of discovered.slice(0, 8)) {
          try {
            usedModel = modelName
            response = await tryGenerate(modelName)
            lastErr = null
            break
          } catch (err) {
            lastErr = err
            if (!shouldRetryModel(err)) throw err
          }
        }
        if (!response && lastErr) throw lastErr
      }

      const rawText = response?.text?.trim() ?? ''
      const parsed = parseJsonSafe(rawText)
      if (!parsed || !parsed.symptomSummary || !parsed.recommendedSpecialist?.name) {
        return jsonResponse(
          { error: 'GEMINI_INVALID_JSON', message: 'AI returned an unexpected format.' },
          502,
        )
      }

      const validUrgency =
        parsed.urgencyLevel === 'low' ||
        parsed.urgencyLevel === 'moderate' ||
        parsed.urgencyLevel === 'high' ||
        parsed.urgencyLevel === 'emergency'
          ? parsed.urgencyLevel
          : 'moderate'

      const conditions = Array.isArray(parsed.possibleConditions)
        ? parsed.possibleConditions
            .filter((c) => c && c.name && c.explanation)
            .slice(0, 3)
            .map((c) => ({
              name: String(c.name).trim(),
              explanation: String(c.explanation).trim(),
            }))
        : []

      return jsonResponse({
        symptomSummary: String(parsed.symptomSummary).trim(),
        possibleConditions: conditions,
        urgencyLevel: validUrgency,
        urgencyReason: String(parsed.urgencyReason ?? '').trim(),
        recommendedSpecialist: {
          name: String(parsed.recommendedSpecialist.name).trim(),
          reason: String(parsed.recommendedSpecialist.reason ?? '').trim(),
        },
        followUpQuestion: parsed.followUpQuestion?.trim() || '',
        nextStep:
          String(parsed.nextStep ?? '').trim() ||
          'Consult a qualified healthcare professional for an accurate evaluation.',
        provider: 'google-gemini',
        model: usedModel,
      } satisfies AnalyzeResponsePayload)
    } finally {
      clearTimeout(timeout)
    }
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : 'Unknown server error'
    const safeMsg = rawMsg.replace(/AIza[0-9A-Za-z_-]+/g, '[REDACTED]')
    return jsonResponse({ error: 'ANALYZE_FAILED', message: safeMsg }, 502)
  }
}
