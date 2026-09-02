import { useEffect, useState } from 'react'
import api from '../api/api'
import { useAuth } from '../context/AuthContext.jsx'
import ReceberCorreiosModal from '../components/ReceberCorreiosModal.jsx'
import FazerPedidoModal from '../components/FazerPedidoModal.jsx'
import SelecionarCategoriaVendaModal from '../components/SelecionarCategoriaVendaModal.jsx'

const CATEGORIAS = [
  { valor: 'CAMPO', label: 'Campo' },
  { valor: 'FUTSAL', label: 'Futsal' },
  { valor: 'SOCIETY', label: 'Society' },
]

function statusDoTamanho(item) {
  if (item.estoque <= 0) return 'alerta'
  if (item.estoque < item.meta) return 'atencao'
  return 'ok'
}

export default function Estoque() {
  const [categoria, setCategoria] = useState('CAMPO')
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [processando, setProcessando] = useState(false)
  const [modalReceberAberto, setModalReceberAberto] = useState(false)
  const [modalPedidoAberto, setModalPedidoAberto] = useState(false)
  const [vendaTamanho, setVendaTamanho] = useState(null)
  const [vendaEnviando, setVendaEnviando] = useState(false)
  const { isAdmin } = useAuth()

  async function carregar(categoriaAlvo = categoria) {
    setCarregando(true)
    try {
      const { data } = await api.get(`/estoque/${categoriaAlvo}`)
      setItens(data)
      setErro('')
    } catch (err) {
      setErro('Não foi possível carregar o estoque. Verifique se o backend está rodando.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar(categoria)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria])

  function atualizarLinha(tamanho, novaLinha) {
    setItens((prev) => prev.map((i) => (i.tamanho === tamanho ? novaLinha : i)))
  }

  async function ajustarEstoque(tamanho, delta) {
    try {
      const { data } = await api.post(`/estoque/${categoria}/${tamanho}/estoque`, { quantidade: delta })
      atualizarLinha(tamanho, data)
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao ajustar estoque')
    }
  }

  async function ajustarACaminho(tamanho, delta) {
    try {
      const { data } = await api.post(`/estoque/${categoria}/${tamanho}/a-caminho`, { quantidade: delta })
      atualizarLinha(tamanho, data)
    } catch (err) {
      alert(err.response?.data?.mensagem || "Erro ao ajustar 'a caminho'")
    }
  }

  async function receberEncomenda(tamanho, quantidade = 1) {
    try {
      const { data } = await api.post(`/estoque/${categoria}/${tamanho}/receber`, { quantidade })
      atualizarLinha(tamanho, data)
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao receber encomenda')
    }
  }

  async function registrarVenda(tamanho, categoriaVenda) {
    const { data } = await api.post(`/estoque/${categoriaVenda}/${tamanho}/venda`, { quantidade: 1 })
    // só atualiza a tabela na tela se a venda foi da mesma categoria que está sendo exibida
    if (categoriaVenda === categoria) {
      atualizarLinha(tamanho, data)
    }
    return data
  }

  function abrirModalVenda(tamanho) {
    setVendaTamanho(tamanho)
  }

  function fecharModalVenda() {
    setVendaTamanho(null)
  }

  async function confirmarVenda(categoriaEscolhida) {
    setVendaEnviando(true)
    try {
      await registrarVenda(vendaTamanho, categoriaEscolhida)
      const labelEscolhida = CATEGORIAS.find((c) => c.valor === categoriaEscolhida)?.label || categoriaEscolhida
      setVendaTamanho(null)
      if (categoriaEscolhida !== categoria) {
        alert(`Venda registrada em ${labelEscolhida}, tamanho ${vendaTamanho}.`)
      }
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao registrar venda')
    } finally {
      setVendaEnviando(false)
    }
  }

  async function ajustarMeta(tamanho, delta) {
    const item = itens.find((i) => i.tamanho === tamanho)
    if (!item) return
    const novaMeta = item.meta + delta
    if (novaMeta < 0) return
    try {
      const { data } = await api.put(`/estoque/${categoria}/${tamanho}/meta`, { meta: novaMeta })
      atualizarLinha(tamanho, data)
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

  function abrirModalPedido() {
    setModalPedidoAberto(true)
  }

  async function confirmarPedidoModal(selecionados) {
    for (const { tamanho, quantidade } of selecionados) {
      await ajustarACaminho(tamanho, quantidade)
    }
    setModalPedidoAberto(false)
  }

  async function novaSemana() {
    const confirmar = window.confirm(
      'Isso vai fechar a semana atual para TODAS as categorias (Campo, Futsal e Society), salvar o relatório de vendas no histórico e zerar o contador de vendas para começar do zero. Confirmar?'
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

  const totalVendas = itens.reduce((s, i) => s + i.vendasSemana, 0)
  const totalEstoque = itens.reduce((s, i) => s + i.estoque, 0)
  const totalACaminho = itens.reduce((s, i) => s + i.aCaminho, 0)
  const totalMeta = itens.reduce((s, i) => s + i.meta, 0)
  const totalComprar = itens.reduce((s, i) => s + i.compraSugerida, 0)

  const labelCategoria = CATEGORIAS.find((c) => c.valor === categoria)?.label || categoria

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

      <div className="abas-categoria no-print">
        {CATEGORIAS.map((c) => (
          <button
            key={c.valor}
            className={`aba-categoria ${categoria === c.valor ? 'ativa' : ''}`}
            onClick={() => setCategoria(c.valor)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {!isAdmin && (
        <div className="aviso-permissao">
          Você está logado como usuário comum: pode registrar vendas, mas ajustes de estoque, compras ("a caminho") e meta são restritos ao administrador.
        </div>
      )}

      {erro && <div className="erro-msg">{erro}</div>}

      {carregando ? (
        <p>Carregando estoque...</p>
      ) : (
        <>
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
              <div className="card-pedido-label">Relatório automático · {labelCategoria}</div>
              <div className="card-pedido-titulo">📋 Resumo do pedido semanal p/ fornecedor</div>
            </div>
            {isAdmin && (
              <button className="btn-header laranja no-print" onClick={abrirModalPedido}>
                🚚 Mover p/ Correios
              </button>
            )}
          </div>

          <div className="card-tabela">
            <div className="card-tabela-titulo">Chuteira {labelCategoria}</div>
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
                              <button
                                onClick={() => ajustarACaminho(item.tamanho, -1)}
                                disabled={item.aCaminho <= 0}
                                title="Corrigir: cancelar 1 unidade do pedido"
                              >
                                −
                              </button>
                              {item.aCaminho > 0 ? (
                                <span
                                  className="valor"
                                  onClick={abrirModalReceber}
                                  title="Clique para receber correios"
                                  style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                                >
                                  {item.aCaminho}
                                </span>
                              ) : (
                                <span className="valor">{item.aCaminho}</span>
                              )}
                            </div>
                          ) : (
                            item.aCaminho
                          )}
                        </td>

                        <td>
                          {isAdmin ? (
                            <div className="stepper">
                              <button onClick={() => ajustarMeta(item.tamanho, -1)} disabled={item.meta <= 0}>−</button>
                              <span className="valor">{item.meta}</span>
                              <button onClick={() => ajustarMeta(item.tamanho, 1)}>+</button>
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
                              title="Registrar venda"
                              onClick={() => abrirModalVenda(item.tamanho)}
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
        </>
      )}

      {modalReceberAberto && (
        <ReceberCorreiosModal
          itens={itens.filter((i) => i.aCaminho > 0)}
          onClose={() => setModalReceberAberto(false)}
          onConfirm={confirmarRecebimentoModal}
        />
      )}

      {modalPedidoAberto && (
        <FazerPedidoModal
          itens={itens}
          onClose={() => setModalPedidoAberto(false)}
          onConfirm={confirmarPedidoModal}
        />
      )}

      {vendaTamanho !== null && (
        <SelecionarCategoriaVendaModal
          tamanho={vendaTamanho}
          onClose={fecharModalVenda}
          onSelecionar={confirmarVenda}
          enviando={vendaEnviando}
        />
      )}
    </div>
  )
}
