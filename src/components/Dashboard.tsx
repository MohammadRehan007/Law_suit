import { useEffect, useMemo, useState } from 'react'
import { useDashboardStore } from '../stores/dashboardStore'

const navItems = [
  { label: 'Dashboard', active: true },
  { label: 'Calendar' },
  { label: 'Tasks' },
  { label: 'Matters' },
  { label: 'Contacts' },
  { label: 'Activities' },
  { label: 'Billing' },
  { label: 'Accounts' },
  { label: 'Documents' },
  { label: 'Communications' },
  { label: 'Reports' },
  { label: 'App Integrations' },
  { label: 'Settings' },
]

const statCards = [
  { label: 'Active Matters', value: '23', accent: 'bg-indigo-500/10 text-indigo-700' },
  { label: 'Pending Leads', value: '8', accent: 'bg-emerald-500/10 text-emerald-700' },
  { label: 'Overdue Invoices', value: '4', accent: 'bg-rose-500/10 text-rose-700' },
  { label: 'Upcoming Deadlines', value: '6', accent: 'bg-amber-500/10 text-amber-700' },
  { label: 'Retainer Pending', value: '2', accent: 'bg-sky-500/10 text-sky-700' },
]

const firmFeedItems = [
  { id: 'f1', title: 'Mohammad Rehan created Time Entry', subtitle: '06/19/2026 8:56 AM', extra: '20 minutes ago' },
  { id: 'f2', title: 'Mohammad Rehan updated Time Entry', subtitle: '06/19/2026 9:07 AM', extra: '9 minutes ago' },
  { id: 'f3', title: 'Mohammad Rehan removed Time Entry', subtitle: '06/19/2026 9:07 AM', extra: '9 minutes ago' },
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)

