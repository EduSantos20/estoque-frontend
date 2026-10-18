import { useEffect, useState } from 'react'
import api from '../api/api'

const CATEGORIAS = [
  { valor: '', label: 'Todas as categorias' },
  { valor: 'CAMPO', label: 'Campo' },
  { valor: 'FUTSAL', label: 'Futsal' },
  { valor: 'SOCIETY', label: 'Society' },
]

export default function Vendas() {
  const [vendas, setVendas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [vendaCancelando, setVendaCancelando] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [enviandoCancelamento, setEnviandoCancelamento] = useState(false)

  async function carregar() {
    setCarregando(true)
    try {
      const params = filtroCategoria ? { categoria: filtroCategoria } : {}
      const { data } = await api.get('/vendas', { params })
      setVendas(data)
      setErro('')
    } catch (err) {
      setErro('Não foi possível carregar o histórico de vendas.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroCategoria])

  function formatarDataHora(dataStr) {
    return new Date(dataStr).toLocaleString('pt-BR')
  }

  const labelCategoria = (valor) => CATEGORIAS.find((c) => c.valor === valor)?.label || valor

  function abrirCancelamento(venda) {
    setVendaCancelando(venda)
    setMotivo('')
  }

  function fecharCancelamento() {
    setVendaCancelando(null)
    setMotivo('')
  }

  async function confirmarCancelamento() {
    setEnviandoCancelamento(true)
    try {
      await api.post(`/vendas/${vendaCancelando.id}/cancelar`, { motivo })
      fecharCancelamento()
      await carregar()
      alert('Venda cancelada. A quantidade voltou para o estoque.')
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao cancelar a venda')
    } finally {
      setEnviandoCancelamento(false)
    }
  }

  return (
    <div className="conteudo">
      <div className="topo-pagina">
        <div>
          <h1>Histórico de vendas</h1>
          <div className="subtitulo">Quem registrou cada venda, com data, hora, categoria e tamanho</div>
        </div>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--texto)', fontSize: '13.5px', fontWeight: 600 }}
        >
          {CATEGORIAS.map((c) => (
            <option key={c.valor} value={c.valor}>{c.label}</option>
          ))}
        </select>
      </div>

      {erro && <div className="erro-msg">{erro}</div>}

      {carregando ? (
        <p>Carregando...</p>
      ) : vendas.length === 0 ? (
        <div className="vazio">
          <h3>Nenhuma venda registrada ainda</h3>
          <p>Assim que alguém registrar uma venda, ela aparece aqui com o nome de quem vendeu.</p>
        </div>
      ) : (
        <div className="card-tabela">
          <div className="tabela-wrap">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Usuário</th>
                  <th>Categoria</th>
                  <th>Tamanho</th>
                  <th>Quantidade</th>
                  <th>Situação</th>
                  <th className="no-print">Ação</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((v) => (
                  <tr key={v.id} className={v.cancelada ? 'linha-cancelada' : ''}>
                    <td>{formatarDataHora(v.dataHora)}</td>
                    <td><strong>{v.usuario}</strong></td>
                    <td>{labelCategoria(v.categoria)}</td>
                    <td>{v.tamanho}</td>
                    <td>{v.quantidade}</td>
                    <td>
                      {v.cancelada ? (
                        <span
                          className="badge-cancelada"
                          title={`Cancelada por ${v.canceladaPor} em ${formatarDataHora(v.canceladaEm)}${v.motivoCancelamento ? ` — ${v.motivoCancelamento}` : ''}`}
                        >
                          Cancelada
                        </span>
                      ) : (
                        <span className="badge-ativa">Concluída</span>
                      )}
                    </td>
                    <td className="no-print">
                      {!v.cancelada && (
                        <button
                          className="btn-outline"
                          style={{ padding: '5px 12px', fontSize: '12px' }}
                          onClick={() => abrirCancelamento(v)}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {vendaCancelando && (
        <div className="modal-overlay" onClick={fecharCancelamento}>
          <div className="modal-card modal-card-pequeno" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-titulo">↩️ Cancelar venda</div>
                <div className="modal-subtitulo">
                  {labelCategoria(vendaCancelando.categoria)} · Tamanho {vendaCancelando.tamanho} · {vendaCancelando.quantidade} par(es)
                  <br />
                  Os {vendaCancelando.quantidade} par(es) voltam para o estoque.
                </div>
              </div>
              <button className="modal-fechar" onClick={fecharCancelamento}>✕</button>
            </div>

            <div style={{ padding: '18px 22px 4px' }}>
              <div className="campo-form">
                <label>Motivo (opcional)</label>
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex: cliente desistiu, lancei no tamanho errado..."
                  maxLength={255}
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
              <button className="btn-outline" onClick={fecharCancelamento} disabled={enviandoCancelamento}>
                Voltar
              </button>
              <button className="btn-header vermelho" onClick={confirmarCancelamento} disabled={enviandoCancelamento}>
                {enviandoCancelamento ? 'Cancelando...' : 'Confirmar cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
