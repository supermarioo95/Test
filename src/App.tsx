import { useMemo, useState } from 'react'
import './App.css'
import { useLocalStorage } from './hooks/useLocalStorage'
import { IMPOSTAZIONI_DEFAULT, LEGHE, type Impostazioni, type Iscritto, type Lega } from './types'
import { formatCurrency, formatDate, initials, todayISO } from './utils'

type Filter = 'all' | 'paid' | 'unpaid'
type LegaFilter = 'all' | Lega

function emptyForm(quotaDefault: number) {
  return {
    squadra: '',
    responsabile: '',
    email: '',
    telefono: '',
    importoQuota: String(quotaDefault),
    dataIscrizione: todayISO(),
    quotaPagata: false,
    note: '',
    lega: 'A1' as Lega,
  }
}

function App() {
  const [iscritti, setIscritti] = useLocalStorage<Iscritto[]>('fantacity:iscritti', [])
  const [impostazioni, setImpostazioni] = useLocalStorage<Impostazioni>(
    'fantacity:impostazioni',
    IMPOSTAZIONI_DEFAULT,
  )
  const [filter, setFilter] = useState<Filter>('all')
  const [legaFilter, setLegaFilter] = useState<LegaFilter>('all')
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [form, setForm] = useState(() => emptyForm(impostazioni.quotaDefault))
  const [settingsForm, setSettingsForm] = useState(impostazioni)

  const totals = useMemo(() => {
    const raccolto = iscritti.filter((i) => i.quotaPagata).reduce((sum, i) => sum + i.importoQuota, 0)
    const daRiscuotere = iscritti.filter((i) => !i.quotaPagata).reduce((sum, i) => sum + i.importoQuota, 0)
    const postiLiberi = Math.max(0, impostazioni.postiTotali - iscritti.length)
    const perLega = Object.fromEntries(
      LEGHE.map((lega) => [lega, iscritti.filter((i) => i.lega === lega).length]),
    ) as Record<Lega, number>
    return { raccolto, daRiscuotere, postiLiberi, perLega }
  }, [iscritti, impostazioni.postiTotali])

  const visibleIscritti = useMemo(() => {
    const sorted = [...iscritti].sort((a, b) => b.dataIscrizione.localeCompare(a.dataIscrizione))
    let result = sorted
    if (filter === 'paid') result = result.filter((i) => i.quotaPagata)
    if (filter === 'unpaid') result = result.filter((i) => !i.quotaPagata)
    if (legaFilter !== 'all') result = result.filter((i) => i.lega === legaFilter)
    return result
  }, [iscritti, filter, legaFilter])

  function addIscritto(e: React.FormEvent) {
    e.preventDefault()
    const importo = Number.parseFloat(form.importoQuota.replace(',', '.'))
    if (!form.squadra.trim() || !form.responsabile.trim() || Number.isNaN(importo) || importo < 0) return

    const nuovo: Iscritto = {
      id: crypto.randomUUID(),
      squadra: form.squadra.trim(),
      responsabile: form.responsabile.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      dataIscrizione: form.dataIscrizione,
      quotaPagata: form.quotaPagata,
      importoQuota: importo,
      note: form.note.trim(),
      lega: form.lega,
    }
    setIscritti((prev) => [...prev, nuovo])
    setForm(emptyForm(impostazioni.quotaDefault))
    setShowForm(false)
  }

  function togglePagato(id: string) {
    setIscritti((prev) => prev.map((i) => (i.id === id ? { ...i, quotaPagata: !i.quotaPagata } : i)))
  }

  function deleteIscritto(id: string) {
    setIscritti((prev) => prev.filter((i) => i.id !== id))
  }

  function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    setImpostazioni(settingsForm)
    setShowSettings(false)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-row">
          <div>
            <h1>🏆 FantaCity</h1>
            <p>{impostazioni.nomeLega}</p>
          </div>
          <button
            className="settings-btn"
            onClick={() => {
              setSettingsForm(impostazioni)
              setShowSettings(true)
            }}
            aria-label="Impostazioni lega"
          >
            ⚙️
          </button>
        </div>
      </header>

      <section className="summary">
        <div className={`summary-card ${totals.postiLiberi === 0 ? 'summary-card--alert' : ''}`}>
          <span className="summary-label">Iscritti</span>
          <span className="summary-value">
            {iscritti.length} / {impostazioni.postiTotali}
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Raccolto</span>
          <span className="summary-value">{formatCurrency(totals.raccolto)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Da riscuotere</span>
          <span className="summary-value">{formatCurrency(totals.daRiscuotere)}</span>
        </div>
      </section>

      <section className="filters">
        {(['all', 'unpaid', 'paid'] as Filter[]).map((f) => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'filter-chip--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Tutti' : f === 'unpaid' ? 'Da pagare' : 'Pagati'}
          </button>
        ))}
      </section>

      <section className="filters filters--lega">
        <button
          className={`filter-chip ${legaFilter === 'all' ? 'filter-chip--active' : ''}`}
          onClick={() => setLegaFilter('all')}
        >
          Tutte le leghe
        </button>
        {LEGHE.map((lega) => (
          <button
            key={lega}
            className={`filter-chip lega-chip lega-chip--${lega} ${legaFilter === lega ? 'filter-chip--active' : ''}`}
            onClick={() => setLegaFilter(lega)}
          >
            {lega} · {totals.perLega[lega]}
          </button>
        ))}
      </section>

      <section className="bill-list">
        {visibleIscritti.length === 0 && (
          <p className="empty-state">Nessun iscritto qui. Aggiungine uno con il pulsante +.</p>
        )}
        {visibleIscritti.map((iscritto) => (
          <div key={iscritto.id} className={`bill-card ${iscritto.quotaPagata ? 'bill-card--paid' : 'bill-card--soon'}`}>
            <button
              className={`avatar ${iscritto.quotaPagata ? 'avatar--paid' : ''}`}
              onClick={() => togglePagato(iscritto.id)}
              aria-label={iscritto.quotaPagata ? 'Segna come da pagare' : 'Segna come pagato'}
              title={iscritto.quotaPagata ? 'Segna come da pagare' : 'Segna come pagato'}
            >
              {initials(iscritto.responsabile)}
            </button>
            <div className="bill-info">
              <div className="bill-title-row">
                <span className="bill-name">{iscritto.squadra}</span>
                <span className={`lega-badge lega-badge--${iscritto.lega}`}>{iscritto.lega}</span>
              </div>
              <div className="bill-meta">
                <span>{iscritto.responsabile}</span>
                {(iscritto.email || iscritto.telefono) && <span className="bill-dot">·</span>}
                <span>{[iscritto.email, iscritto.telefono].filter(Boolean).join(' · ')}</span>
              </div>
              <span className={`bill-status ${iscritto.quotaPagata ? 'bill-status--paid' : 'bill-status--soon'}`}>
                {iscritto.quotaPagata ? 'Pagato' : 'Da pagare'} · iscritto il {formatDate(iscritto.dataIscrizione)}
              </span>
            </div>
            <div className="bill-right">
              <span className="bill-amount">{formatCurrency(iscritto.importoQuota)}</span>
              <button className="bill-delete" onClick={() => deleteIscritto(iscritto.id)} aria-label="Elimina">
                🗑
              </button>
            </div>
          </div>
        ))}
      </section>

      <button className="fab" onClick={() => setShowForm(true)} aria-label="Aggiungi iscritto">
        +
      </button>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={addIscritto}>
            <h2>Nuovo iscritto</h2>
            <label>
              Nome squadra
              <input
                type="text"
                value={form.squadra}
                onChange={(e) => setForm({ ...form, squadra: e.target.value })}
                placeholder="Es. Real Casentino"
                autoFocus
                required
              />
            </label>
            <label>
              Responsabile
              <input
                type="text"
                value={form.responsabile}
                onChange={(e) => setForm({ ...form, responsabile: e.target.value })}
                placeholder="Nome e cognome"
                required
              />
            </label>
            <label>
              Lega
              <select value={form.lega} onChange={(e) => setForm({ ...form, lega: e.target.value as Lega })}>
                {LEGHE.map((lega) => (
                  <option key={lega} value={lega}>
                    {lega}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="mario.rossi@email.it"
              />
            </label>
            <label>
              Telefono
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="333 1234567"
              />
            </label>
            <label>
              Quota (€)
              <input
                type="text"
                inputMode="decimal"
                value={form.importoQuota}
                onChange={(e) => setForm({ ...form, importoQuota: e.target.value })}
                required
              />
            </label>
            <label>
              Data iscrizione
              <input
                type="date"
                value={form.dataIscrizione}
                onChange={(e) => setForm({ ...form, dataIscrizione: e.target.value })}
                required
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.quotaPagata}
                onChange={(e) => setForm({ ...form, quotaPagata: e.target.checked })}
              />
              Quota già pagata
            </label>
            <label>
              Note
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Facoltativo"
                rows={2}
              />
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

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={saveSettings}>
            <h2>Impostazioni lega</h2>
            <label>
              Nome lega
              <input
                type="text"
                value={settingsForm.nomeLega}
                onChange={(e) => setSettingsForm({ ...settingsForm, nomeLega: e.target.value })}
                required
              />
            </label>
            <label>
              Quota iscrizione predefinita (€)
              <input
                type="number"
                min="0"
                step="1"
                value={settingsForm.quotaDefault}
                onChange={(e) => setSettingsForm({ ...settingsForm, quotaDefault: Number(e.target.value) })}
                required
              />
            </label>
            <label>
              Posti totali
              <input
                type="number"
                min="1"
                step="1"
                value={settingsForm.postiTotali}
                onChange={(e) => setSettingsForm({ ...settingsForm, postiTotali: Number(e.target.value) })}
                required
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowSettings(false)}>
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
