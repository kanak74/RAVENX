import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MicIcon,
  MicOffIcon,
  SpeakerIcon,
  SpeakerOffIcon,
  SparkleIcon,
  ShieldAlertIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '../../components/illustrations/Icons'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface VoiceChatTurn {
  id: string
  role: 'user' | 'assistant'
  content: string
  emergencyDetected?: boolean
  inputMode?: 'voice' | 'text'
}

type MicState = 'idle' | 'listening' | 'error' | 'unsupported'
type SpeakState = 'idle' | 'speaking'

export interface VoiceHealthAssistantProps {
  initialLanguage?: 'en' | 'hi'
  onStartSymptomCheck?: () => void
}

// ─── Browser-API helpers ────────────────────────────────────────────────────

function getSpeechRecognition(): SpeechRecognition | null {
  try {
    const SR =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition })
        .webkitSpeechRecognition
    return SR ? new SR() : null
  } catch {
    return null
  }
}

function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

const LANG_CODE: Record<'en' | 'hi', string> = { en: 'en-IN', hi: 'hi-IN' }

function getVoice(lang: 'en' | 'hi'): SpeechSynthesisVoice | null {
  if (!isTTSSupported()) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  if (lang === 'hi') {
    return (
      voices.find((v) => v.lang.startsWith('hi')) ??
      voices.find((v) => v.name.toLowerCase().includes('hindi')) ??
      null
    )
  }
  return (
    voices.find((v) => v.lang === 'en-IN') ??
    voices.find((v) => v.lang.startsWith('en-IN')) ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null
  )
}

// ─── Suggested prompts ──────────────────────────────────────────────────────

const SUGGESTED = {
  en: [
    'I have a headache and mild fever since yesterday',
    'My throat hurts when I swallow',
    'I feel dizzy and nauseous this morning',
    'I have stomach pain and loose stools',
    'When should I see a doctor?',
  ],
  hi: [
    'कल से सिरदर्द और हल्का बुखार है',
    'निगलने पर गले में दर्द होता है',
    'आज सुबह से चक्कर आ रहे हैं',
    'पेट दर्द और दस्त हो रहे हैं',
    'डॉक्टर को कब दिखाना चाहिए?',
  ],
}

// ─── SoundWave animation ────────────────────────────────────────────────────

