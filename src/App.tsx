import { useMemo, useState } from 'react'
import './App.css'
import { useLocalStorage } from './hooks/useLocalStorage'
import { CATEGORIES, type Bill, type Category, type Payment } from './types'
import { billStatus, formatCurrency, formatDate, isSameMonth, todayISO, addMonths } from './utils'

type Filter = 'all' | 'due' | 'overdue' | 'paid'

const STATUS_LABEL: Record<string, string> = {
  paid: 'Pagata',
  overdue: 'Scaduta',
  soon: 'In scadenza',
  scheduled: 'In programma',
}

function emptyForm() {
  return {
    name: '',
    amount: '',
    category: CATEGORIES[0] as Category,
    dueDate: todayISO(),
    recurring: false,
  }
}

function App() {
  const [bills, setBills] = useLocalStorage<Bill[]>('casa-facile:bills', [])
  const [payments, setPayments] = useLocalStorage<Payment[]>('casa-facile:payments', [])
  const [filter, setFilter] = useState<Filter>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm())

  const totals = useMemo(() => {
    const unpaid = bills.filter((b) => !b.paid)
    const overdue = unpaid.filter((b) => billStatus(b.paid, b.dueDate) === 'overdue')
    const dueTotal = unpaid.reduce((sum, b) => sum + b.amount, 0)
    const overdueTotal = overdue.reduce((sum, b) => sum + b.amount, 0)
    const paidThisMonth = payments
      .filter((p) => isSameMonth(p.paidDate))
      .reduce((sum, p) => sum + p.amount, 0)
    return { dueTotal, overdueTotal, overdueCount: overdue.length, paidThisMonth }
  }, [bills, payments])

  const visibleBills = useMemo(() => {
    const sorted = [...bills].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    if (filter === 'all') return sorted
    if (filter === 'paid') return sorted.filter((b) => b.paid)
    if (filter === 'overdue') return sorted.filter((b) => !b.paid && billStatus(b.paid, b.dueDate) === 'overdue')
    return sorted.filter((b) => !b.paid)
  }, [bills, filter])

  function addBill(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number.parseFloat(form.amount.replace(',', '.'))
    if (!form.name.trim() || Number.isNaN(amount) || amount <= 0) return

    const newBill: Bill = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      amount,
      category: form.category,
      dueDate: form.dueDate,
      paid: false,
      recurring: form.recurring,
    }
    setBills((prev) => [...prev, newBill])
    setForm(emptyForm())
    setShowForm(false)
  }

  function togglePaid(bill: Bill) {
    if (bill.paid) {
      setBills((prev) => prev.map((b) => (b.id === bill.id ? { ...b, paid: false } : b)))
      return
    }

    const payment: Payment = {
      id: crypto.randomUUID(),
      billId: bill.id,
      name: bill.name,
      amount: bill.amount,
      category: bill.category,
      paidDate: todayISO(),
    }
    setPayments((prev) => [...prev, payment])

    setBills((prev) =>
      prev.map((b) => {
        if (b.id !== bill.id) return b
        if (b.recurring) {
          return { ...b, dueDate: addMonths(b.dueDate, 1), paid: false }
        }
        return { ...b, paid: true }
      }),
    )
  }

  function deleteBill(id: string) {
    setBills((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏠 Casa Facile</h1>
        <p>Bollette e spese domestiche</p>
      </header>

      <section className="summary">
        <div className="summary-card">
          <span className="summary-label">Da pagare</span>
          <span className="summary-value">{formatCurrency(totals.dueTotal)}</span>
        </div>
        <div className={`summary-card ${totals.overdueCount > 0 ? 'summary-card--alert' : ''}`}>
          <span className="summary-label">Scadute</span>
          <span className="summary-value">{totals.overdueCount}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Pagato a {new Date().toLocaleDateString('it-IT', { month: 'long' })}</span>
          <span className="summary-value">{formatCurrency(totals.paidThisMonth)}</span>
        </div>
      </section>

      <section className="filters">
        {(['all', 'due', 'overdue', 'paid'] as Filter[]).map((f) => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'filter-chip--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Tutte' : f === 'due' ? 'Da pagare' : f === 'overdue' ? 'Scadute' : 'Pagate'}
          </button>
        ))}
      </section>

      <section className="bill-list">
        {visibleBills.length === 0 && (
          <p className="empty-state">Nessuna bolletta qui. Aggiungine una con il pulsante +.</p>
        )}
        {visibleBills.map((bill) => {
          const status = billStatus(bill.paid, bill.dueDate)
          return (
            <div key={bill.id} className={`bill-card bill-card--${status}`}>
              <button
                className={`bill-check ${bill.paid ? 'bill-check--done' : ''}`}
                onClick={() => togglePaid(bill)}
                aria-label={bill.paid ? 'Segna come da pagare' : 'Segna come pagata'}
              >
                {bill.paid ? '✓' : ''}
              </button>
              <div className="bill-info">
                <div className="bill-title-row">
                  <span className="bill-name">{bill.name}</span>
                  {bill.recurring && <span className="bill-recurring" title="Ricorrente mensile">↻</span>}
                </div>
                <div className="bill-meta">
                  <span className="bill-category">{bill.category}</span>
                  <span className="bill-dot">·</span>
                  <span>Scadenza {formatDate(bill.dueDate)}</span>
                </div>
                <span className={`bill-status bill-status--${status}`}>{STATUS_LABEL[status]}</span>
              </div>
              <div className="bill-right">
                <span className="bill-amount">{formatCurrency(bill.amount)}</span>
                <button className="bill-delete" onClick={() => deleteBill(bill.id)} aria-label="Elimina">
                  🗑
                </button>
              </div>
            </div>
          )
        })}
      </section>

      <button className="fab" onClick={() => setShowForm(true)} aria-label="Aggiungi bolletta">
        +
      </button>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={addBill}>
            <h2>Nuova bolletta</h2>
            <label>
              Nome
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Es. Bolletta luce"
                autoFocus
                required
              />
            </label>
            <label>
              Importo (€)
              <input
                type="text"
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0,00"
                required
              />
            </label>
            <label>
              Categoria
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Scadenza
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                required
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.recurring}
                onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
              />
              Ricorrente ogni mese
            </label>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Annulla
              </button>
              <button type="submit" className="btn-primary">
                Salva
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default App
