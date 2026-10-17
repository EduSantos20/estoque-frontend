import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'
import ChipsBatidas from '../components/ChipsBatidas.jsx'
import { fmtMin, fmtMoeda, hojeISO, mesAtual, SITUACOES } from '../utils/formatadores'

export default function ControlePonto() {
  const [aba, setAba] = useState('dia')
  const [data, setData] = useState(hojeISO())
  const [mes, setMes] = useState(mesAtual())
  const [resumoDia, setResumoDia] = useState(null)
  const [resumoMes, setResumoMes] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let cancelado = false
    async function carregar() {
      setCarregando(true)
      try {
        if (aba === 'dia') {
          const { data: r } = await api.get('/ponto/admin/dia', { params: { data } })
          if (!cancelado) setResumoDia(r)
        } else {
          const { data: r } = await api.get('/ponto/admin/mes', { params: { mes } })
          if (!cancelado) setResumoMes(r)
        }
        if (!cancelado) setErro('')
      } catch (err) {
        if (!cancelado) setErro(err.response?.data?.mensagem || 'Não foi possível carregar o controle de ponto.')
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }
    carregar()
    return () => { cancelado = true }
  }, [aba, data, mes])

  const c = resumoDia?.contadores

  return (
    <div className="conteudo">
      <div className="topo-pagina">
        <div>
          <h1>Controle de ponto</h1>
          <div className="subtitulo">Quem bateu, quem não bateu, atrasos e fechamento do mês</div>
        </div>
        <div className="no-print">
          {aba === 'dia' ? (
            <>
              <label className="rotulo-inline">Dia</label>
              <input type="date" className="input-mes" value={data} onChange={(e) => e.target.value && setData(e.target.value)} />
            </>
          ) : (
            <>
              <label className="rotulo-inline">Mês</label>
              <input type="month" className="input-mes" value={mes} onChange={(e) => e.target.value && setMes(e.target.value)} />
            </>
          )}
        </div>
      </div>

      <div className="abas-categoria no-print">
        <button className={`aba-categoria ${aba === 'dia' ? 'ativa' : ''}`} onClick={() => setAba('dia')}>Registro do dia</button>
        <button className={`aba-categoria ${aba === 'folha' ? 'ativa' : ''}`} onClick={() => setAba('folha')}>Folha do mês</button>
      </div>

      {erro && <div className="erro-msg">{erro}</div>}

      {carregando ? (
        <p>Carregando...</p>
      ) : aba === 'dia' ? (
        resumoDia && (
          <>
            <div className="grade-stats">
              <div className="stat-card branco">
                <div className="stat-label">Escalados</div>
                <div className="stat-valor">{c.escalados}</div>
                <div className="stat-desc">Trabalham neste dia</div>
              </div>
              <div className="stat-card verde">
                <div className="stat-label">Bateram</div>
                <div className="stat-valor">{c.bateram}</div>
                <div className="stat-desc">Com ao menos 1 batida</div>
              </div>
              <div className="stat-card roxo">
                <div className="stat-label">Não bateram</div>
                <div className="stat-valor">{c.naoBateram}</div>
                <div className="stat-desc">Falta ou ainda sem batida</div>
              </div>
              <div className="stat-card laranja">
                <div className="stat-label">Atrasados</div>
                <div className="stat-valor">{c.atrasados}</div>
                <div className="stat-desc">Acima da tolerância</div>
              </div>
              <div className="stat-card azul">
                <div className="stat-label">De folga</div>
                <div className="stat-valor">{c.emFolga}</div>
                <div className="stat-desc">Fora da escala</div>
              </div>
            </div>

            {resumoDia.linhas.length === 0 ? (
              <div className="vazio">
                <h3>Nenhum funcionário com ponto habilitado</h3>
                <p>Na tela Usuários, edite um usuário e marque “Bate ponto na loja”, definindo a escala e o salário.</p>
              </div>
            ) : (
              <div className="card-tabela">
                <div className="tabela-wrap">
                  <table className="tabela tabela-ponto">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Funcionário</th>
                        <th>Escala</th>
                        <th style={{ textAlign: 'left' }}>Batidas</th>
                        <th>Trabalhadas</th>
                        <th className="col-caminho">Atraso</th>
                        <th>Situação</th>
                        <th className="no-print"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumoDia.linhas.map((l) => {
                        const sit = SITUACOES[l.dia.situacao] || SITUACOES.SEM_CONTROLE
                        const alerta = l.dia.situacao === 'FALTA' || l.dia.situacao === 'NAO_BATEU'
                        return (
                          <tr key={l.usuarioId} className={alerta ? 'linha-alerta' : ''}>
                            <td style={{ textAlign: 'left' }}><strong>{l.nome}</strong></td>
                            <td>{l.escala}</td>
                            <td style={{ textAlign: 'left' }}><ChipsBatidas batidas={l.dia.batidas} /></td>
                            <td>{fmtMin(l.dia.minutosTrabalhados)}</td>
                            <td className={l.dia.minutosAtraso > 0 ? 'valor-atraso' : 'texto-fraco'}>{fmtMin(l.dia.minutosAtraso)}</td>
                            <td>
                              <div className="badges-linha">
                                <span className={`badge-sit ${sit.classe}`}>{sit.label}</span>
                                {l.dia.emExpediente && <span className="badge-sit info">Em expediente</span>}
                                {l.dia.incompleto && <span className="badge-sit atraso">Incompleto</span>}
                              </div>
                            </td>
                            <td className="no-print">
                              <Link className="link-acao" to={`/controle-ponto/usuario/${l.usuarioId}?mes=${resumoDia.data.slice(0, 7)}`}>
                                Espelho / ajustes
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )
      ) : (
        resumoMes && (
          <>
            <div className="grade-stats">
              <div className="stat-card branco">
                <div className="stat-label">Salários base</div>
                <div className="stat-valor stat-valor-menor">{fmtMoeda(resumoMes.totalBase)}</div>
                <div className="stat-desc">Soma dos funcionários</div>
              </div>
              <div className="stat-card laranja">
                <div className="stat-label">Descontos</div>
                <div className="stat-valor stat-valor-menor">{fmtMoeda(resumoMes.totalDescontos)}</div>
                <div className="stat-desc">Atrasos, faltas e saídas antecipadas</div>
              </div>
              <div className="stat-card verde">
                <div className="stat-label">Total a pagar</div>
                <div className="stat-valor stat-valor-menor">{fmtMoeda(resumoMes.totalFinal)}</div>
                <div className="stat-desc">Estimativa do mês</div>
              </div>
            </div>

            {resumoMes.diasIncompletosPendentes > 0 && (
              <div className="aviso-permissao">
                ⚠️ {resumoMes.diasIncompletosPendentes} dia(s) com batida de saída faltando. Eles não geram desconto até você ajustar (abra o espelho do funcionário).
              </div>
            )}

            {resumoMes.usuarios.length === 0 ? (
              <div className="vazio">
                <h3>Nenhum funcionário com ponto habilitado</h3>
                <p>Na tela Usuários, edite um usuário e marque “Bate ponto na loja”.</p>
              </div>
            ) : (
              <div className="card-tabela">
                <div className="card-tabela-titulo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Folha de {resumoMes.mes.split('-').reverse().join('/')}</span>
                  <button className="btn-header contorno no-print" onClick={() => window.print()}>🖨️ Imprimir</button>
                </div>
                <div className="card-tabela-subtitulo">Desconto = horas faltantes (atrasos, saídas antecipadas e faltas acima da tolerância) × valor da hora</div>
                <div className="tabela-wrap">
                  <table className="tabela tabela-ponto">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Funcionário</th>
                        <th>Salário</th>
                        <th>Faltas</th>
                        <th className="col-caminho">Atrasos</th>
                        <th>Horas faltantes</th>
                        <th className="col-comprar">Horas extras</th>
                        <th>Desconto</th>
                        <th>A pagar</th>
                        <th className="no-print"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumoMes.usuarios.map((u) => (
                        <tr key={u.usuarioId}>
                          <td style={{ textAlign: 'left' }}>
                            <strong>{u.nome}</strong>
                            <div className="texto-fraco" style={{ fontSize: '11.5px' }}>{u.escala}</div>
                          </td>
                          <td>{fmtMoeda(u.folha.salarioBase)}</td>
                          <td className={u.totais.diasFalta > 0 ? 'valor-falta' : 'texto-fraco'}>{u.totais.diasFalta}</td>
                          <td className={u.totais.minutosAtraso > 0 ? 'valor-atraso' : 'texto-fraco'}>{fmtMin(u.totais.minutosAtraso)}</td>
                          <td className={u.totais.minutosFaltantes > 0 ? 'valor-falta' : 'texto-fraco'}>{fmtMin(u.totais.minutosFaltantes)}</td>
                          <td className={u.totais.minutosExtras > 0 ? 'valor-extra' : 'texto-fraco'}>{fmtMin(u.totais.minutosExtras)}</td>
                          <td className={Number(u.folha.desconto) > 0 ? 'valor-falta' : 'texto-fraco'}>{fmtMoeda(u.folha.desconto)}</td>
                          <td><strong>{fmtMoeda(u.folha.valorFinal)}</strong></td>
                          <td className="no-print">
                            <Link className="link-acao" to={`/controle-ponto/usuario/${u.usuarioId}?mes=${resumoMes.mes}`}>
                              Ver / ajustar
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="nota-rodape">
                  Estimativa simplificada para conferência: não considera DSR, encargos, benefícios nem horas extras. Confirme os valores finais com seu contador.
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  )
}
