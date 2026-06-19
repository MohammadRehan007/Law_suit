import { create } from 'zustand'

export type Matter = {
  id: string
  matterNumber: string
  name: string
  client: string
  status: 'Active' | 'Pending' | 'Closed'
  openDate: string
  budgetHrs: number
  billedHrs: number
}

export type Lead = {
  id: string
  name: string
  source: string
  status: 'New' | 'Contacted' | 'Qualified'
}

export type Invoice = {
  id: string
  matter: string
  dueDate: string
  amount: number
  status: 'Unpaid' | 'Overdue' | 'Paid'
}

export type Deadline = {
  id: string
  matter: string
  dueDate: string
  type: string
  status: 'Upcoming' | 'Due Soon' | 'Completed'
}

export type TimeEntry = {
  id: string
  matter: string
  description: string
  startedAt: number
  stoppedAt: number | null
  rate: number
}

const savedEntries = typeof window !== 'undefined' ? localStorage.getItem('law-dashboard-time-entries') : null
const parsedEntries: TimeEntry[] = savedEntries ? JSON.parse(savedEntries) : []
const savedTimer = typeof window !== 'undefined' ? localStorage.getItem('law-dashboard-timer-state') : null
const parsedTimer = savedTimer
  ? JSON.parse(savedTimer)
  : {
      activeEntryId: null,
      description: '',
      selectedMatter: null,
      startedAt: null,
      pausedAt: null,
    }

const saveTimerState = (timerState: DashboardState['timer']) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('law-dashboard-timer-state', JSON.stringify(timerState))
  }
}

export type DashboardState = {
  matters: Matter[]
  leads: Lead[]
  invoices: Invoice[]
  deadlines: Deadline[]
  timeEntries: TimeEntry[]
  timer: {
    activeEntryId: string | null
    description: string
    selectedMatter: string | null
    startedAt: number | null
    pausedAt: number | null
  }
  startTimer: (matter: string, description: string) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  setTimerDescription: (description: string) => void
  setTimerMatter: (matter: string) => void
  addTimeEntry: (entry: TimeEntry) => void
}

const initialMatters: Matter[] = [
  { id: 'm1', matterNumber: 'LM-0124', name: 'Estate Plan for Rajesh Kumar', client: 'Rajesh Kumar', status: 'Active', openDate: '2026-05-02', budgetHrs: 80, billedHrs: 47 },
  { id: 'm2', matterNumber: 'LM-0119', name: 'Business Formation', client: 'Sapphire Studios', status: 'Active', openDate: '2026-04-14', budgetHrs: 120, billedHrs: 72 },
  { id: 'm3', matterNumber: 'LM-0108', name: 'Personal Injury Claim', client: 'Aisha Rahman', status: 'Pending', openDate: '2026-05-26', budgetHrs: 40, billedHrs: 18 },
  { id: 'm4', matterNumber: 'LM-0096', name: 'Contract Review', client: 'Nexa Health', status: 'Active', openDate: '2026-03-20', budgetHrs: 60, billedHrs: 34 },
]

const initialLeads: Lead[] = [
  { id: 'l1', name: 'Neha S.', source: 'Website', status: 'New' },
  { id: 'l2', name: 'Vikram P.', source: 'Referral', status: 'Contacted' },
  { id: 'l3', name: 'Kavya M.', source: 'Email', status: 'Qualified' },
]

const initialInvoices: Invoice[] = [
  { id: 'i1', matter: 'Estate Plan for Rajesh Kumar', dueDate: '2026-06-21', amount: 2800, status: 'Unpaid' },
  { id: 'i2', matter: 'Business Formation', dueDate: '2026-06-18', amount: 6200, status: 'Overdue' },
  { id: 'i3', matter: 'Contract Review', dueDate: '2026-06-30', amount: 1850, status: 'Unpaid' },
]

const initialDeadlines: Deadline[] = [
  { id: 'd1', matter: 'Estate Plan for Rajesh Kumar', dueDate: '2026-06-20', type: 'Document Signing', status: 'Due Soon' },
  { id: 'd2', matter: 'Business Formation', dueDate: '2026-06-24', type: 'Regulatory Filing', status: 'Upcoming' },
  { id: 'd3', matter: 'Personal Injury Claim', dueDate: '2026-06-22', type: 'Court Hearing', status: 'Due Soon' },
]

export const useDashboardStore = create<DashboardState>((set, get) => ({
  matters: initialMatters,
  leads: initialLeads,
  invoices: initialInvoices,
  deadlines: initialDeadlines,
  timeEntries: parsedEntries,
  timer: parsedTimer,
  startTimer: (matter, description) => {
    const id = `te-${Date.now()}`
    const timerState = {
      activeEntryId: id,
      description,
      selectedMatter: matter,
      startedAt: Date.now(),
      pausedAt: null,
    }
    saveTimerState(timerState)
    set({ timer: timerState })
  },
  pauseTimer: () => {
    const timer = get().timer
    if (!timer.activeEntryId || timer.pausedAt) return
    const timerState = {
      ...timer,
      pausedAt: Date.now(),
    }
    saveTimerState(timerState)
    set({ timer: timerState })
  },
  resumeTimer: () => {
    const timer = get().timer
    if (!timer.activeEntryId || !timer.pausedAt || !timer.startedAt) return
    const elapsedPaused = Date.now() - timer.pausedAt
    const timerState = {
      ...timer,
      startedAt: timer.startedAt + elapsedPaused,
      pausedAt: null,
    }
    saveTimerState(timerState)
    set({ timer: timerState })
  },
  stopTimer: () => {
    const { timer, timeEntries } = get()
    if (!timer.activeEntryId || !timer.startedAt) return
    const stoppedAt = Date.now()
    const entry = {
      id: timer.activeEntryId,
      matter: timer.selectedMatter || 'Unassigned',
      description: timer.description,
      startedAt: timer.startedAt,
      stoppedAt,
      rate: 320,
    }
    const nextEntries = [entry, ...timeEntries]
    localStorage.setItem('law-dashboard-time-entries', JSON.stringify(nextEntries))
    const timerState = {
      activeEntryId: null,
      description: '',
      selectedMatter: null,
      startedAt: null,
      pausedAt: null,
    }
    saveTimerState(timerState)
    set({
      timeEntries: nextEntries,
      timer: timerState,
    })
  },
  setTimerDescription: (description) => {
    const timer = get().timer
    const timerState = { ...timer, description }
    saveTimerState(timerState)
    set({ timer: timerState })
  },
  setTimerMatter: (matter) => {
    const timer = get().timer
    const timerState = { ...timer, selectedMatter: matter }
    saveTimerState(timerState)
    set({ timer: timerState })
  },
  addTimeEntry: (entry) => {
    const nextEntries = [entry, ...get().timeEntries]
    localStorage.setItem('law-dashboard-time-entries', JSON.stringify(nextEntries))
    set({ timeEntries: nextEntries })
  },
}))
