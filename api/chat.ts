/**
 * VITALORA AI Medical Assistant Endpoint (/api/chat)
 *
 * - Runs deterministic bilingual (English + Hindi) emergency warning detection BEFORE calling the LLM.
 * - Connects to Vercel AI Gateway using AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN.
 * - Never returns hardcoded/fake AI responses; returns 503 if gateway auth is unavailable.
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

    if (messages.length === 0) {
      return jsonResponse({ error: 'At least one message is required.' }, 400)
    }

    const latestUserMsg = [...messages]
      .reverse()
      .find((m) => m.role === 'user')?.content ?? ''

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

    // 2. Authenticate with Vercel AI Gateway
    const gatewayToken =
      process.env.AI_GATEWAY_API_KEY ||
      process.env.VERCEL_OIDC_TOKEN ||
      request.headers.get('x-vercel-oidc-token')

    if (!gatewayToken) {
      return jsonResponse(
        {
          error: 'AI_GATEWAY_NOT_CONFIGURED',
          message:
            'Vercel AI Gateway credentials (AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN) are not configured in this environment.',
        },
        503,
      )
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
   - NEVER diagnose a disease or claim certainty.
   - NEVER prescribe medications or give medication dosages.
   - Always encourage seeing a qualified doctor for personal care.
   - If the user describes any red-flag emergency (chest pain, trouble breathing, fainting, sudden weakness, stiff neck + fever), immediately tell them to call 112.
3. Style:
   - Keep answers concise, warm, structured with short bullet points, and easy for someone feeling unwell to read.
   - Ask 1–2 relevant, context-aware follow-up questions to help clarify timing, severity, or hydration.
4. Current User Context: ${ctxSummary}`

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
            ...messages.slice(-12).map((m) => ({
              role: m.role,
              content: String(m.content).slice(0, 2000),
            })),
          ],
        }),
      },
    )

    if (!gatewayRes.ok) {
      const errText = await gatewayRes.text()
      return jsonResponse(
        {
          error: 'AI_GATEWAY_ERROR',
          message: `AI Gateway returned ${gatewayRes.status}: ${errText.slice(0, 200)}`,
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
      model: data.model ?? 'openai/gpt-4o-mini',
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return jsonResponse({ error: msg }, 500)
  }
}
