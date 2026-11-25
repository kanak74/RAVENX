import { useEffect, useState } from 'react'
import { Container } from '../../components/layout/Container'
import { Section } from '../../components/layout/Section'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../auth/AuthContext'

export interface SavedAssessmentRecord {
  id: string
  symptoms: string[]
  details: { duration?: string; severity?: string; progression?: string }
  measurements: Record<string, unknown>
  careLevel: string
  mlPredictions: { condition: string; confidencePercent: number }[]
  summaryText: string
  createdAt: string
}

export interface HealthHistoryViewProps {
  onBack: () => void
  onStartCheck: () => void
  onOpenAuth: () => void
}

export function HealthHistoryView({
  onBack,
  onStartCheck,
  onOpenAuth,
}: HealthHistoryViewProps) {
  const { user } = useAuth()
  const [items, setItems] = useState<SavedAssessmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    const load = async () => {
      try {
        const res = await fetch('/api/history', { credentials: 'include' })
        if (!res.ok) {
          const data = (await res.json()) as { error?: string }
          setError(data.error ?? 'Could not load health history.')
          return
        }
        const data = (await res.json()) as { items: SavedAssessmentRecord[] }
        setItems(data.items ?? [])
      } catch {
        setError('Unable to reach history service.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [user])

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/history?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  return (
    <Section tone="ivory" bordered={false} className="min-h-[75vh] py-10">
      <Container size="narrow">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" size="sm" onClick={onBack}>
              ← Back to VITALORA
            </Button>
            <Button variant="forest" size="sm" onClick={onStartCheck}>
              New symptom check
            </Button>
          </div>

          <div>
            <Badge tone="forest" dotColor="#174B42">
              Health History
            </Badge>
            <h1 className="mt-2 font-display text-3xl font-semibold text-charcoal">
              Your past symptom checks
            </h1>
            <p className="mt-1 text-sm text-slate">
              Saved assessments stored privately in your account so you can
              track changes over time or share with a doctor.
            </p>
          </div>

          {!user ? (
            <div className="rounded-2xl border border-hairline bg-paper p-6 text-center space-y-4">
              <p className="text-sm text-slate">
                Sign in to save and view your past VITALORA symptom assessments.
              </p>
              <Button variant="forest" size="md" onClick={onOpenAuth}>
                Sign in or create account
              </Button>
            </div>
          ) : loading ? (
            <div className="rounded-2xl border border-hairline bg-paper p-6 text-sm text-stone">
              Loading your saved history...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-urgent/30 bg-urgent-soft p-5 text-sm text-urgent">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-hairline bg-paper p-6 text-center space-y-4">
              <p className="text-sm text-slate">
                You have not saved any symptom assessments yet.
              </p>
              <Button variant="forest" size="md" onClick={onStartCheck}>
                Start your first check-in
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-hairline bg-paper p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-stone">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        tone={
                          item.careLevel === 'emergency'
                            ? 'urgent'
                            : item.careLevel === 'medical-attention'
                              ? 'coral'
                              : 'forest'
                        }
                      >
                        {item.careLevel === 'emergency'
                          ? 'Emergency'
                          : item.careLevel === 'medical-attention'
                            ? 'Medical attention'
                            : 'Monitor'}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => void handleDelete(item.id)}
                        className="cursor-pointer text-xs font-medium text-stone hover:text-urgent"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {item.symptoms.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {item.symptoms.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-forest/20 bg-sage-mist px-2.5 py-0.5 text-xs font-semibold text-forest"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <p className="text-sm text-slate">{item.summaryText}</p>

                  {item.mlPredictions?.length > 0 ? (
                    <p className="text-xs text-stone">
                      Top pattern matches:{' '}
                      {item.mlPredictions
                        .slice(0, 2)
                        .map((p) => `${p.condition} (${p.confidencePercent}%)`)
                        .join(' · ')}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
