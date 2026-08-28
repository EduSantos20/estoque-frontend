import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'

export default function Relatorios() {
  const [relatorios, setRelatorios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [fechando, setFechando] = useState(false)
  const [erro, setErro] = useState('')

  async function carregar() {
    try {
      const { data } = await api.get('/relatorios')
      setRelatorios(data)
    } catch (err) {
      setErro('Não foi possível carregar os relatórios.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function fecharSemana() {
    const confirmar = window.confirm(
      'Isso vai salvar um relatório com as vendas desta semana e zerar o contador de vendas para começar uma nova semana. Confirmar?'
    )
    if (!confirmar) return

    setFechando(true)
    try {
      await api.post('/relatorios/fechar-semana')
      await carregar()
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao fechar a semana')
    } finally {
      setFechando(false)
    }
  }

  function formatarData(dataStr) {
    return new Date(dataStr).toLocaleDateString('pt-BR')
  }

  function formatarDataHora(dataStr) {
    return new Date(dataStr).toLocaleString('pt-BR')
  }

  return (
    <div className="conteudo">
      <div className="topo-pagina">
        <div>
          <h1>Relatórios semanais</h1>
          <div className="subtitulo">Histórico de vendas fechadas por semana</div>
        </div>
        <button className="btn-accent no-print" onClick={fecharSemana} disabled={fechando}>
          {fechando ? 'Fechando...' : 'Fechar semana atual'}
        </button>
      </div>

      {erro && <div className="erro-msg">{erro}</div>}

      {carregando ? (
        <p>Carregando...</p>
      ) : relatorios.length === 0 ? (
        <div className="vazio">
          <h3>Nenhum relatório fechado ainda</h3>
          <p>Quando você clicar em "Fechar semana atual", o resumo de vendas fica salvo aqui.</p>
        </div>
      ) : (
        <div className="lista-relatorios">
          {relatorios.map((r) => (
            <Link to={`/relatorios/${r.id}`} key={r.id} className="item-relatorio" style={{ textDecoration: 'none' }}>
              <div className="item-relatorio-info">
                <strong>Semana de {formatarData(r.inicioSemana)} a {formatarData(r.fimSemana)}</strong>
                <span>Fechado em {formatarDataHora(r.fechadoEm)} por {r.fechadoPor}</span>
              </div>
              <div className="item-relatorio-total">{r.totalVendas} vendas</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
