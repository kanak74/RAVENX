import { GoogleGenAI } from '@google/genai'

/**
 * VITALORA AI Medical Assistant Endpoint (/api/chat)
 *
 * - Runs deterministic bilingual (English + Hindi) emergency warning detection BEFORE calling Gemini.
 * - Uses the official @google/genai SDK server-side with GEMINI_API_KEY.
 * - Never exposes API keys, never falls back to Vercel AI Gateway, and never fabricates AI responses.
 */

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequestBody {
  messages: ChatMessage[]
  language?: 'en' | 'hi'
  context?: {
    symptoms?: string[]
    careLevel?: string
    predictions?: { condition: string; confidencePercent: number }[]
  }
}

const EMERGENCY_PATTERNS_EN =
  /\b(chest pain|crushing chest|can'?t breathe|cannot breathe|struggling to breathe|difficulty breathing|fainting|passed out|unconscious|stroke|slurred speech|seizure|suicidal|kill myself|coughing blood|vomiting blood)\b/i

const EMERGENCY_PATTERNS_HI =
  /(सीने में दर्द|सांस लेने में दिक्कत|सांस नहीं आ रही|बेहोश|बेहोशी|लकवा|खून की उल्टी|दिल का दौरा)/i

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

export async function POST(request: Request): Promise<Response> {
  try {
    let body: ChatRequestBody
    try {
      body = (await request.json()) as ChatRequestBody
    } catch {
      return jsonResponse({ error: 'Invalid JSON request body.' }, 400)
    }

    const messages = Array.isArray(body.messages) ? body.messages : []
    const language = body.language === 'hi' ? 'hi' : 'en'

    const validMessages = messages
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
      .map((m) => ({
        role: m.role,
        content: String(m.content ?? '').trim().slice(0, 2000),
      }))
      .filter((m) => m.content.length > 0)

    if (validMessages.length === 0) {
      return jsonResponse({ error: 'Please enter a non-empty message.' }, 400)
    }

    const latestUserMsg =
      [...validMessages].reverse().find((m) => m.role === 'user')?.content ?? ''

    if (!latestUserMsg) {
      return jsonResponse({ error: 'Please enter a question.' }, 400)
    }

    // 1. Deterministic emergency pre-check (always runs first, independent of AI)
    if (
      EMERGENCY_PATTERNS_EN.test(latestUserMsg) ||
      EMERGENCY_PATTERNS_HI.test(latestUserMsg)
    ) {
      const emergencyReply =
        language === 'hi'
          ? 'आपातकालीन चेतावनी: आपके संदेश में गंभीर लक्षणों (जैसे सीने में दर्द, सांस लेने में कठिनाई या बेहोशी) का उल्लेख है। कृपया इस चैट का इंतज़ार न करें — तुरंत 112 पर कॉल करें या नजदीकी अस्पताल के इमरजेंसी विभाग में जाएं।'
          : 'EMERGENCY WARNING: Your message mentions urgent symptoms (such as chest pain, difficulty breathing, or fainting). Please do not wait for this chat — call 112 (or your local emergency number) or go to the nearest emergency hospital right away.'

      return jsonResponse({
        reply: emergencyReply,
        emergencyDetected: true,
        language,
        emergencyNumber: '112',
      })
    }

    // 2. Read GEMINI_API_KEY strictly from server-side environment
    const apiKey = process.env.GEMINI_API_KEY?.trim()
    if (!apiKey) {
      return jsonResponse(
        {
          error: 'GEMINI_NOT_CONFIGURED',
          message:
            'GEMINI_API_KEY is not configured on the server. Add GEMINI_API_KEY in Vercel Environment Variables.',
        },
        503,
      )
    }

    const ctxSummary = body.context?.symptoms?.length
      ? `User's current VITALORA check-in symptoms: ${body.context.symptoms.join(', ')}. Care guidance level: ${
          body.context.careLevel ?? 'not yet assessed'
        }.`
      : 'No symptom check-in submitted yet in this session.'

    const systemInstruction = `You are VITALORA's calm, trustworthy AI Medical Information Assistant.
Tagline: "Understand your symptoms. Know your next step."

STRICT RULES:
1. Language: Respond naturally and clearly in ${
      language === 'hi'
        ? 'Hindi (Devanagari script, simple everyday Hindi)'
        : 'simple, everyday English'
    }.
2. Medical Safety:
   - Provide general health information and precautions only.
   - NEVER diagnose a disease, claim certainty, or say the user is definitely healthy.
   - NEVER prescribe medications or give medication dosages.
   - Do not invent test results, statistics, or medical sources.
   - Always encourage consulting a qualified healthcare professional for personal medical care.
   - If the user mentions any urgent warning sign (chest pain, trouble breathing, fainting, sudden weakness, stiff neck with fever), immediately instruct them to call 112.
3. Style:
   - Keep answers concise, calm, structured with short bullet points, and easy for someone feeling unwell to read.
   - Ask 1–2 relevant, context-aware follow-up questions to clarify timing, severity, or hydration.
4. Current User Context: ${ctxSummary}`

    const ai = new GoogleGenAI({ apiKey })
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)

    try {
      const candidateModels = [
        'gemini-3.7-flash',
        'gemini-3.8-flash',
        'gemini-flash-latest',
      ]

      const contents = validMessages.slice(-12).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

      const tryGenerate = async (modelName: string) =>
        ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.3,
            maxOutputTokens: 1024,
            abortSignal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(10000),
            ]),
          },
        })

      let response
      let usedModel = candidateModels[0]
      let lastErr: unknown = null
      const tried = new Set<string>()

      const isRetryableModelError = (msg: string) =>
        /404|not found|no longer available|unsupported|429|quota|resource_exhausted|limit:\s*0|503|high demand|overloaded|unavailable/i.test(
          msg,
        )

      for (const modelName of candidateModels) {
        tried.add(modelName)
        try {
          usedModel = modelName
          response = await tryGenerate(modelName)
          lastErr = null
          break
        } catch (err) {
          lastErr = err
          const msg = err instanceof Error ? err.message : String(err)
          if (
            controller.signal.aborted ||
            (!isRetryableModelError(msg) && !/abort|timeout/i.test(msg))
          ) {
            throw err
          }
        }
      }

      if (!response && lastErr) {
        // Dynamically discover all active Gemini text models on this API key
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
        // Prefer flash models and newer versions first
        discovered.sort((a, b) => {
          const aFlash = a.includes('flash') ? 0 : 1
          const bFlash = b.includes('flash') ? 0 : 1
          if (aFlash !== bFlash) return aFlash - bFlash
          return b.localeCompare(a)
        })

        for (const modelName of discovered.slice(0, 12)) {
          try {
            usedModel = modelName
            response = await tryGenerate(modelName)
            lastErr = null
            break
          } catch (err) {
            lastErr = err
            const msg = err instanceof Error ? err.message : String(err)
            if (!isRetryableModelError(msg)) {
              throw err
            }
          }
        }
        if (!response && lastErr) throw lastErr
      }

      const reply = response?.text?.trim()
      if (!reply) {
        return jsonResponse(
          {
            error: 'GEMINI_EMPTY_RESPONSE',
            message: 'Gemini returned an empty response. Please try again.',
          },
          502,
        )
      }

      return jsonResponse({
        reply,
        emergencyDetected: false,
        language,
        provider: 'google-gemini',
        model: usedModel,
      })
    } catch (sdkErr) {
      const rawMsg = sdkErr instanceof Error ? sdkErr.message : String(sdkErr)
      const safeMsg = rawMsg.replace(/AIza[0-9A-Za-z_-]+/g, '[REDACTED]')
      console.error('[vitalora-chat] Gemini error:', safeMsg)

      if (controller.signal.aborted || /abort|timeout/i.test(safeMsg)) {
        return jsonResponse(
          {
            error: 'GEMINI_TIMEOUT',
            message: 'The AI assistant took too long to respond. Please try again.',
          },
          504,
        )
      }
      if (/429|quota|rate|resource_exhausted/i.test(safeMsg)) {
        return jsonResponse(
          {
            error: 'GEMINI_RATE_LIMIT',
            message: 'AI assistant is temporarily busy (rate limit). Please wait a moment and retry.',
          },
          429,
        )
      }
      if (/401|403|api[_ ]?key|permission|unauthorized/i.test(safeMsg)) {
        return jsonResponse(
          {
            error: 'GEMINI_AUTH_ERROR',
            message: 'Gemini API key was rejected. Please verify GEMINI_API_KEY in Vercel settings.',
          },
          502,
        )
      }
      return jsonResponse(
        {
          error: 'GEMINI_REQUEST_FAILED',
          message: `Unable to get a response from Gemini (${safeMsg.slice(0, 120)}).`,
        },
        502,
      )
    } finally {
      clearTimeout(timeout)
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown server error'
    return jsonResponse({ error: 'SERVER_ERROR', message: msg }, 500)
  }
}
