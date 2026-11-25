import { useState } from 'react'
import type { FormEvent } from 'react'
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { formatarReais } from '../lib/formatar'
import type { Produto } from '../types/produto'

const FORMAS_PAGAMENTO = ['Pix', 'Dinheiro', 'Cartão de débito', 'Cartão de crédito', 'Boleto']

type VendaFormProps = {
  produtos: Produto[]
}

export default function VendaForm({ produtos }: VendaFormProps) {
  const [produtoId, setProdutoId] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [formaPagamento, setFormaPagamento] = useState(FORMAS_PAGAMENTO[0])
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const disponiveis = produtos.filter((p) => p.ativo && p.quantidadeEstoque > 0)
  const produtoSelecionado = disponiveis.find((p) => p.id === produtoId)
  const quantidadeNumero = Number(quantidade)
  const quantidadeValida = Number.isInteger(quantidadeNumero) && quantidadeNumero > 0
  const total =
    produtoSelecionado && quantidadeValida
      ? produtoSelecionado.precoVenda * quantidadeNumero
      : 0

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setSucesso(false)

    if (!produtoId) {
      setErro('Escolha um produto.')
      return
    }
    if (!quantidadeValida) {
      setErro('A quantidade deve ser um número inteiro maior que zero.')
      return
    }

    setSalvando(true)
    try {
      await runTransaction(db, async (transacao) => {
        const produtoRef = doc(db, 'produtos', produtoId)
        const produtoSnap = await transacao.get(produtoRef)

        if (!produtoSnap.exists()) throw new Error('PRODUTO_NAO_ENCONTRADO')
        const dados = produtoSnap.data() as Omit<Produto, 'id'>
        if (!dados.ativo) throw new Error('PRODUTO_INATIVO')
        if (dados.quantidadeEstoque < quantidadeNumero) throw new Error('ESTOQUE_INSUFICIENTE')

        const subtotal = dados.precoVenda * quantidadeNumero
        const vendaRef = doc(collection(db, 'vendas'))

        transacao.update(produtoRef, {
          quantidadeEstoque: dados.quantidadeEstoque - quantidadeNumero,
        })
        transacao.set(vendaRef, {
          itens: [
            {
              produtoId,
              nome: dados.nome,
              quantidade: quantidadeNumero,
              valorUnitario: dados.precoVenda,
              subtotal,
            },
          ],
          valorTotal: subtotal,
          formaPagamento,
          criadoEm: serverTimestamp(),
        })
      })

      setProdutoId('')
      setQuantidade('1')
      setSucesso(true)
    } catch (error) {
      console.error(error)
      if (error instanceof Error && error.message === 'ESTOQUE_INSUFICIENTE') {
        setErro('Estoque insuficiente para essa quantidade.')
      } else {
        setErro('Não foi possível registrar a venda. Tente novamente.')
      }
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-playx w-full space-y-4 rounded-2xl p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-zinc-100">Registrar venda</h2>
        <span className="rounded-full border border-brand/35 bg-brand/15 px-2.5 py-0.5 text-[11px] font-semibold text-brand-bright">
          Caixa
        </span>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="produto" className="text-xs font-medium text-zinc-400">
          Produto
        </label>
        <select
          id="produto"
          value={produtoId}
          onChange={(e) => setProdutoId(e.target.value)}
          className="input-playx h-11 w-full rounded-xl px-3.5 text-base"
        >
          <option value="">Selecione...</option>
          {disponiveis.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} ({p.quantidadeEstoque} em estoque)
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="qtd-venda" className="text-xs font-medium text-zinc-400">
            Quantidade
          </label>
          <input
            id="qtd-venda"
            type="text"
            inputMode="numeric"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="input-playx h-11 w-full rounded-xl px-3.5 text-base"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="pagamento" className="text-xs font-medium text-zinc-400">
            Pagamento
          </label>
          <select
            id="pagamento"
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
            className="input-playx h-11 w-full rounded-xl px-3.5 text-base"
          >
            {FORMAS_PAGAMENTO.map((forma) => (
              <option key={forma} value={forma}>
                {forma}
              </option>
            ))}
          </select>
        </div>
      </div>

      {produtoSelecionado && (
        <div className="flex items-center justify-between rounded-xl border border-brand/20 bg-emerald-950/40 px-3.5 py-2.5 text-sm">
          <span className="text-zinc-300">Total da venda</span>
          <span className="font-bold tabular-nums text-brand-bright">
            {formatarReais(total)}
          </span>
        </div>
      )}

      {erro && (
        <p role="alert" className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {erro}
        </p>
      )}
      {sucesso && (
        <p className="rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-xs font-medium text-brand-bright">
          Venda registrada!
        </p>
      )}

      <button
        type="submit"
        disabled={salvando}
        className="btn-playx h-11 w-full rounded-xl text-sm disabled:opacity-60"
      >
        {salvando ? 'Registrando...' : 'Registrar venda'}
      </button>
    </form>
  )
}
