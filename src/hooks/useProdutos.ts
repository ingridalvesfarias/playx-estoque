import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Produto } from '../types/produto'

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const consulta = query(collection(db, 'produtos'), orderBy('criadoEm', 'desc'))

    const cancelar = onSnapshot(
      consulta,
      (snapshot) => {
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Produto, 'id'>),
        }))
        setProdutos(lista)
        setCarregando(false)
      },
      (error) => {
        console.error(error)
        setErro('Não foi possível carregar os produtos.')
        setCarregando(false)
      },
    )

    return cancelar
  }, [])

  return { produtos, carregando, erro }
}