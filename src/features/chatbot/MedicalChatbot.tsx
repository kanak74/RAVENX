import { useState, type FormEvent } from 'react'
import { ShieldAlertIcon, SparkleIcon } from '../../components/illustrations/Icons'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
  emergencyDetected?: boolean
}

export interface MedicalChatbotProps {
  initialLanguage?: 'en' | 'hi'
  context?: {
    symptoms?: string[]
    careLevel?: string
    predictions?: { condition: string; confidencePercent: number }[]
  }
}

const STARTER_PROMPTS = {
  en: [
    'What precautions should I take right now?',
    'When should I visit a doctor for these symptoms?',
    'What warning signs mean I need emergency care?',
  ],
  hi: [
    'अभी मुझे क्या सावधानियां बरतनी चाहिए?',
    'मुझे डॉक्टर को कब दिखाना चाहिए?',
    'किन लक्षणों में तुरंत इमरजेंसी मदद लेनी चाहिए?',
  ],
}

export function MedicalChatbot({
  initialLanguage = 'en',
  context,
}: MedicalChatbotProps) {
  const [language, setLanguage] = useState<'en' | 'hi'>(initialLanguage)
  const [messages, setMessages] = useState<ChatTurn[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [failedMessage, setFailedMessage] = useState<string | null>(null)

  const sendMessage = async (text: string, isRetry = false) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const historyForRequest = isRetry
      ? messages
      : [...messages, { role: 'user' as const, content: trimmed }]

    if (!isRetry) {
      setMessages(historyForRequest)
      setInput('')
    }

    setError('')
    setFailedMessage(null)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForRequest.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          language,
          context,
        }),
      })
      const data = (await res.json()) as {
        reply?: string
        emergencyDetected?: boolean
        error?: string
        message?: string
      }

      if (!res.ok || !data.reply) {
        setFailedMessage(trimmed)
        setError(
          data.message ??
            data.error ??
            'AI assistant is currently unavailable.',
        )
        return
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply!,
          emergencyDetected: data.emergencyDetected,
        },
      ])
    } catch {
      setFailedMessage(trimmed)
      setError('Unable to reach the AI Medical Assistant right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) {
      setError(
        language === 'hi'
          ? 'कृपया अपना प्रश्न लिखें।'
          : 'Please enter a health question before sending.',
      )
      return
    }
    void sendMessage(input)
  }

  const handleReset = () => {
    setMessages([])
    setInput('')
    setError('')
    setFailedMessage(null)
  }

  return (
    <section
      aria-labelledby="ai-chatbot-heading"
      className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <Badge tone="forest" dotColor="#174B42">
            AI Medical Assistant
          </Badge>
          <h2
            id="ai-chatbot-heading"
            className="mt-1.5 font-display text-xl font-semibold text-charcoal"
          >
            {language === 'hi'
              ? 'स्वास्थ्य जानकारी सहायक (हिन्दी / English)'
              : 'Ask follow-up health questions'}
          </h2>
          <p className="text-xs text-stone">
            {language === 'hi'
              ? 'सामान्य स्वास्थ्य जानकारी और सावधानियां — यह डॉक्टर की सलाह का विकल्प नहीं है।'
              : 'Context-aware general medical guidance & precautions. Never a diagnosis.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {messages.length > 0 ? (
            <button
              type="button"
              onClick={handleReset}
              className="cursor-pointer rounded-xl border border-hairline px-3 py-1.5 text-xs font-semibold text-slate transition-colors hover:bg-sand hover:text-charcoal"
            >
              {language === 'hi' ? 'रीसेट करें' : 'Reset chat'}
            </button>
          ) : null}

          <div
            role="group"
            aria-label="Assistant language"
            className="inline-flex rounded-xl border border-hairline bg-ivory p-1"
          >
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                language === 'en'
                  ? 'bg-forest text-paper'
                  : 'text-slate hover:text-charcoal'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                language === 'hi'
                  ? 'bg-forest text-paper'
                  : 'text-slate hover:text-charcoal'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* Starter Prompts */}
      {messages.length === 0 ? (
        <div className="flex flex-wrap gap-2">
          {STARTER_PROMPTS[language].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void sendMessage(prompt)}
              className="cursor-pointer rounded-full border border-forest/20 bg-sage-mist/60 px-3.5 py-1.5 text-xs font-semibold text-forest transition-colors hover:bg-sage-mist"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      {/* Conversation History */}
      {messages.length > 0 ? (
        <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'ml-8 border border-hairline bg-ivory text-charcoal'
                  : msg.emergencyDetected
                    ? 'mr-4 border-2 border-urgent bg-urgent-soft text-charcoal'
                    : 'mr-4 border border-forest/15 bg-sage-mist/45 text-charcoal'
              }`}
            >
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone">
                {msg.emergencyDetected ? (
                  <ShieldAlertIcon className="h-3.5 w-3.5 text-urgent" />
                ) : null}
                <span>
                  {msg.role === 'user'
                    ? language === 'hi'
                      ? 'आप'
                      : 'You'
                    : 'VITALORA AI'}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.emergencyDetected ? (
                <a
                  href="tel:112"
                  className="mt-3 inline-flex items-center rounded-xl bg-urgent px-4 py-2 text-xs font-semibold text-paper"
                >
                  {language === 'hi' ? 'आपातकालीन कॉल (112)' : 'Call Emergency (112)'}
                </a>
              ) : null}
            </div>
          ))}
          {loading ? (
            <p className="text-xs font-medium text-stone">
              {language === 'hi' ? 'जवाब तैयार हो रहा है...' : 'Thinking...'}
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="space-y-2 rounded-xl border border-coral/35 bg-coral-soft/50 p-3.5 text-xs text-charcoal"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-medium">{error}</span>
            {failedMessage ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void sendMessage(failedMessage, true)}
                disabled={loading}
              >
                {language === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}
              </Button>
            ) : null}
          </div>
          <p className="text-stone">
            {language === 'hi'
              ? 'आप ऊपर दिए गए लक्षण जांच (Symptom Checker) और 112 आपातकालीन मार्गदर्शन का उपयोग अभी भी कर सकते हैं।'
              : 'While AI chat is offline, you can still use the deterministic Symptom Checker, PDF report export, and Nearby Care search.'}
          </p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            language === 'hi'
              ? 'अपने लक्षणों के बारे में हिन्दी या English में पूछें...'
              : 'Ask about your symptoms, precautions, or when to see a doctor...'
          }
          className="flex-1 rounded-xl border border-hairline-strong bg-ivory px-4 py-2.5 text-sm text-charcoal placeholder:text-stone focus:border-forest focus:outline-none"
        />
        <Button
          type="submit"
          variant="forest"
          size="md"
          disabled={loading}
          leftIcon={<SparkleIcon className="h-4 w-4" />}
        >
          {language === 'hi' ? 'पूछें' : 'Ask'}
        </Button>
      </form>
    </section>
  )
}
