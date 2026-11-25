import { useState } from 'react'
import type { FormEvent } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import PlayXLogo from '../components/PlayXLogo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      await signInWithEmailAndPassword(auth, email, senha)
      setSucesso(true)
    } catch (error) {
      console.error(error)
      setErro('E-mail ou senha incorretos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020906] p-4">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(24,223,133,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(18,184,106,0.10),transparent_55%)]"
        aria-hidden="true"
      />

      <form
        onSubmit={handleSubmit}
        className="card-playx relative w-full max-w-sm space-y-5 rounded-2xl p-6"
      >
        <div className="flex flex-col items-center gap-2 pb-1 text-center">
          <PlayXLogo size="lg" />
          <p className="text-sm text-zinc-400">Acesse o painel de estoque</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-medium text-zinc-400">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-playx h-11 w-full rounded-xl px-3.5 text-base"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="senha" className="text-xs font-medium text-zinc-400">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="input-playx h-11 w-full rounded-xl px-3.5 text-base"
          />
        </div>

        {erro && (
          <p role="alert" className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {erro}
          </p>
        )}
        {sucesso && <p className="text-sm font-medium text-brand">Login realizado!</p>}

        <button
          type="submit"
          disabled={carregando}
          className="btn-playx h-11 w-full rounded-xl text-sm disabled:opacity-60"
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
