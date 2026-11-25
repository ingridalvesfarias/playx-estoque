import { useState } from 'react'
import type { FormEvent } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { formatarReais } from '../lib/formatar'
import type { Produto } from '../types/produto'

type ProdutoCardProps = {
  produto: Produto
}

function ProdutoCard({ produto }: ProdutoCardProps) {
  const [editando, setEditando] = useState(false)
  const [confirmandoDesativar, setConfirmandoDesativar] = useState(false)
  const [nome, setNome] = useState(produto.nome)
  const [preco, setPreco] = useState((produto.precoVenda / 100).toFixed(2).replace('.', ','))
  const [quantidade, setQuantidade] = useState(String(produto.quantidadeEstoque))
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  function abrirEdicao() {
    setNome(produto.nome)
    setPreco((produto.precoVenda / 100).toFixed(2).replace('.', ','))
    setQuantidade(String(produto.quantidadeEstoque))
    setErro('')
    setConfirmandoDesativar(false)
    setEditando(true)
  }

  async function handleSalvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')

    const nomeLimpo = nome.trim()
    const precoNumero = Number(preco.replace(',', '.'))
    const quantidadeNumero = Number(quantidade)

    if (!nomeLimpo || nomeLimpo.length > 120) {
      setErro('Informe um nome válido (até 120 caracteres).')
      return
    }
    if (!Number.isFinite(precoNumero) || precoNumero <= 0) {
      setErro('Informe um preço válido.')
      return
    }
    if (!Number.isInteger(quantidadeNumero) || quantidadeNumero < 0) {
      setErro('A quantidade deve ser um inteiro, zero ou mais.')
      return
    }

    setSalvando(true)
    try {
      await updateDoc(doc(db, 'produtos', produto.id), {
        nome: nomeLimpo,
        precoVenda: Math.round(precoNumero * 100),
        quantidadeEstoque: quantidadeNumero,
      })
      setEditando(false)
    } catch (error) {
      console.error(error)
      setErro('Não foi possível atualizar o produto.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleDesativar() {
    setErro('')
    setSalvando(true)
    try {
      await updateDoc(doc(db, 'produtos', produto.id), {
        ativo: false,
      })
    } catch (error) {
      console.error(error)
      setErro('Não foi possível desativar o produto.')
      setSalvando(false)
    }
  }

  if (editando) {
    return (
      <li className="card-playx rounded-2xl border-brand/45 p-4">
        <form onSubmit={handleSalvar} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor={`nome-${produto.id}`} className="text-xs font-medium text-zinc-400">
              Nome
            </label>
            <input
              id={`nome-${produto.id}`}
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="input-playx h-10 w-full rounded-xl px-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor={`preco-${produto.id}`} className="text-xs font-medium text-zinc-400">
                Preço (R$)
              </label>
              <input
                id={`preco-${produto.id}`}
                type="text"
                inputMode="decimal"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="input-playx h-10 w-full rounded-xl px-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor={`qtd-${produto.id}`} className="text-xs font-medium text-zinc-400">
                Estoque
              </label>
              <input
                id={`qtd-${produto.id}`}
                type="text"
                inputMode="numeric"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="input-playx h-10 w-full rounded-xl px-3 text-sm"
              />
            </div>
          </div>

          {erro && <p role="alert" className="text-xs text-red-400">{erro}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={salvando}
              className="btn-playx h-10 flex-1 rounded-xl text-sm disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              disabled={salvando}
              onClick={() => setEditando(false)}
              className="btn-playx-ghost h-10 rounded-xl px-3 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </li>
    )
  }

  const semEstoque = produto.quantidadeEstoque === 0

  return (
    <li className="card-playx flex flex-col justify-between gap-4 rounded-2xl p-4 transition duration-200 hover:border-brand/35 hover:shadow-[0_14px_34px_-16px_rgba(24,223,133,0.3)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-zinc-100">{produto.nome}</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-brand">
            {formatarReais(produto.precoVenda)}
          </p>
        </div>

        <span
          className={
            semEstoque
              ? 'shrink-0 rounded-full border border-red-500/30 bg-red-500/12 px-2.5 py-1 text-xs font-medium text-red-300'
              : 'shrink-0 rounded-full border border-brand/30 bg-brand/12 px-2.5 py-1 text-xs font-semibold tabular-nums text-brand-bright'
          }
        >
          {semEstoque ? 'Sem estoque' : `${produto.quantidadeEstoque} un.`}
        </span>
      </div>

      {erro && <p role="alert" className="text-xs text-red-400">{erro}</p>}

      {confirmandoDesativar ? (
        <div className="flex items-center justify-between gap-2 border-t border-emerald-400/12 pt-3">
          <span className="text-xs text-zinc-400">Desativar produto?</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={salvando}
              onClick={handleDesativar}
              className="btn-playx-danger h-8 rounded-lg border-red-500/40 bg-red-500/20 px-3 text-xs font-semibold text-red-200 disabled:opacity-60"
            >
              Confirmar
            </button>
            <button
              type="button"
              disabled={salvando}
              onClick={() => setConfirmandoDesativar(false)}
              className="btn-playx-ghost h-8 rounded-lg px-3 text-xs"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 border-t border-emerald-400/12 pt-3">
          <button
            type="button"
            onClick={abrirEdicao}
            className="btn-playx-ghost h-9 flex-1 rounded-xl text-xs font-medium"
          >
            Editar / Repor
          </button>
          <button
            type="button"
            onClick={() => setConfirmandoDesativar(true)}
            className="btn-playx-danger h-9 rounded-xl px-3 text-xs font-medium"
          >
            Desativar
          </button>
        </div>
      )}
    </li>
  )
}

type ProdutoListaProps = {
  produtos: Produto[]
  carregando: boolean
  erro: string
}

export default function ProdutoLista({ produtos, carregando, erro }: ProdutoListaProps) {
  const ativos = produtos.filter((p) => p.ativo)

  if (carregando) {
    return (
      <div className="card-playx rounded-2xl p-6 text-sm text-zinc-400">
        Carregando produtos...
      </div>
    )
  }
  if (erro) {
    return (
      <p role="alert" className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">
        {erro}
      </p>
    )
  }
  if (ativos.length === 0) {
    return (
      <div className="card-playx rounded-2xl p-6 text-sm text-zinc-400">
        Nenhum produto cadastrado.
      </div>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {ativos.map((produto) => (
        <ProdutoCard key={produto.id} produto={produto} />
      ))}
    </ul>
  )
}
