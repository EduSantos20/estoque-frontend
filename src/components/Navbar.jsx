import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/api";
import BaterPontoModal from "./BaterPontoModal.jsx";

export default function Navbar() {
  const { usuario, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [statusPonto, setStatusPonto] = useState(null);
  const [modalPonto, setModalPonto] = useState(false);

  const carregarStatus = useCallback(() => {
    api
      .get("/ponto/status")
      .then(({ data }) => setStatusPonto(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    carregarStatus();
    window.addEventListener("ponto-atualizado", carregarStatus);
    return () => window.removeEventListener("ponto-atualizado", carregarStatus);
  }, [carregarStatus]);

  const controlaPonto = statusPonto?.controlaPonto;

  function handleSair() {
    logout();
    navigate("/login");
  }

  const classe = ({ isActive }) => `topbar-link ${isActive ? "ativo" : ""}`;

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
        <NavLink to="/" end className={classe}>
          Estoque
        </NavLink>
        <NavLink to="/relatorios" className={classe}>
          Relatórios
        </NavLink>
        {controlaPonto && (
          <NavLink to="/meu-ponto" className={classe}>
            Meu Ponto
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/controle-ponto" className={classe}>
            Controle de Ponto
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/vendas" className={classe}>
            Histórico de Vendas
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/usuarios" className={classe}>
            Usuários
          </NavLink>
        )}
      </nav>

      <div className="topbar-direita">
        {controlaPonto && (
          <button
            className="btn-bater-ponto"
            onClick={() => setModalPonto(true)}
          >
            Bater ponto
          </button>
        )}
        <div className="topbar-usuario">
          <strong>{usuario?.nomeCompleto || usuario?.username}</strong>
          <span>{usuario?.role === "ADMIN" ? "Administrador" : "Usuário"}</span>
        </div>
        <button className="btn-header contorno" onClick={handleSair}>
          Sair
        </button>
      </div>

      {modalPonto && (
        <BaterPontoModal
          status={statusPonto}
          onClose={() => setModalPonto(false)}
        />
      )}
    </header>
  );
}
