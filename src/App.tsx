import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from './lib/firebase'
import Login from './pages/Login'
import Home from './pages/Home'

function App() {
  const [usuario, setUsuario] = useState<User | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, (user) => {
      setUsuario(user)
      setCarregando(false)
    })
    return cancelar
  }, [])

  if (carregando) {
    return <div className="min-h-screen bg-zinc-950" />
  }

  return usuario ? <Home usuario={usuario} /> : <Login />
}

export default App