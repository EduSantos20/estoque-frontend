import { useEffect, useState } from 'react'
import api from '../api/api'
import { useAuth } from '../context/AuthContext.jsx'
import ReceberCorreiosModal from '../components/ReceberCorreiosModal.jsx'

function statusDoTamanho(item) {
  if (item.estoque <= 0) return 'alerta'
  if (item.estoque < item.meta) return 'atencao'
  return 'ok'
}

export default function Estoque() {
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [metasEditando, setMetasEditando] = useState({})
  const [processando, setProcessando] = useState(false)
  const [modalReceberAberto, setModalReceberAberto] = useState(false)
  const { isAdmin } = useAuth()

  async function carregar() {
    try {
      const { data } = await api.get('/estoque')
      setItens(data)
    } catch (err) {
      setErro('Não foi possível carregar o estoque. Verifique se o backend está rodando.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  function atualizarLinha(tamanho, novaLinha) {
    setItens((prev) => prev.map((i) => (i.tamanho === tamanho ? novaLinha : i)))
  }

  async function ajustarEstoque(tamanho, delta) {
    try {
      const { data } = await api.post(`/estoque/${tamanho}/estoque`, { quantidade: delta })
      atualizarLinha(tamanho, data)
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao ajustar estoque')
    }
  }

  async function ajustarACaminho(tamanho, delta) {
    try {
      const { data } = await api.post(`/estoque/${tamanho}/a-caminho`, { quantidade: delta })
      atualizarLinha(tamanho, data)
    } catch (err) {
      alert(err.response?.data?.mensagem || "Erro ao ajustar 'a caminho'")
    }
  }

  async function receberEncomenda(tamanho, quantidade = 1) {
    try {
      const { data } = await api.post(`/estoque/${tamanho}/receber`, { quantidade })
      atualizarLinha(tamanho, data)
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao receber encomenda')
    }
  }

  async function registrarVenda(tamanho) {
    try {
      const { data } = await api.post(`/estoque/${tamanho}/venda`, { quantidade: 1 })
      atualizarLinha(tamanho, data)
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao registrar venda')
    }
  }

  async function salvarMeta(tamanho) {
    const novaMeta = metasEditando[tamanho]
    if (novaMeta === undefined || novaMeta === '') return
    try {
      const { data } = await api.put(`/estoque/${tamanho}/meta`, { meta: Number(novaMeta) })
      atualizarLinha(tamanho, data)
      setMetasEditando((prev) => {
        const copia = { ...prev }
        delete copia[tamanho]
        return copia
      })
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao alterar meta')
    }
  }

  function abrirModalReceber() {
    setModalReceberAberto(true)
  }

  async function confirmarRecebimentoModal(selecionados) {
    for (const { tamanho, quantidade } of selecionados) {
      await receberEncomenda(tamanho, quantidade)
    }
    setModalReceberAberto(false)
  }

  async function novaSemana() {
    const confirmar = window.confirm(
      'Isso vai fechar a semana atual, salvar o relatório de vendas no histórico e zerar o contador de vendas para começar do zero. Confirmar?'
    )
    if (!confirmar) return

    setProcessando(true)
    try {
      await api.post('/relatorios/fechar-semana')
      await carregar()
      alert('Semana fechada com sucesso! O relatório ficou salvo na tela de Relatórios.')
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao fechar a semana')
    } finally {
      setProcessando(false)
    }
  }

  if (carregando) {
    return (
      <div className="conteudo">
        <p>Carregando estoque...</p>
      </div>
    )
  }

  const totalVendas = itens.reduce((s, i) => s + i.vendasSemana, 0)
  const totalEstoque = itens.reduce((s, i) => s + i.estoque, 0)
  const totalACaminho = itens.reduce((s, i) => s + i.aCaminho, 0)
  const totalMeta = itens.reduce((s, i) => s + i.meta, 0)
  const totalComprar = itens.reduce((s, i) => s + i.compraSugerida, 0)

  return (
    <div className="conteudo">
      <div className="topo-pagina no-print">
        <div>
          <h1>Painel de estoque</h1>
          <div className="subtitulo">Grade completa de tamanhos, 34 ao 43</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isAdmin && (
            <button className="btn-header azul" onClick={abrirModalReceber} disabled={processando}>
              📬 Receber Correios
            </button>
          )}
          <button className="btn-header verde" onClick={novaSemana} disabled={processando}>
            🗓️ Nova Semana
          </button>
        </div>
      </div>

      {!isAdmin && (
        <div className="aviso-permissao">
          Você está logado como usuário comum: pode registrar vendas, mas ajustes de estoque, compras ("a caminho") e meta são restritos ao administrador.
        </div>
      )}

      {erro && <div className="erro-msg">{erro}</div>}

      <div className="grade-stats">
        <div className="stat-card roxo">
          <div className="stat-label">Vendas (semana)</div>
          <div className="stat-valor">{totalVendas}</div>
          <div className="stat-desc">Pares vendidos na semana</div>
        </div>
        <div className="stat-card branco">
          <div className="stat-label">Estoque em loja</div>
          <div className="stat-valor">{totalEstoque}</div>
          <div className="stat-desc">Pronta entrega na loja</div>
        </div>
        <div className="stat-card laranja">
          <div className="stat-label">A caminho (Correios)</div>
          <div className="stat-valor">{totalACaminho}</div>
          <div className="stat-desc">Pedidos já encomendados</div>
        </div>
        <div className="stat-card azul">
          <div className="stat-label">Meta desejada</div>
          <div className="stat-valor">{totalMeta}</div>
          <div className="stat-desc">Capacidade máxima da grade</div>
        </div>
        <div className="stat-card verde">
          <div className="stat-label">A comprar p/ pedido</div>
          <div className="stat-valor">{totalComprar}</div>
          <div className="stat-desc">Pares a pedir na semana</div>
        </div>
      </div>

      <div className="card-pedido">
        <div>
          <div className="card-pedido-label">Relatório automático</div>
          <div className="card-pedido-titulo">📋 Resumo do pedido semanal p/ fornecedor</div>
        </div>
        <button className="btn-header contorno no-print" onClick={() => window.print()}>
          🖨️ Imprimir pedido
        </button>
      </div>

      <div className="card-tabela">
        <div className="card-tabela-titulo">Chuteira Campo / Society</div>
        <div className="card-tabela-subtitulo">Grade completa de calçados (tamanhos 34 ao 43)</div>

        <div className="tabela-wrap">
          <table className="tabela">
            <thead>
              <tr>
                <th>Tamanho</th>
                <th className="col-vendas">Vendas semanal</th>
                <th>Em loja</th>
                <th className="col-caminho">A caminho</th>
                <th className="col-meta">Meta</th>
                <th className="col-comprar">Comprar p/ semana</th>
                <th className="no-print">Ação rápida</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => {
                const status = statusDoTamanho(item)
                const metaEmEdicao = metasEditando[item.tamanho]
                return (
                  <tr key={item.tamanho}>
                    <td>
                      <span className="tamanho-chip">
                        <span className={`stud ${status}`} title={`Estoque: ${item.estoque} / Meta: ${item.meta}`} />
                        {item.tamanho}
                      </span>
                    </td>

                    <td>{item.vendasSemana}</td>

                    <td>
                      {isAdmin ? (
                        <div className="stepper">
                          <button onClick={() => ajustarEstoque(item.tamanho, -1)} disabled={item.estoque <= 0}>−</button>
                          <span className="valor">{item.estoque}</span>
                          <button onClick={() => ajustarEstoque(item.tamanho, 1)}>+</button>
                        </div>
                      ) : (
                        item.estoque
                      )}
                    </td>

                    <td>
                      {isAdmin ? (
                        <div className="stepper">
                          <button onClick={() => ajustarACaminho(item.tamanho, -1)} disabled={item.aCaminho <= 0}>−</button>
                          {item.aCaminho > 0 ? (
                            <span
                              className="valor"
                              onClick={abrirModalReceber}
                              title="Clique para receber correios deste e de outros tamanhos"
                              style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                            >
                              {item.aCaminho}
                            </span>
                          ) : (
                            <span className="valor">{item.aCaminho}</span>
                          )}
                          <button onClick={() => ajustarACaminho(item.tamanho, 1)} title="Registrar nova compra">+</button>
                        </div>
                      ) : (
                        item.aCaminho
                      )}
                    </td>

                    <td>
                      {isAdmin ? (
                        <div className="meta-editavel">
                          <input
                            type="number"
                            min="0"
                            value={metaEmEdicao !== undefined ? metaEmEdicao : item.meta}
                            onChange={(e) =>
                              setMetasEditando((prev) => ({ ...prev, [item.tamanho]: e.target.value }))
                            }
                            onBlur={() => salvarMeta(item.tamanho)}
                            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                          />
                        </div>
                      ) : (
                        item.meta
                      )}
                    </td>

                    <td className="col-comprar">{item.compraSugerida}</td>

                    <td className="no-print">
                      <div className="acao-rapida">
                        <button
                          className="btn-icone"
                          title="Registrar 1 venda"
                          onClick={() => registrarVenda(item.tamanho)}
                          disabled={item.estoque <= 0}
                        >
                          🛒
                        </button>
                        {isAdmin && (
                          <button
                            className="btn-icone"
                            title="Receber correios"
                            onClick={abrirModalReceber}
                            disabled={item.aCaminho <= 0}
                          >
                            📦
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalReceberAberto && (
        <ReceberCorreiosModal
          itens={itens.filter((i) => i.aCaminho > 0)}
          onClose={() => setModalReceberAberto(false)}
          onConfirm={confirmarRecebimentoModal}
        />
      )}
    </div>
  )
}
