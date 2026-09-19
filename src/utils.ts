export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addMonths(dateISO: string, months: number): string {
  const d = new Date(dateISO + 'T00:00:00')
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

export function formatDate(dateISO: string): string {
  const d = new Date(dateISO + 'T00:00:00')
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

export function daysUntil(dateISO: string): number {
  const today = new Date(todayISO() + 'T00:00:00')
  const due = new Date(dateISO + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / 86_400_000)
}

export type BillStatus = 'paid' | 'overdue' | 'soon' | 'scheduled'

export function billStatus(paid: boolean, dueDate: string): BillStatus {
  if (paid) return 'paid'
  const days = daysUntil(dueDate)
  if (days < 0) return 'overdue'
  if (days <= 7) return 'soon'
  return 'scheduled'
}

export function isSameMonth(dateISO: string, reference = todayISO()): boolean {
  return dateISO.slice(0, 7) === reference.slice(0, 7)
}
