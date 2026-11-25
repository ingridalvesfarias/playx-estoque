import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Venda } from '../types/venda'

export function useVendas() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const consulta = query(collection(db, 'vendas'), orderBy('criadoEm', 'desc'))

    const cancelar = onSnapshot(
      consulta,
      (snapshot) => {
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Venda, 'id'>),
        }))
        setVendas(lista)
        setCarregando(false)
      },
      (error) => {
        console.error(error)
        setErro('Não foi possível carregar as vendas.')
        setCarregando(false)
      },
    )

    return cancelar
  }, [])

  return { vendas, carregando, erro }
}
