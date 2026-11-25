import { useState } from 'react'
import type { FormEvent } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function ProdutoForm() {
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setSalvo(false)

    const precoNumero = Number(preco.replace(',', '.'))
    const quantidadeNumero = Number(quantidade)

    if (!nome.trim()) {
      setErro('Informe o nome do produto.')
      return
    }
    if (!Number.isFinite(precoNumero) || precoNumero <= 0) {
      setErro('Informe um preço válido.')
      return
    }
    if (!Number.isInteger(quantidadeNumero) || quantidadeNumero < 0) {
      setErro('A quantidade deve ser um número inteiro, zero ou mais.')
      return
    }

    setSalvando(true)
    try {
      await addDoc(collection(db, 'produtos'), {
        nome: nome.trim(),
        precoVenda: Math.round(precoNumero * 100),
        quantidadeEstoque: quantidadeNumero,
        ativo: true,
        criadoEm: serverTimestamp(),
      })
      setNome('')
      setPreco('')
      setQuantidade('')
      setSalvo(true)
    } catch (error) {
      console.error(error)
      setErro('Não foi possível salvar. Tente novamente.')
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
        <h2 className="text-base font-semibold text-zinc-100">Novo produto</h2>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300">
          Catálogo
        </span>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="nome" className="text-xs font-medium text-zinc-400">
          Nome
        </label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="input-playx h-11 w-full rounded-xl px-3.5 text-base"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="preco" className="text-xs font-medium text-zinc-400">
            Preço (R$)
          </label>
          <input
            id="preco"
            type="text"
            inputMode="decimal"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className="input-playx h-11 w-full rounded-xl px-3.5 text-base"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="quantidade" className="text-xs font-medium text-zinc-400">
            Quantidade
          </label>
          <input
            id="quantidade"
            type="text"
            inputMode="numeric"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="input-playx h-11 w-full rounded-xl px-3.5 text-base"
          />
        </div>
      </div>

      {erro && (
        <p role="alert" className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {erro}
        </p>
      )}
      {salvo && (
        <p className="rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-xs font-medium text-brand-bright">
          Produto salvo!
        </p>
      )}

      <button
        type="submit"
        disabled={salvando}
        className="btn-playx h-11 w-full rounded-xl text-sm disabled:opacity-60"
      >
        {salvando ? 'Salvando...' : 'Salvar produto'}
      </button>
    </form>
  )
}
