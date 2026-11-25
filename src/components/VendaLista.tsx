import { formatarDataHora, formatarReais } from '../lib/formatar'
import type { Venda } from '../types/venda'

type VendaListaProps = {
  vendas: Venda[]
  carregando: boolean
  erro: string
}

export default function VendaLista({ vendas, carregando, erro }: VendaListaProps) {
  if (carregando) {
    return (
      <div className="card-playx rounded-2xl p-6 text-sm text-zinc-400">
        Carregando vendas...
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
  if (vendas.length === 0) {
    return (
      <div className="card-playx rounded-2xl p-6 text-sm text-zinc-400">
        Nenhuma venda registrada ainda.
      </div>
    )
  }

  return (
    <div className="card-playx overflow-hidden rounded-2xl">
      <ul className="divide-y divide-emerald-400/10">
        {vendas.map((venda) => (
          <li
            key={venda.id}
            className="flex items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-emerald-400/[0.04] sm:px-5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand/35 bg-brand/15 text-xs font-bold text-brand-bright shadow-[0_0_16px_-4px_rgba(24,223,133,0.5)]"
                aria-hidden="true"
              >
                R$
              </span>
              <div className="min-w-0 space-y-1">
                <ul className="space-y-0.5">
                  {venda.itens.map((item) => (
                    <li
                      key={`${venda.id}-${item.produtoId}`}
                      className="truncate text-sm font-medium text-zinc-100"
                    >
                      <span className="mr-1.5 font-bold text-brand">
                        {item.quantidade}x
                      </span>
                      {item.nome}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  <span className="rounded-md border border-emerald-400/15 bg-emerald-950/70 px-2 py-0.5 text-[11px] text-zinc-300">
                    {venda.formaPagamento}
                  </span>
                  <span>
                    {venda.criadoEm ? formatarDataHora(venda.criadoEm.toDate()) : 'Agora'}
                  </span>
                </div>
              </div>
            </div>

            <p className="shrink-0 text-sm font-bold tabular-nums text-brand sm:text-base">
              {formatarReais(venda.valorTotal)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
