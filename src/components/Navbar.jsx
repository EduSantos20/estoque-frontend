import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { usuario, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  function handleSair() {
    logout()
    navigate('/login')
  }

  return (
    <header className="topbar no-print">
      <div className="topbar-esquerda">
        <div className="topbar-logo">👟</div>
        <div>
          <div className="topbar-titulo">
            Estoque <span>Chuteiras</span>
            <span className="badge-status">Conectado</span>
          </div>
          <div className="topbar-subtitulo">Sistema de reposição semanal</div>
        </div>
      </div>

      <nav className="topbar-nav">
        <NavLink to="/" end className={({ isActive }) => `topbar-link ${isActive ? 'ativo' : ''}`}>
          Estoque
        </NavLink>
        <NavLink to="/relatorios" className={({ isActive }) => `topbar-link ${isActive ? 'ativo' : ''}`}>
          Relatórios
        </NavLink>
        {isAdmin && (
          <NavLink to="/vendas" className={({ isActive }) => `topbar-link ${isActive ? 'ativo' : ''}`}>
            Histórico de Vendas
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/usuarios" className={({ isActive }) => `topbar-link ${isActive ? 'ativo' : ''}`}>
            Usuários
          </NavLink>
        )}
      </nav>

      <div className="topbar-direita">
        <div className="topbar-usuario">
          <strong>{usuario?.nomeCompleto || usuario?.username}</strong>
          <span>{usuario?.role === 'ADMIN' ? 'Administrador' : 'Usuário'}</span>
        </div>
        <button className="btn-header contorno" onClick={handleSair}>Sair</button>
      </div>
    </header>
  )
}
