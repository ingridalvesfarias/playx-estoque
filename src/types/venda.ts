import type { Timestamp } from 'firebase/firestore'

export type ItemVenda = {
  produtoId: string
  nome: string
  quantidade: number
  valorUnitario: number
  subtotal: number
}

export type Venda = {
  id: string
  itens: ItemVenda[]
  valorTotal: number
  formaPagamento: string
  criadoEm: Timestamp | null
}
