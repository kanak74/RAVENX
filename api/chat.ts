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

    const isHindi = language === 'hi'
    const contextNote = body.context?.symptoms?.length
      ? isHindi
        ? `\n\nउपयोगकर्ता के अभी के लक्षण: ${body.context.symptoms.join(', ')} (देखभाल स्तर: ${body.context.careLevel ?? 'तय नहीं'})।`
        : `\n\nUser's current check-in symptoms: ${body.context.symptoms.join(', ')} (care level: ${body.context.careLevel ?? 'not assessed'}).`
      : ''

    // Single authoritative conversational system prompt (no headings, no bullet templates)
    const systemInstruction = isHindi
      ? `तुम VITALORA के हेल्थ गाइड हो। एक समझदार और शांत दोस्त की तरह रोज़मर्रा की सरल हिंदी (देवनागरी) में बात करो।

नियम:
- सीधे सवाल का जवाब दो। कोई परिचय, निष्कर्ष या भारी मेडिकल शब्द नहीं।
- 2 से 4 छोटे वाक्यों (लगभग 80 शब्दों से कम) में छोटे पैराग्राफ में लिखो।
- हेडिंग या बुलेट पॉइंट का इस्तेमाल मत करो, जब तक उपयोगकर्ता खुद लिस्ट न मांगे।
- ज़्यादा से ज़्यादा 1-2 संभावित कारण बताओ। हर जवाब में "सिर्फ लक्षणों से कारण पक्का नहीं हो सकता" मत दोहराओ।
- कभी किसी बीमारी का पक्का नाम मत बताओ, कोई दवाई मत लिखो, और झूठा भरोसा मत दो।
- अगर गंभीर या इमरजेंसी लक्षणों का खतरा हो, तो साफ शब्दों में तुरंत 112 पर कॉल करने या अस्पताल जाने को कहो।

उदाहरण (इसी तरह लिखो):
सवाल: "मुझे बुखार और सिर दर्द है।"
जवाब: बुखार और सिर दर्द अक्सर फ्लू जैसे किसी आम संक्रमण की वजह से होते हैं। कम पानी पीने से भी ऐसा महसूस हो सकता है।

थोड़ा आराम करें, पानी पिएं और हो सके तो तापमान चेक करें। अगर तबीयत बिगड़े या बुखार कम न हो, तो डॉक्टर को दिखाएं।

अगर गर्दन में अकड़न, अचानक तेज़ सिर दर्द, भ्रम या सांस लेने में दिक्कत हो, तो तुरंत इमरजेंसी मदद लें।${contextNote}`
      : `You are VITALORA's health guide. Talk like a calm, knowledgeable friend explaining things clearly in plain, everyday English.

Rules:
- Answer the user's question directly. No greetings, no introductions, no conclusions, and no medical jargon.
- Write 2 to 4 short sentences in brief paragraphs (usually under 80 words).
- Do NOT use headings (like "What might be happening?") and do NOT use bullet points unless the user specifically asks for a list.
- Mention at most 1–2 likely possibilities when relevant, and suggest a relevant medical specialist when advising a doctor visit. If symptoms are unclear, ask 1 short follow-up question.
- Do not pad with generic home remedies or repeat the same advice.
- Never diagnose a condition, never prescribe medicine, never invent facts, and never falsely reassure.
- If emergency warning signs are relevant, state clearly and directly when to get immediate emergency help (call 112 or go to the nearest emergency hospital). Safety instructions may be longer if needed.

Example of the exact tone and format to use:
User: "I have fever and headache."
Reply: Fever and headache can happen when you have an infection, such as the flu. Not drinking enough water can also make you feel worse.

Get some rest, drink water, and check your temperature if you can. If you're getting worse or your fever isn't settling, see a doctor.

If you have a stiff neck, a sudden severe headache, confusion, or trouble breathing, get emergency help immediately.${contextNote}`
    const ai = new GoogleGenAI({ apiKey })
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)

    try {
      const candidateModels = [
        'gemini-3.6-flash',
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
            maxOutputTokens: 420,
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
          if (!shouldRetryModel(err)) {
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
            if (!shouldRetryModel(err)) {
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