function SoundWave({ active }: { active: boolean }) {
  const bars = [0.4, 0.7, 1.0, 0.85, 0.6, 0.9, 0.5, 0.75, 0.95, 0.65, 0.4, 0.8]
  return (
    <div className="flex items-center justify-center gap-[3px]" aria-hidden="true">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-forest"
          animate={
            active
              ? { scaleY: [h * 0.4, h * 1.1, h * 0.5], opacity: [0.5, 1, 0.6] }
              : { scaleY: 0.15, opacity: 0.2 }
          }
          transition={
            active
              ? { duration: 0.75 + i * 0.06, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: i * 0.05 }
              : { duration: 0.3 }
          }
          style={{ height: 32, originY: 'center' }}
        />
      ))}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function VoiceHealthAssistant({
  initialLanguage = 'en',
  onStartSymptomCheck,
}: VoiceHealthAssistantProps) {
  const [language, setLanguage] = useState<'en' | 'hi'>(initialLanguage)
  const [micState, setMicState] = useState<MicState>('idle')
  const [speakState, setSpeakState] = useState<SpeakState>('idle')
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice')
  const [liveTranscript, setLiveTranscript] = useState('')
  const [editableTranscript, setEditableTranscript] = useState('')
  const [messages, setMessages] = useState<VoiceChatTurn[]>([])
  const [textInput, setTextInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [micSupported] = useState(() => Boolean(getSpeechRecognition()))
  const [ttsSupported] = useState(isTTSSupported)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const lastSpokenRef = useRef<string>('')
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Load TTS voices async
  useEffect(() => {
    if (!isTTSSupported()) return
    window.speechSynthesis.getVoices()
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      window.speechSynthesis?.cancel()
    }
  }, [])

  // ── TTS ──────────────────────────────────────────────────────────────────

  const speak = useCallback(
    (text: string) => {
      if (!ttsSupported || !ttsEnabled) return
      window.speechSynthesis.cancel()
      lastSpokenRef.current = text
      const utterance = new SpeechSynthesisUtterance(text)
      const voice = getVoice(language)
      if (voice) utterance.voice = voice
      utterance.lang = LANG_CODE[language]
      utterance.rate = 0.95
      utterance.onstart = () => setSpeakState('speaking')
      utterance.onend = () => setSpeakState('idle')
      utterance.onerror = () => setSpeakState('idle')
      setSpeakState('speaking')
      window.speechSynthesis.speak(utterance)
    },
    [language, ttsEnabled, ttsSupported],
  )

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel()
    setSpeakState('idle')
  }

  // ── API call ─────────────────────────────────────────────────────────────

  const sendToAI = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim()
      if (!trimmed || loading) return

      const newUserTurn: VoiceChatTurn = {
        id: Date.now().toString(),
        role: 'user',
        content: trimmed,
        inputMode,
      }
      const updated = [...messages, newUserTurn]
      setMessages(updated)
      setLiveTranscript('')
      setEditableTranscript('')
      setTextInput('')
      setError('')
      setLoading(true)

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updated.map((m) => ({ role: m.role, content: m.content })),
            language,
          }),
        })
        const data = (await res.json()) as {
          reply?: string
          emergencyDetected?: boolean
          error?: string
          message?: string
        }

        if (!res.ok || !data.reply) {
          setError(
            data.message ?? data.error ??
            (language === 'hi'
              ? 'AI सहायक अभी उपलब्ध नहीं है।'
              : 'AI assistant is currently unavailable. Please try again.'),
          )
          return
        }

        const aiTurn: VoiceChatTurn = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          emergencyDetected: data.emergencyDetected,
        }
        setMessages((prev) => [...prev, aiTurn])
        speak(data.reply)
      } catch {
        setError(
          language === 'hi'
            ? 'कनेक्शन की समस्या हुई।'
            : 'Connection error. Please check your internet and try again.',
        )
      } finally {
        setLoading(false)
      }
    },
    [loading, messages, language, inputMode, speak],
  )

  // ── Speech Recognition ───────────────────────────────────────────────────

  const startListening = useCallback(() => {
    if (!micSupported) { setMicState('unsupported'); return }
    if (micState === 'listening') return
    const recognition = getSpeechRecognition()
    if (!recognition) { setMicState('unsupported'); return }

    recognition.lang = LANG_CODE[language]
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => { setMicState('listening'); setLiveTranscript('') }
    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t
        else interim += t
      }
      setLiveTranscript(interim)
      if (final) setEditableTranscript((prev) => (prev ? prev + ' ' + final : final))
    }
    recognition.onspeechend = () => recognition.stop()
    recognition.onend = () => {
      setMicState((prev) => (prev === 'listening' ? 'idle' : prev))
      setLiveTranscript('')
    }
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setMicState('error')
        setError(
          language === 'hi'
            ? 'माइक्रोफोन की अनुमति नहीं है। ब्राउज़र सेटिंग में माइक्रोफोन चालू करें।'
            : 'Microphone permission denied. Please allow microphone access in browser settings.',
        )
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setMicState('error')
        setError(language === 'hi' ? `वाणी त्रुटि: ${event.error}` : `Speech error: ${event.error}. Try again.`)
      } else {
        setMicState('idle')
      }
    }

    recognitionRef.current = recognition
    try { recognition.start() } catch {
      setMicState('error')
      setError(language === 'hi' ? 'माइक शुरू नहीं हो सका।' : 'Could not start microphone.')
    }
  }, [micSupported, micState, language])

  const stopListening = () => { recognitionRef.current?.stop(); setMicState('idle') }

  const handleMicClick = () => {
    setError('')
    if (micState === 'listening') stopListening()
    else startListening()
  }

  const handleSendVoice = () => {
    const text = editableTranscript.trim() || liveTranscript.trim()
    if (text) void sendToAI(text)
  }

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault()
    if (textInput.trim()) void sendToAI(textInput)
  }

  const handleReset = () => {
    recognitionRef.current?.abort()
    window.speechSynthesis?.cancel()
    setMessages([])
    setLiveTranscript('')
    setEditableTranscript('')
    setTextInput('')
    setError('')
    setMicState('idle')
    setSpeakState('idle')
  }

  const isListening = micState === 'listening'
  const hasTranscript = Boolean(editableTranscript.trim() || liveTranscript.trim())

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section
      aria-labelledby="voice-assistant-heading"
      className="relative overflow-hidden rounded-3xl border border-hairline bg-paper shadow-[0_24px_64px_-16px_rgba(15,82,186,0.10)]"
    >
      {/* Top ambient gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-48 rounded-t-3xl"
        style={{ background: 'linear-gradient(180deg,rgba(15,82,186,0.04) 0%,transparent 100%)' }}
      />

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="relative flex flex-wrap items-start justify-between gap-4 border-b border-hairline px-6 py-5">
        <div className="space-y-1">
          <Badge tone="forest" dotColor="#0d9488">AI Voice Health Assistant</Badge>
          <h2
            id="voice-assistant-heading"
            className="font-display text-xl font-bold text-charcoal sm:text-2xl"
          >
            {language === 'hi' ? 'अपनी भावना के बारे में बात करें' : 'Talk About How You Feel'}
          </h2>
          <p className="text-xs text-stone">
            {language === 'hi'
              ? 'बोलें या लिखें — AI सुनेगा, समझेगा और सुझाव देगा।'
              : 'Speak or type — the AI listens, understands, and guides you safely.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Language toggle */}
          <div role="group" aria-label="Language" className="inline-flex rounded-xl border border-hairline bg-ivory p-1">
            {(['en', 'hi'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => { setLanguage(lang); window.speechSynthesis?.cancel(); setSpeakState('idle') }}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${language === lang ? 'bg-forest text-paper' : 'text-slate hover:text-charcoal'}`}
              >
                {lang === 'en' ? 'English' : 'हिन्दी'}
              </button>
            ))}
          </div>

          {/* Input mode toggle */}
          <div role="group" aria-label="Input mode" className="inline-flex rounded-xl border border-hairline bg-ivory p-1">
            {(['voice', 'text'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setInputMode(mode)}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${inputMode === mode ? 'bg-forest text-paper' : 'text-slate hover:text-charcoal'}`}
              >
                {mode === 'voice'
                  ? <><MicIcon className="h-3.5 w-3.5" /> {language === 'hi' ? 'आवाज़' : 'Voice'}</>
                  : <><SparkleIcon className="h-3.5 w-3.5" /> {language === 'hi' ? 'टाइप' : 'Text'}</>}
              </button>
            ))}
          </div>

          {/* TTS toggle */}
          {ttsSupported && (
            <button
              type="button"
              onClick={() => { setTtsEnabled((v) => !v); if (ttsEnabled) stopSpeaking() }}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-hairline bg-ivory px-3 py-1.5 text-xs font-semibold text-slate transition-colors hover:bg-sand"
            >
              {ttsEnabled ? <SpeakerIcon className="h-3.5 w-3.5" /> : <SpeakerOffIcon className="h-3.5 w-3.5" />}
              {ttsEnabled ? (language === 'hi' ? 'आवाज़ बंद' : 'Mute') : (language === 'hi' ? 'आवाज़ चालू' : 'Unmute')}
            </button>
          )}

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="cursor-pointer rounded-xl border border-hairline px-3 py-1.5 text-xs font-semibold text-slate transition-colors hover:bg-sand"
            >
              {language === 'hi' ? 'रीसेट' : 'Reset'}
            </button>
          )}
        </div>
      </div>

      {/* ── Chat + Interaction Body ────────────────────────────── */}
      <div className="relative flex flex-col gap-6 p-6">

        {/* Conversation history */}
        {messages.length > 0 && (
          <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'ml-10 border border-hairline bg-ivory text-charcoal'
                    : msg.emergencyDetected
                      ? 'mr-6 border-2 border-urgent bg-urgent-soft text-charcoal'
                      : 'mr-6 border border-forest/15 bg-sage-mist/50 text-charcoal'
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {msg.role === 'user' && msg.inputMode === 'voice' && <MicIcon className="h-3 w-3 text-stone" />}
                    {msg.emergencyDetected && <ShieldAlertIcon className="h-3.5 w-3.5 text-urgent" />}
                    <span className="text-[11px] font-bold uppercase tracking-widest text-stone">
                      {msg.role === 'user' ? (language === 'hi' ? 'आप' : 'You') : 'VITALORA AI'}
                    </span>
                  </div>
                  {msg.role === 'assistant' && ttsSupported && ttsEnabled && (
                    <button
                      type="button"
                      onClick={() => speak(msg.content)}
                      title="Replay"
                      className="cursor-pointer text-stone opacity-50 transition hover:opacity-100"
                    >
                      <SpeakerIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.emergencyDetected && (
                  <a
                    href="tel:112"
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-urgent px-4 py-2 text-xs font-bold text-paper"
                  >
                    📞 {language === 'hi' ? 'आपातकालीन कॉल 112' : 'Call Emergency 112'}
                  </a>
                )}
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mr-6 flex items-center gap-3 rounded-2xl border border-forest/15 bg-sage-mist/50 p-4"
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-2 w-2 rounded-full bg-forest"
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-stone">
                  {language === 'hi' ? 'AI सोच रहा है…' : 'VITALORA AI is thinking…'}
                </span>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* Suggested prompts */}
        {messages.length === 0 && !isListening && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone">
              {language === 'hi' ? 'आम सवाल — टैप करें' : 'Common symptoms — tap to start'}
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED[language].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void sendToAI(s)}
                  disabled={loading}
                  className="cursor-pointer rounded-full border border-forest/20 bg-sage-mist/60 px-3.5 py-1.5 text-xs font-semibold text-forest transition-colors hover:bg-sage-mist disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── VOICE MODE ──────────────────────────────────────── */}
        {inputMode === 'voice' && (
          <div className="flex flex-col items-center gap-5">
            {/* Wave + Mic button */}
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-48">
                <SoundWave active={isListening} />
              </div>

              <motion.button
                type="button"
                onClick={handleMicClick}
                disabled={micState === 'unsupported' || loading}
                whileTap={{ scale: 0.93 }}
                className={`relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-4 shadow-lg transition-all duration-300 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-40 ${
                  isListening
                    ? 'border-urgent bg-urgent/10 text-urgent'
                    : 'border-forest bg-forest text-paper hover:bg-forest-hover'
                }`}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-urgent"
                      animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-urgent"
                      animate={{ scale: [1, 1.9], opacity: [0.3, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                    />
                  </>
                )}
                {isListening
                  ? <MicOffIcon className="h-9 w-9" />
                  : <MicIcon className="h-9 w-9" />}
              </motion.button>

              <AnimatePresence mode="wait">
                <motion.p
                  key={micState + String(loading)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-center text-sm font-semibold text-slate"
                >
                  {micState === 'unsupported'
                    ? (language === 'hi' ? 'यह ब्राउज़र वॉइस सपोर्ट नहीं करता' : 'Voice not supported in this browser')
                    : isListening
                      ? (language === 'hi' ? '🎙️ सुन रहा हूँ… बोलें' : '🎙️ Listening… speak now')
                      : loading
                        ? (language === 'hi' ? '⏳ जवाब तैयार हो रहा है…' : '⏳ Processing…')
                        : (language === 'hi' ? 'माइक दबाएं और बोलें' : 'Press mic and speak your symptoms')}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Live transcript */}
            <AnimatePresence>
              {(liveTranscript || editableTranscript) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full space-y-2 overflow-hidden rounded-2xl border border-forest/25 bg-sage-mist/40 p-4"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-forest">
                    {language === 'hi' ? 'आपकी आवाज़ (संपादन योग्य)' : 'Your words — editable'}
                  </p>
                  <textarea
                    value={editableTranscript + (liveTranscript ? ' ' + liveTranscript : '')}
                    onChange={(e) => setEditableTranscript(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-hairline bg-paper px-3 py-2 text-sm text-charcoal focus:border-forest focus:outline-none"
                    placeholder={language === 'hi' ? 'लाइव ट्रांसक्रिप्ट यहाँ दिखेगी…' : 'Live transcript appears here…'}
                  />
                  {liveTranscript && (
                    <p className="text-xs italic text-stone">
                      {language === 'hi' ? 'पहचान हो रही है: ' : 'Recognizing: '}{liveTranscript}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="forest" size="sm" disabled={!hasTranscript || loading} onClick={handleSendVoice} rightIcon={<ArrowRightIcon className="h-3.5 w-3.5" />}>
                      {language === 'hi' ? 'AI को भेजें' : 'Send to AI'}
                    </Button>
                    <button type="button" onClick={() => { setLiveTranscript(''); setEditableTranscript('') }} className="cursor-pointer rounded-xl border border-hairline px-3 py-1.5 text-xs font-semibold text-slate hover:bg-sand">
                      {language === 'hi' ? 'साफ़ करें' : 'Clear'}
                    </button>
                    <button type="button" onClick={() => { setLiveTranscript(''); setEditableTranscript(''); startListening() }} className="cursor-pointer rounded-xl border border-hairline px-3 py-1.5 text-xs font-semibold text-stone hover:bg-sand">
                      {language === 'hi' ? 'फिर बोलें' : 'Re-record'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Speaking indicator */}
            {speakState === 'speaking' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex w-full items-center gap-3 rounded-2xl border border-forest/20 bg-sage-mist/40 px-4 py-3"
              >
                <SoundWave active />
                <span className="flex-1 text-xs font-semibold text-forest">
                  {language === 'hi' ? 'AI बोल रहा है…' : 'AI is speaking…'}
                </span>
                <button type="button" onClick={stopSpeaking} className="cursor-pointer rounded-lg border border-hairline px-2 py-1 text-xs font-semibold text-slate hover:bg-sand">
                  {language === 'hi' ? 'रोकें' : 'Stop'}
                </button>
                <button type="button" onClick={() => speak(lastSpokenRef.current)} className="cursor-pointer rounded-lg border border-hairline px-2 py-1 text-xs font-semibold text-slate hover:bg-sand">
                  {language === 'hi' ? 'फिर सुनें' : 'Replay'}
                </button>
              </motion.div>
            )}

            {/* Browser compatibility note */}
            {!micSupported && (
              <div className="w-full rounded-2xl border border-amber-soft bg-amber-soft/70 px-4 py-3 text-xs text-amber-ink">
                <strong>{language === 'hi' ? 'नोट: ' : 'Note: '}</strong>
                {language === 'hi'
                  ? 'आपका ब्राउज़र वॉइस इनपुट को सपोर्ट नहीं करता। Chrome या Edge में खोलें, या Text मोड का उपयोग करें।'
                  : 'Voice input is not supported in this browser. Open in Chrome or Edge, or switch to Text mode above.'}
              </div>
            )}
          </div>
        )}

        {/* ── TEXT MODE ────────────────────────────────────────── */}
        {inputMode === 'text' && (
          <form onSubmit={handleSendText} className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'अपने लक्षण हिन्दी या English में लिखें…'
                  : 'Type your symptoms or health question…'
              }
              className="flex-1 rounded-xl border border-hairline-strong bg-ivory px-4 py-3 text-sm text-charcoal placeholder:text-stone focus:border-forest focus:outline-none"
            />
            <Button
              type="submit"
              variant="forest"
              size="md"
              disabled={loading || !textInput.trim()}
              leftIcon={<SparkleIcon className="h-4 w-4" />}
            >
              {language === 'hi' ? 'पूछें' : 'Ask AI'}
            </Button>
          </form>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="rounded-xl border border-urgent/30 bg-urgent-soft px-4 py-3 text-sm text-charcoal"
          >
            <span className="font-semibold text-urgent">{language === 'hi' ? 'त्रुटि: ' : 'Error: '}</span>
            {error}
          </motion.div>
        )}

        {/* Footer row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-xs text-stone">
            <CheckCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-coral" />
            {language === 'hi'
              ? 'यह AI सहायक जानकारी देता है — यह डॉक्टर का विकल्प नहीं है।'
              : 'Health information only — not a substitute for professional medical care.'}
          </p>
          {onStartSymptomCheck && (
            <Button variant="outline" size="sm" onClick={onStartSymptomCheck} rightIcon={<ArrowRightIcon className="h-3.5 w-3.5" />}>
              {language === 'hi' ? 'पूरा Symptom Check करें' : 'Full Symptom Check-In'}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
