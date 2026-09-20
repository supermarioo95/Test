export interface Iscritto {
  id: string
  squadra: string
  responsabile: string
  email: string
  telefono: string
  dataIscrizione: string // ISO yyyy-mm-dd
  quotaPagata: boolean
  importoQuota: number
  note: string
}

export interface Impostazioni {
  nomeLega: string
  quotaDefault: number
  postiTotali: number
}

export const IMPOSTAZIONI_DEFAULT: Impostazioni = {
  nomeLega: 'FantaCity League',
  quotaDefault: 20,
  postiTotali: 20,
}
