import { useState } from 'react'
import { signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { formatarReais } from '../lib/formatar'
import { useProdutos } from '../hooks/useProdutos'
import { useVendas } from '../hooks/useVendas'
import type { Venda } from '../types/venda'
import PlayXLogo from '../components/PlayXLogo'
import ProdutoForm from '../components/ProdutoForm'
import ProdutoLista from '../components/ProdutoLista'
import VendaForm from '../components/VendaForm'
import VendaLista from '../components/VendaLista'

type HomeProps = {
  usuario: User
}

type Aba = 'geral' | 'vendas' | 'produtos' | 'historico'

const ABAS: { id: Aba; label: string }[] = [
  { id: 'geral', label: 'Visão geral' },
  { id: 'vendas', label: 'Registrar venda' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'historico', label: 'Histórico' },
]

function pertenceAoMesAtual(venda: Venda, referencia: Date): boolean {
  if (!venda.criadoEm) return true
  const data = venda.criadoEm.toDate()
  return (
    data.getMonth() === referencia.getMonth() &&
    data.getFullYear() === referencia.getFullYear()
  )
}

export default function Home({ usuario }: HomeProps) {
  const [abaAtiva, setAbaAtiva] = useState<Aba>('geral')
  const { produtos, carregando: carregandoProdutos, erro: erroProdutos } = useProdutos()
  const { vendas, carregando: carregandoVendas, erro: erroVendas } = useVendas()

  const agora = new Date()
  const mesLabel = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(agora)

  const vendasDoMes = vendas.filter((v) => pertenceAoMesAtual(v, agora))
  const totalMes = vendasDoMes.reduce((soma, v) => soma + v.valorTotal, 0)

  const produtosAtivos = produtos.filter((p) => p.ativo)
  const totalUnidades = produtosAtivos.reduce((soma, p) => soma + p.quantidadeEstoque, 0)
  const semEstoque = produtosAtivos.filter((p) => p.quantidadeEstoque === 0).length

  const tituloAtual = ABAS.find((a) => a.id === abaAtiva)?.label ?? 'Visão geral'

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#020906] text-zinc-100 lg:flex">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(24,223,133,0.16),transparent_48%),radial-gradient(ellipse_at_90%_90%,rgba(18,184,106,0.08),transparent_50%)]"
        aria-hidden="true"
      />

      {/* Sidebar Desktop */}
      <aside className="relative z-10 hidden w-64 shrink-0 flex-col justify-between border-r border-emerald-400/12 bg-[#030d09]/85 p-5 backdrop-blur-xl lg:flex">
        <div className="space-y-7">
          <div className="px-1">
            <PlayXLogo />
            <p className="mt-1.5 text-xs text-zinc-500">Controle de estoque e vendas</p>
          </div>

          <nav aria-label="Navegação principal" className="space-y-1.5">
            {ABAS.map((aba) => {
              const ativa = abaAtiva === aba.id
              return (
                <button
                  key={aba.id}
                  type="button"
                  onClick={() => setAbaAtiva(aba.id)}
                  className={
                    ativa
                      ? 'btn-playx flex w-full items-center rounded-xl px-3.5 py-2.5 text-left text-sm'
                      : 'flex w-full cursor-pointer touch-manipulation items-center rounded-xl border border-transparent px-3.5 py-2.5 text-left text-sm font-medium text-zinc-400 transition duration-150 hover:border-emerald-400/20 hover:bg-emerald-400/[0.08] hover:text-zinc-100 active:scale-[0.97]'
                  }
                >
                  {aba.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="space-y-3 border-t border-emerald-400/12 pt-4">
          <div className="rounded-xl border border-emerald-400/12 bg-[#071610]/80 px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">Conta conectada</p>
            <p className="mt-0.5 truncate text-xs font-medium text-zinc-300">{usuario.email}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="btn-playx-ghost h-10 w-full rounded-xl text-sm font-medium"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* Header Mobile e Tablet */}
        <header className="sticky top-0 z-20 border-b border-emerald-400/12 bg-[#030d09]/90 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <PlayXLogo size="sm" />
            <div className="flex items-center gap-2.5">
              <span className="hidden text-xs text-zinc-400 sm:inline">{usuario.email}</span>
              <button
                type="button"
                onClick={() => signOut(auth)}
                className="btn-playx-ghost h-9 rounded-lg px-3 text-xs font-medium"
              >
                Sair
              </button>
            </div>
          </div>

          <nav aria-label="Navegação móvel" className="mt-3 flex gap-2 overflow-x-auto pb-0.5">
            {ABAS.map((aba) => {
              const ativa = abaAtiva === aba.id
              return (
                <button
                  key={aba.id}
                  type="button"
                  onClick={() => setAbaAtiva(aba.id)}
                  className={
                    ativa
                      ? 'btn-playx shrink-0 rounded-lg px-3.5 py-1.5 text-xs'
                      : 'btn-playx-ghost shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-medium'
                  }
                >
                  {aba.label}
                </button>
              )
            })}
          </nav>
        </header>

        {/* Top Bar Desktop */}
        <header className="hidden items-center justify-between border-b border-emerald-400/10 px-8 py-5 lg:flex">
          <h1 className="text-2xl font-bold tracking-tight text-white">{tituloAtual}</h1>
          <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-[#071610]/80 px-3.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <span
              className="h-2 w-2 rounded-full bg-brand shadow-[0_0_10px_#18df85]"
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-zinc-200">{usuario.email}</span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
          <h1 className="text-xl font-bold tracking-tight text-white lg:hidden">{tituloAtual}</h1>

          {/* Cards de Resumo (Total do mês + Estoque) */}
          {(abaAtiva === 'geral' || abaAtiva === 'historico') && (
            <section className="grid gap-4 md:grid-cols-3">
              <div className="card-playx-hero rounded-2xl p-5 md:col-span-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-emerald-200/80">
                      Total do mês · {mesLabel}
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-white sm:text-4xl">
                      {carregandoVendas ? '...' : formatarReais(totalMes)}
                    </p>
                  </div>
                  <span className="rounded-full border border-brand/40 bg-brand/15 px-3 py-1 text-xs font-semibold text-brand-bright shadow-[0_0_18px_-4px_rgba(24,223,133,0.45)]">
                    {vendasDoMes.length} {vendasDoMes.length === 1 ? 'venda' : 'vendas'}
                  </span>
                </div>
              </div>

              <div className="card-playx grid grid-cols-2 divide-x divide-emerald-400/12 rounded-2xl md:grid-cols-1 md:divide-x-0 md:divide-y">
                <div className="p-4">
                  <p className="text-xs font-medium text-zinc-400">Produtos ativos</p>
                  <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-2xl font-bold tabular-nums text-white">
                      {carregandoProdutos ? '...' : produtosAtivos.length}
                    </p>
                    {semEstoque > 0 && (
                      <span className="text-xs font-medium text-red-300">
                        {semEstoque} sem estoque
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs font-medium text-zinc-400">Unidades em estoque</p>
                  <p className="mt-1.5 text-2xl font-bold tabular-nums text-brand">
                    {carregandoProdutos ? '...' : totalUnidades}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Formulários de Ação */}
          {abaAtiva === 'geral' && (
            <section className="grid items-start gap-5 md:grid-cols-2">
              <VendaForm produtos={produtos} />
              <ProdutoForm />
            </section>
          )}

          {abaAtiva === 'vendas' && (
            <section className="max-w-xl">
              <VendaForm produtos={produtos} />
            </section>
          )}

          {abaAtiva === 'produtos' && (
            <section className="max-w-xl">
              <ProdutoForm />
            </section>
          )}

          {/* Lista de Produtos */}
          {(abaAtiva === 'geral' || abaAtiva === 'produtos') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-zinc-100">Produtos</h2>
                <span className="text-xs text-zinc-400">
                  {produtosAtivos.length} {produtosAtivos.length === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <ProdutoLista
                produtos={produtos}
                carregando={carregandoProdutos}
                erro={erroProdutos}
              />
            </section>
          )}

          {/* Histórico de Vendas */}
          {(abaAtiva === 'geral' || abaAtiva === 'historico' || abaAtiva === 'vendas') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-zinc-100">Histórico de vendas</h2>
                <span className="text-xs text-zinc-400">
                  {vendas.length} {vendas.length === 1 ? 'registro' : 'registros'}
                </span>
              </div>
              <VendaLista vendas={vendas} carregando={carregandoVendas} erro={erroVendas} />
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
