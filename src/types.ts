export const CATEGORIES = [
  'Affitto/Mutuo',
  'Utenze',
  'Internet/Telefono',
  'Assicurazione',
  'Spesa',
  'Altro',
] as const

export type Category = (typeof CATEGORIES)[number]

export interface Bill {
  id: string
  name: string
  amount: number
  category: Category
  dueDate: string // ISO yyyy-mm-dd
  paid: boolean
  recurring: boolean
}

export interface Payment {
  id: string
  billId: string
  name: string
  amount: number
  category: Category
  paidDate: string // ISO yyyy-mm-dd
}
