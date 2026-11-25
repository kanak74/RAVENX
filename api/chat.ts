/**
 * VITALORA AI Medical Assistant Endpoint (/api/chat)
 *
 * - Runs deterministic bilingual (English + Hindi) emergency warning detection BEFORE calling any LLM.
 * - Supports Vercel AI Gateway (AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN),
 *   OpenAI (OPENAI_API_KEY), or Google Gemini (GEMINI_API_KEY) server-side.
 * - Never returns hardcoded/fake AI responses; returns explicit setup errors if unavailable.
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
    const body = (await request.json()) as ChatRequestBody
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

    // 1. Deterministic emergency pre-check (never delegated to AI)
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

    const ctxSummary = body.context?.symptoms?.length
      ? `User's current VITALORA check-in symptoms: ${body.context.symptoms.join(', ')}. Care guidance level: ${
          body.context.careLevel ?? 'not yet assessed'
        }.`
      : 'No symptom check-in submitted yet in this session.'

    const systemPrompt = `You are VITALORA's calm, trustworthy AI Medical Information Assistant.
Tagline: "Understand your symptoms. Know your next step."

STRICT RULES:
1. Language: Respond naturally and clearly in ${
      language === 'hi'
        ? 'Hindi (Devanagari script, simple everyday Hindi)'
        : 'simple, everyday English'
    }.
2. Medical Safety:
   - You provide general health information and precautions only.
   - NEVER diagnose a disease or claim certainty or say the user is definitely healthy.
   - NEVER prescribe medications or give medication dosages.
   - Always encourage seeing a qualified doctor for personal care.
   - If the user describes any red-flag emergency (chest pain, trouble breathing, fainting, sudden weakness, stiff neck + fever), immediately tell them to call 112.
3. Style:
   - Keep answers concise, warm, structured with short bullet points, and easy for someone feeling unwell to read.
   - Ask 1–2 relevant, context-aware follow-up questions to help clarify timing, severity, or hydration.
4. Current User Context: ${ctxSummary}`

    // 2A. Try Google Gemini direct key if configured
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (geminiKey) {
      const gemRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
          geminiKey,
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: validMessages.slice(-12).map((m) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            })),
            generationConfig: { temperature: 0.3, maxOutputTokens: 550 },
          }),
        },
      )
      if (gemRes.ok) {
        const gemData = (await gemRes.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[]
        }
        const reply = gemData.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
        if (reply) {
          return jsonResponse({
            reply,
            emergencyDetected: false,
            language,
            provider: 'gemini',
          })
        }
      }
    }

    // 2B. Try OpenAI direct key if configured
    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey) {
      const oaRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.3,
          max_tokens: 550,
          messages: [
            { role: 'system', content: systemPrompt },
            ...validMessages.slice(-12),
          ],
        }),
      })
      if (oaRes.ok) {
        const oaData = (await oaRes.json()) as {
          choices?: { message?: { content?: string } }[]
        }
        const reply = oaData.choices?.[0]?.message?.content?.trim()
        if (reply) {
          return jsonResponse({
            reply,
            emergencyDetected: false,
            language,
            provider: 'openai',
          })
        }
      }
    }

    // 2C. Try Vercel AI Gateway (AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN)
    const gatewayToken =
      process.env.AI_GATEWAY_API_KEY ||
      process.env.VERCEL_OIDC_TOKEN ||
      request.headers.get('x-vercel-oidc-token')

    if (!gatewayToken) {
      return jsonResponse(
        {
          error: 'AI_NOT_CONFIGURED',
          message:
            'No AI provider key is configured. Add AI_GATEWAY_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in Vercel Environment Variables.',
        },
        503,
      )
    }

    const gatewayRes = await fetch(
      'https://ai-gateway.vercel.sh/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${gatewayToken}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          temperature: 0.3,
          max_tokens: 550,
          messages: [
            { role: 'system', content: systemPrompt },
            ...validMessages.slice(-12),
          ],
        }),
      },
    )

    if (!gatewayRes.ok) {
      const errText = await gatewayRes.text()
      if (gatewayRes.status === 403 && errText.includes('credit card')) {
        return jsonResponse(
          {
            error: 'AI_GATEWAY_BILLING_REQUIRED',
            message:
              'Vercel AI Gateway requires a payment method on your Vercel team, or you can add a GEMINI_API_KEY / OPENAI_API_KEY environment variable in Vercel Project Settings.',
          },
          503,
        )
      }
      return jsonResponse(
        {
          error: 'AI_GATEWAY_ERROR',
          message: `AI service returned ${gatewayRes.status}. Please try again.`,
        },
        502,
      )
    }

    const data = (await gatewayRes.json()) as {
      choices?: { message?: { content?: string } }[]
      model?: string
    }
    const reply = data.choices?.[0]?.message?.content?.trim()

    if (!reply) {
      return jsonResponse({ error: 'Empty response from AI model.' }, 502)
    }

    return jsonResponse({
      reply,
      emergencyDetected: false,
      language,
      provider: 'vercel-ai-gateway',
      model: data.model ?? 'openai/gpt-4o-mini',
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return jsonResponse({ error: msg }, 500)
  }
}
