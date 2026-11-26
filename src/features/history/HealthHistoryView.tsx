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
  mlPredictions: {
    condition: string
    confidencePercent: number
    recommendedSpecialist?: string
  }[]
  summaryText: string
  createdAt: string
}

export interface HealthHistoryViewProps {
  onBack: () => void
  onStartCheck: () => void
  onOpenAuth: () => void
  onOpenAssistant?: () => void
  onOpenFacilities?: () => void
}

/**
 * Personal Health Dashboard:
 * Shows ONLY real user profile data, real saved symptom checks, prediction history,
 * a clean SVG care-level distribution chart, and quick access to AI Assistant & Doctor Care.
 */
export function HealthHistoryView({
  onBack,
  onStartCheck,
  onOpenAuth,
  onOpenAssistant,
  onOpenFacilities,
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
          setError(data.error ?? 'Could not load health dashboard.')
          return
        }
        const data = (await res.json()) as { items: SavedAssessmentRecord[] }
        setItems(data.items ?? [])
      } catch {
        setError('Unable to reach health history service.')
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

  const monitorCount = items.filter((i) => i.careLevel === 'monitor').length
  const attentionCount = items.filter((i) => i.careLevel === 'medical-attention').length
  const emergencyCount = items.filter((i) => i.careLevel === 'emergency').length
  const maxBar = Math.max(1, monitorCount, attentionCount, emergencyCount)

  const latestItem = items[0]

  return (
    <Section tone="ivory" bordered={false} className="min-h-[75vh] py-10">
      <Container>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" size="sm" onClick={onBack}>
              ← Back to VITALORA
            </Button>
            <div className="flex flex-wrap gap-2">
              {onOpenAssistant ? (
                <Button variant="outline" size="sm" onClick={onOpenAssistant}>
                  AI Assistant
                </Button>
              ) : null}
              {onOpenFacilities ? (
                <Button variant="outline" size="sm" onClick={onOpenFacilities}>
                  Doctor &amp; Clinics
                </Button>
              ) : null}
              <Button variant="forest" size="sm" onClick={onStartCheck}>
                + New Symptom Check
              </Button>
            </div>
          </div>

          <div>
            <Badge tone="forest" dotColor="#0F52BA">
              Personal Health Dashboard
            </Badge>
            <h1 className="mt-2 font-display text-3xl font-bold text-charcoal">
              {user ? `${user.name}'s Health Overview` : 'Your Health Dashboard'}
            </h1>
            <p className="mt-1 text-sm text-slate">
              Your saved health profile, symptom checks, ML pattern reports, and
              consultation guidance in one place.
            </p>
          </div>

          {!user ? (
            <div className="rounded-2xl border border-hairline bg-paper p-8 text-center shadow-xs space-y-4">
              <p className="text-sm text-slate">
                Sign in or create a health profile to view your personal
                dashboard and saved prediction reports.
              </p>
              <Button variant="forest" size="md" onClick={onOpenAuth}>
                Sign in or create profile
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Grid: Profile Card + Real Summary Stats */}
              <div className="grid gap-5 lg:grid-cols-12">
                {/* Profile Card */}
                <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-xs lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-hairline pb-3">
                    <h2 className="font-display text-lg font-semibold text-charcoal">
                      Health Profile
                    </h2>
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="cursor-pointer text-xs font-semibold text-forest hover:underline"
                    >
                      Edit profile
                    </button>
                  </div>
                  <dl className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <dt className="text-stone">Age</dt>
                      <dd className="font-semibold text-charcoal">
                        {user.age ? `${user.age} yrs` : 'Not specified'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-stone">Gender</dt>
                      <dd className="font-semibold capitalize text-charcoal">
                        {(user.gender ?? 'prefer-not-to-say').replace(/-/g, ' ')}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-stone">Existing Conditions</dt>
                      <dd className="font-semibold text-charcoal">
                        {user.existingConditions || 'None listed'}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-stone">Allergies</dt>
                      <dd className="font-semibold text-charcoal">
                        {user.allergies || 'None listed'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Real Metrics + SVG Care-Level Chart */}
                <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-xs lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between border-b border-hairline pb-3">
                    <h2 className="font-display text-lg font-semibold text-charcoal">
                      Saved Assessment Activity
                    </h2>
                    <span className="text-xs font-medium text-stone">
                      {items.length} total {items.length === 1 ? 'check' : 'checks'}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <p className="text-sm text-slate">
                      No saved checks yet. Complete a symptom check and click{' '}
                      <strong>Save to history</strong> to track your trends here.
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 items-center">
                      <div className="space-y-2.5">
                        <div className="rounded-xl border border-hairline bg-ivory p-3">
                          <span className="text-xs text-stone">Latest Check</span>
                          <p className="text-sm font-semibold text-charcoal">
                            {new Date(latestItem.createdAt).toLocaleDateString()} ·{' '}
                            {latestItem.careLevel === 'emergency'
                              ? 'Emergency'
                              : latestItem.careLevel === 'medical-attention'
                                ? 'Doctor Attention'
                                : 'Monitor'}
                          </p>
                        </div>
                        {latestItem.mlPredictions?.[0] ? (
                          <div className="rounded-xl border border-hairline bg-ivory p-3">
                            <span className="text-xs text-stone">
                              Latest Pattern Match
                            </span>
                            <p className="text-sm font-semibold text-forest">
                              {latestItem.mlPredictions[0].condition} (
                              {latestItem.mlPredictions[0].confidencePercent}%)
                            </p>
                          </div>
                        ) : null}
                      </div>

                      {/* Clean SVG Bar Chart of Real Saved Checks */}
                      <div className="rounded-xl border border-hairline bg-ivory p-3">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone">
                          Care Levels Recorded
                        </p>
                        <svg
                          viewBox="0 0 220 90"
                          className="w-full h-24"
                          role="img"
                          aria-label="Saved assessment care level chart"
                        >
                          {[
                            { label: 'Monitor', count: monitorCount, color: '#0D9488', x: 20 },
                            { label: 'Doctor', count: attentionCount, color: '#0F52BA', x: 90 },
                            { label: 'Urgent', count: emergencyCount, color: '#DC2626', x: 160 },
                          ].map((bar) => {
                            const h = Math.max(4, Math.round((bar.count / maxBar) * 52))
                            return (
                              <g key={bar.label}>
                                <rect
                                  x={bar.x}
                                  y={64 - h}
                                  width={36}
                                  height={h}
                                  rx={6}
                                  fill={bar.color}
                                />
                                <text
                                  x={bar.x + 18}
                                  y={58 - h}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fontWeight="700"
                                  fill="#0F172A"
                                >
                                  {bar.count}
                                </text>
                                <text
                                  x={bar.x + 18}
                                  y={80}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fill="#64748B"
                                >
                                  {bar.label}
                                </text>
                              </g>
                            )
                          })}
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Saved Checks & Recommendations List */}
              <div className="space-y-3">
                <h2 className="font-display text-xl font-semibold text-charcoal">
                  Recent Symptom Checks &amp; Reports
                </h2>

                {loading ? (
                  <div className="rounded-2xl border border-hairline bg-paper p-6 text-sm text-stone">
                    Loading your saved health records...
                  </div>
                ) : error ? (
                  <div className="rounded-2xl border border-urgent/30 bg-urgent-soft p-5 text-sm text-urgent">
                    {error}
                  </div>
                ) : items.length === 0 ? (
                  <div className="rounded-2xl border border-hairline bg-paper p-6 text-center space-y-3">
                    <p className="text-sm text-slate">
                      You have not saved any symptom assessments yet.
                    </p>
                    <Button variant="forest" size="md" onClick={onStartCheck}>
                      Start your first check-in
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-2xl border border-hairline bg-paper p-5 shadow-xs space-y-3"
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
                                  ? 'Doctor consultation advised'
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
                                className="rounded-full border border-forest/20 bg-sage-mist px-2.5 py-0.5 text-xs font-semibold text-coral"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <p className="text-sm text-slate">{item.summaryText}</p>

                        {item.mlPredictions?.length > 0 ? (
                          <div className="rounded-xl border border-hairline bg-ivory px-3.5 py-2.5 text-xs text-slate">
                            <span className="font-semibold text-charcoal">
                              ML Pattern Matches:{' '}
                            </span>
                            {item.mlPredictions
                              .slice(0, 2)
                              .map(
                                (p) =>
                                  `${p.condition} (${p.confidencePercent}%${
                                    p.recommendedSpecialist
                                      ? ` · ${p.recommendedSpecialist}`
                                      : ''
                                  })`,
                              )
                              .join(' | ')}
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
