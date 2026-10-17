import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Estoque from './pages/Estoque.jsx'
import Relatorios from './pages/Relatorios.jsx'
import RelatorioDetalhe from './pages/RelatorioDetalhe.jsx'
import Usuarios from './pages/Usuarios.jsx'
import Vendas from './pages/Vendas.jsx'
import MeuPonto from './pages/MeuPonto.jsx'
import ControlePonto from './pages/ControlePonto.jsx'
import ControlePontoUsuario from './pages/ControlePontoUsuario.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function LayoutPrivado({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <LayoutPrivado>
              <Estoque />
            </LayoutPrivado>
          </ProtectedRoute>
        }
      />

      <Route
        path="/relatorios"
        element={
          <ProtectedRoute>
            <LayoutPrivado>
              <Relatorios />
            </LayoutPrivado>
          </ProtectedRoute>
        }
      />

      <Route
        path="/relatorios/:id"
        element={
          <ProtectedRoute>
            <LayoutPrivado>
              <RelatorioDetalhe />
            </LayoutPrivado>
          </ProtectedRoute>
        }
      />

      <Route
        path="/meu-ponto"
        element={
          <ProtectedRoute>
            <LayoutPrivado>
              <MeuPonto />
            </LayoutPrivado>
          </ProtectedRoute>
        }
      />

      <Route
        path="/controle-ponto"
        element={
          <ProtectedRoute apenasAdmin>
            <LayoutPrivado>
              <ControlePonto />
            </LayoutPrivado>
          </ProtectedRoute>
        }
      />

      <Route
        path="/controle-ponto/usuario/:id"
        element={
          <ProtectedRoute apenasAdmin>
            <LayoutPrivado>
              <ControlePontoUsuario />
            </LayoutPrivado>
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendas"
        element={
          <ProtectedRoute apenasAdmin>
            <LayoutPrivado>
              <Vendas />
            </LayoutPrivado>
          </ProtectedRoute>
        }
      />

      <Route
        path="/usuarios"
        element={
          <ProtectedRoute apenasAdmin>
            <LayoutPrivado>
              <Usuarios />
            </LayoutPrivado>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