const durationLabel = (startedAt: number, stoppedAt: number | null) => {
  const elapsed = (stoppedAt || Date.now()) - startedAt
  const totalMinutes = Math.floor(elapsed / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

const Dashboard = () => {
  const { matters, deadlines, invoices, leads, timeEntries, timer, startTimer, pauseTimer, resumeTimer, stopTimer, setTimerDescription, setTimerMatter, addTimeEntry } = useDashboardStore()
  const [now, setNow] = useState(Date.now())
  const [showTimekeeper, setShowTimekeeper] = useState(false)
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'personal' | 'firm' | 'feed'>('personal')
  const [entryDescription, setEntryDescription] = useState('')
  const [entryMatter, setEntryMatter] = useState('')
  const [entryRate, setEntryRate] = useState(320)
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10))

  const matterOptions = useMemo(() => matters.map((matter) => ({ label: matter.name, value: matter.id })), [matters])

  const [entryHours, setEntryHours] = useState(1)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showNavMenu, setShowNavMenu] = useState(false)

  useEffect(() => {
    if (!entryMatter && matterOptions.length) {
      setEntryMatter(matterOptions[0].value)
    }
  }, [entryMatter, matterOptions])

  const timerLabel = useMemo(() => {
    if (!timer.startedAt) return '00:00:00'
    const elapsed = (timer.pausedAt || now) - timer.startedAt
    const hours = Math.floor(elapsed / 3600000)
    const minutes = Math.floor((elapsed % 3600000) / 60000)
    const seconds = Math.floor((elapsed % 60000) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [now, timer.pausedAt, timer.startedAt])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSaveEntry = () => {
    const selectedMatter = matters.find((matter) => matter.id === entryMatter)
    const startedDate = new Date(entryDate)
    startedDate.setHours(9, 0, 0, 0)
    const entry = {
      id: `te-${Date.now()}`,
      matter: selectedMatter?.name || 'Unassigned',
      description: entryDescription,
      startedAt: startedDate.getTime(),
      stoppedAt: startedDate.getTime() + entryHours * 3600000,
      rate: entryRate,
    }
    addTimeEntry(entry)
    setShowEntryModal(false)
    setEntryDescription('')
    setEntryMatter(matterOptions[0]?.value || '')
    setEntryRate(320)
    setEntryDate(new Date().toISOString().slice(0, 10))
    setEntryHours(1)
  }

  const upcomingDeadlines = useMemo(
    () => deadlines.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [deadlines],
  )

  const running = Boolean(timer.activeEntryId && !timer.pausedAt)
  const paused = Boolean(timer.activeEntryId && timer.pausedAt)
  const trackerStatus = running ? 'Running' : paused ? 'Paused' : timer.activeEntryId ? 'Stopped' : 'Ready'
  const trackerStatusClasses = running
    ? 'bg-emerald-100 text-emerald-700'
    : paused
    ? 'bg-amber-100 text-amber-700'
    : 'bg-slate-100 text-slate-700'

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
        {/* Sidebar - Hidden on mobile, shown on lg+ */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-[280px] transform border-r border-slate-200 bg-slate-950 text-slate-100 transition-transform duration-300 lg:relative lg:translate-x-0 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="border-b border-slate-800 px-6 py-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Law Office</p>
                <h1 className="mt-3 text-2xl font-semibold text-white">Rehan & Co.</h1>
              </div>
              <nav className="space-y-1 overflow-y-auto px-4 py-6">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    className={`flex w-full items-center justify-between rounded-3xl px-4 py-3 text-left text-sm font-medium transition ${
                      item.active ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="border-t border-slate-800 px-6 py-6">
              <div className="rounded-3xl bg-slate-900 p-4 text-slate-300 shadow-inner">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Resource center</p>
                <p className="mt-3 text-sm font-semibold text-white">Mohammad Rehan</p>
                <p className="mt-1 text-xs text-slate-400">Law Office of Mohammad Rehan</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {showSidebar && (
          <div
            className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        <main className="relative overflow-hidden">
          <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md">
            <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
              {/* Top row - Menu and Search */}
              <div className="flex items-center gap-3 lg:gap-4">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
                  aria-label="Toggle menu"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button className="hidden flex-1 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 sm:block md:flex-none md:w-auto">
                  Search law office...
                </button>
              </div>

              {/* Dashboard tabs - Stack on mobile */}
              <div className="flex flex-wrap gap-2 lg:gap-0">
                <button
                  className={`flex-1 rounded-3xl px-3 py-2 text-xs font-semibold sm:flex-none sm:px-4 sm:py-3 sm:text-sm ${activeTab === 'personal' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => setActiveTab('personal')}
                >
                  Personal
                </button>
                <button
                  className={`flex-1 rounded-3xl px-3 py-2 text-xs font-semibold sm:flex-none sm:px-4 sm:py-3 sm:text-sm ${activeTab === 'firm' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => setActiveTab('firm')}
                >
                  Firm
                </button>
                <button
                  className={`flex-1 rounded-3xl px-3 py-2 text-xs font-semibold sm:flex-none sm:px-4 sm:py-3 sm:text-sm ${activeTab === 'feed' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => setActiveTab('feed')}
                >
                  Feed
                </button>
              </div>

              {/* Action buttons - Stack on mobile */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="relative inline-flex">
                  <button
                    className="inline-flex items-center gap-2 rounded-3xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 sm:px-4 sm:py-3 sm:text-sm"
                    onClick={() => setShowTimekeeper((open) => !open)}
                  >
                    <span className={`inline-flex h-2.5 w-2.5 rounded-full ${running ? 'bg-emerald-400' : paused ? 'bg-amber-400' : 'bg-slate-400'}`} />
                    <span className="hidden sm:inline">{timerLabel}</span>
                    <span className="sm:hidden">{timerLabel.split(':').slice(1).join(':')}</span>
                  </button>
                  {showTimekeeper && (
                    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm sm:items-start sm:justify-end sm:p-0" onClick={() => setShowTimekeeper(false)}>
                      <div className="max-h-[calc(100vh-3rem)] w-full max-w-lg overflow-y-auto rounded-[32px] border border-slate-200 bg-white shadow-2xl sm:mr-4 sm:mt-4" onClick={(event) => event.stopPropagation()}>
                        <div className="flex flex-col gap-3 p-4 sm:p-5">
                          <div className="w-full">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Timekeeper</p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <p className="text-lg font-semibold text-slate-950">Tracker details</p>
                              <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${trackerStatusClasses}`}>{trackerStatus}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 rounded-3xl bg-slate-50 p-4">
                          <p className="text-sm text-slate-500">Current session</p>
                          <p className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">{timerLabel}</p>
                          <p className="mt-2 truncate text-sm text-slate-500">{timer.selectedMatter ? matters.find((matter) => matter.id === timer.selectedMatter)?.name : 'No matter selected'}</p>
                        </div>
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Matter</label>
                            <select
                              className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                              value={timer.selectedMatter || matterOptions[0]?.value || ''}
                              onChange={(event) => setTimerMatter(event.target.value)}
                            >
                              {matterOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-700">Description</label>
                            <input
                              className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                              placeholder="Describe what you’re working on"
                              value={timer.description}
                              onChange={(event) => setTimerDescription(event.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3 p-4 sm:p-5">
                          <button
                            className={`rounded-3xl px-4 py-3 text-sm font-semibold text-white shadow-sm ${running ? 'bg-emerald-600 hover:bg-emerald-700' : paused ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-950 hover:bg-slate-800'}`}
                            onClick={() => {
                              if (running) pauseTimer()
                              else if (paused) resumeTimer()
                              else startTimer(timer.selectedMatter || matterOptions[0]?.value || '', timer.description)
                            }}
                          >
                            {running ? 'Pause' : paused ? 'Resume' : 'Start'}
                          </button>
                          {timer.activeEntryId && (
                            <button
                              className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm hover:bg-slate-100"
                              onClick={stopTimer}
                            >
                              Stop
                            </button>
                          )}
                          <button
                            className="rounded-3xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm"
                            onClick={() => {
                              setShowEntryModal(true)
                              setShowTimekeeper(false)
                            }}
                          >
                            Add manual entry
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  className={`hidden rounded-3xl px-3 py-2 text-xs font-semibold text-white shadow-sm sm:inline-block sm:px-4 sm:py-3 sm:text-sm ${running ? 'bg-emerald-600 hover:bg-emerald-700' : paused ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-950 hover:bg-slate-800'}`}
                  onClick={() => {
                    if (running) pauseTimer()
                    else if (paused) resumeTimer()
                    else startTimer(matterOptions[0]?.value || '', '')
                  }}
                >
                  {running ? 'Pause' : paused ? 'Resume' : 'Start'}
                </button>
                {timer.activeEntryId && (
                  <button
                    className="hidden rounded-3xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-slate-100 sm:inline-block sm:px-4 sm:py-3 sm:text-sm"
                    onClick={stopTimer}
                  >
                    Stop
                  </button>
                )}
                <button className="rounded-3xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 sm:px-4 sm:py-3 sm:text-sm" onClick={() => setShowEntryModal(true)}>
                  Create +
                </button>
                <button className="rounded-full bg-slate-950 p-2 text-white shadow-sm hover:bg-slate-800 sm:p-3">🔔</button>
              </div>
            </div>
          </div>

          <div className="space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
            {showEntryModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 sm:px-0 sm:py-8">
                <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">New time entry</p>
                      <h2 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">Create manual entry</h2>
                    </div>
                    <button className="text-slate-500 hover:text-slate-900" onClick={() => setShowEntryModal(false)}>
                      ✕
                    </button>
                  </div>
                  <div className="mt-6 space-y-5">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Matter</label>
                      <select
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                        value={entryMatter}
                        onChange={(event) => setEntryMatter(event.target.value)}
                      >
                        {matterOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Description</label>
                      <textarea
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                        rows={4}
                        value={entryDescription}
                        onChange={(event) => setEntryDescription(event.target.value)}
                        placeholder="Summarize the work performed"
                      />
                    </div>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Date</label>
                        <input
                          type="date"
                          className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                          value={entryDate}
                          onChange={(event) => setEntryDate(event.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Hours</label>
                        <input
                          type="number"
                          min={0.25}
                          step={0.25}
                          className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                          value={entryHours}
                          onChange={(event) => setEntryHours(Number(event.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Rate</label>
                        <input
                          type="number"
                          min={0}
                          className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                          value={entryRate}
                          onChange={(event) => setEntryRate(Number(event.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
                    <button
                      className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() => setShowEntryModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                      onClick={handleSaveEntry}
                    >
                      Save entry
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'personal' && (
              <>
                <section className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div>
                      <h1 className="text-xl font-semibold text-slate-950 sm:text-2xl">Today's Agenda</h1>
                    </div>
                    <button className="text-sm font-semibold text-slate-500 hover:text-slate-900">Hide</button>
                  </div>
                  <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Tasks Due Today</p>
                      <p className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">0</p>
                      <p className="mt-2 text-sm text-slate-600">You have no tasks due today</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Calendar Events</p>
                      <p className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">0</p>
                      <p className="mt-2 text-sm text-slate-600">You have no events scheduled for today</p>
                    </div>
                  </div>
                </section>

                <section className="grid gap-6 grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
                  <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
                    <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">Hourly Metrics for Mohammad Rehan</h2>
                    <div className="mt-6 rounded-[32px] border border-slate-200 bg-slate-50 p-6 text-center text-slate-700 sm:p-8">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Billable Hours Target</p>
                      <p className="mt-4 text-sm text-slate-600">You haven't set up your billing target</p>
                      <button className="mt-6 rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                        Set up your target
                      </button>
                    </div>
                  </div>
                  <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Billing Metrics for Firm</p>
                        <h2 className="mt-2 text-lg font-semibold text-slate-950 sm:text-xl">Billing Metrics for Firm</h2>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-500">Draft Bills</p>
                        <div className="mt-3 flex items-center justify-between gap-3 text-xl font-semibold text-slate-950 sm:text-2xl">
                          <span>0</span>
                          <a href="#" className="inline-flex items-center gap-2 text-xs font-medium text-sky-600 underline decoration-sky-600 decoration-2 underline-offset-2">
                            <span>View</span>
                            <span aria-hidden="true">👁</span>
                          </a>
                        </div>
                        <p className="mt-2 text-xs text-slate-500 sm:text-sm">(<span className="text-slate-800">Create new bills</span>)</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-500">Total in Draft</p>
                          <a href="#" className="inline-flex items-center gap-2 text-xs font-medium text-sky-600 underline decoration-sky-600 decoration-2 underline-offset-2">
                            <span>View</span>
                            <span aria-hidden="true">👁</span>
                          </a>
                        </div>
                        <p className="mt-3 text-xl font-semibold text-slate-950 sm:text-2xl">-</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-500">Unpaid Bills</p>
                        <div className="mt-3 flex items-center justify-between gap-3 text-xl font-semibold text-slate-950 sm:text-2xl">
                          <span>0</span>
                          <a href="#" className="inline-flex items-center gap-2 text-xs font-medium text-sky-600 underline decoration-sky-600 decoration-2 underline-offset-2">
                            <span>View</span>
                            <span aria-hidden="true">👁</span>
                          </a>
                        </div>
                        <p className="mt-2 text-xs text-slate-500 sm:text-sm">(<span className="text-slate-800">Approve from Draft or Pending Approval</span>)</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-500">Total in Unpaid</p>
                          <a href="#" className="inline-flex items-center gap-2 text-xs font-medium text-sky-600 underline decoration-sky-600 decoration-2 underline-offset-2">
                            <span>View</span>
                            <span aria-hidden="true">👁</span>
                          </a>
                        </div>
                        <p className="mt-3 text-xl font-semibold text-slate-950 sm:text-2xl">-</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-500">Overdue Bills</p>
                          <a href="#" className="inline-flex items-center gap-2 text-xs font-medium text-sky-600 underline decoration-sky-600 decoration-2 underline-offset-2">
                            <span>View</span>
                            <span aria-hidden="true">👁</span>
                          </a>
                        </div>
                        <p className="mt-3 text-xl font-semibold text-rose-600 sm:text-2xl">0</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-500">Total in Overdue</p>
                          <a href="#" className="inline-flex items-center gap-2 text-xs font-medium text-sky-600 underline decoration-sky-600 decoration-2 underline-offset-2">
                            <span>View</span>
                            <span aria-hidden="true">👁</span>
                          </a>
                        </div>
                        <p className="mt-3 text-xl font-semibold text-slate-950 sm:text-2xl">-</p>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === 'firm' && (
              <section className="space-y-6">
                <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Firm overview</p>
                      <h2 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">Firm overview</h2>
                      <p className="mt-2 text-xs text-slate-500 sm:text-sm">Data last refreshed 4 hours ago (06/19/2026 5:30 AM IST)</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">$</div>
                  </div>
                </div>
                <div className="grid gap-6">
                  <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Utilization</p>
                      <span className="text-xs text-slate-500">Activities dated Jan 1 - Jun 19, 2026</span>
                    </div>
                    <div className="mt-6 grid gap-4 grid-cols-1 lg:grid-cols-[0.7fr_1.3fr]">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500 sm:p-10">
                        <p className="font-semibold text-slate-950">Rate average</p>
                        <p className="mt-5 text-sm">You have no data to display for this period</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500 sm:p-10">
                        <p className="font-semibold text-slate-950">Monthly</p>
                        <p className="mt-5 text-sm">You have no data to display for this period</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Realization</p>
                      <span className="text-xs text-slate-500">Activities dated Jan 1 - Jun 19, 2026</span>
                    </div>
                    <div className="mt-6 grid gap-4 grid-cols-1 lg:grid-cols-[0.7fr_1.3fr]">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500 sm:p-10">
                        <p className="font-semibold text-slate-950">Rate average</p>
                        <p className="mt-5 text-sm">You have no data to display for this period</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500 sm:p-10">
                        <p className="font-semibold text-slate-950">Monthly</p>
                        <p className="mt-5 text-sm">You have no data to display for this period</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Collection</p>
                      <span className="text-xs text-slate-500">Activities dated Jan 1 - Jun 19, 2026</span>
                    </div>
                    <div className="mt-6 grid gap-4 grid-cols-1 lg:grid-cols-[0.7fr_1.3fr]">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500 sm:p-10">
                        <p className="font-semibold text-slate-950">Rate average</p>
                        <p className="mt-5 text-sm">You have no data to display for this period</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500 sm:p-10">
                        <p className="font-semibold text-slate-950">Monthly</p>
                        <p className="mt-5 text-sm">You have no data to display for this period</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'feed' && (
              <section className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Firm Feed</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">Firm Feed</h2>
                  </div>
                  <button className="rounded-3xl bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:text-sm">Filter</button>
                </div>
                <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-xs text-slate-700 sm:text-sm">
                  Firm Feed now shows the past 14 days by default. Use the Filter menu to adjust the date range.
                </div>
                <div className="mt-6 space-y-4">
                  {firmFeedItems.map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-3xl bg-slate-100 text-sm font-semibold text-slate-700">MR</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500 sm:text-sm">{item.subtitle}</p>
                      </div>
                      <div className="text-xs text-slate-500 sm:text-sm">{item.extra}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
