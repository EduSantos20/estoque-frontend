import { createContext, useContext, useState } from 'react'
import api from '../api/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem('estoque_usuario')
    return salvo ? JSON.parse(salvo) : null
  })

  async function login(username, senha) {
    const { data } = await api.post('/auth/login', { username, senha })
    const dadosUsuario = {
      username: data.username,
      nomeCompleto: data.nomeCompleto,
      role: data.role,
    }
    localStorage.setItem('estoque_token', data.token)
    localStorage.setItem('estoque_usuario', JSON.stringify(dadosUsuario))
    setUsuario(dadosUsuario)
    return dadosUsuario
  }

  function logout() {
    localStorage.removeItem('estoque_token')
    localStorage.removeItem('estoque_usuario')
    setUsuario(null)
  }

  const isAdmin = usuario?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ usuario, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
