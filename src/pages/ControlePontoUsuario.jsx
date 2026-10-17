import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import api from '../api/api'
import AjusteBatidaModal from '../components/AjusteBatidaModal.jsx'
import EspelhoTabela from '../components/EspelhoTabela.jsx'
import { fmtMin, fmtMoeda, mesAtual } from '../utils/formatadores'

export default function ControlePontoUsuario() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const mes = params.get('mes') || mesAtual()

  const [espelho, setEspelho] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [ajuste, setAjuste] = useState(null) // { modo, batida?, data? }

  const carregar = useCallback(async () => {
    try {
      const { data } = await api.get(`/ponto/admin/usuarios/${id}`, { params: { mes } })
      setEspelho(data)
      setErro('')
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Não foi possível carregar o espelho.')
    } finally {
      setCarregando(false)
    }
  }, [id, mes])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function salvarAjuste(dataHora, justificativa) {
    if (ajuste.modo === 'editar') {
      await api.put(`/ponto/admin/batidas/${ajuste.batida.id}`, { dataHora, justificativa })
    } else {
      await api.post(`/ponto/admin/usuarios/${id}/batidas`, { dataHora, justificativa })
    }
    setAjuste(null)
    await carregar()
  }

  async function removerBatida(justificativa) {
    await api.post(`/ponto/admin/batidas/${ajuste.batida.id}/remover`, { justificativa })
    setAjuste(null)
    await carregar()
  }

  if (carregando) {
    return <div className="conteudo"><p>Carregando...</p></div>
  }

  const t = espelho?.totais
  const f = espelho?.folha

  return (
    <div className="conteudo">
      <div className="topo-pagina">
        <div>
          <h1>{espelho ? espelho.nome : 'Espelho de ponto'}</h1>
          <div className="subtitulo">{espelho ? `Escala ${espelho.escala}` : ''}</div>
        </div>
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link to="/controle-ponto" className="btn-outline" style={{ textDecoration: 'none' }}>← Voltar</Link>
          <input
            type="month"
            className="input-mes"
            value={mes}
            onChange={(e) => e.target.value && setParams({ mes: e.target.value })}
          />
          <button className="btn-header contorno" onClick={() => window.print()}>🖨️ Imprimir</button>
        </div>
      </div>

      {erro && <div className="erro-msg">{erro}</div>}

      {espelho && f && t && (
        <>
          <div className="grade-stats">
            <div className="stat-card branco">
              <div className="stat-label">Salário base</div>
              <div className="stat-valor stat-valor-menor">{fmtMoeda(f.salarioBase)}</div>
              <div className="stat-desc">{f.diasEscalados} dias de escala · {fmtMoeda(f.valorHora)}/hora</div>
            </div>
            <div className="stat-card laranja">
              <div className="stat-label">Desconto</div>
              <div className="stat-valor stat-valor-menor">{fmtMoeda(f.desconto)}</div>
              <div className="stat-desc">{fmtMin(t.minutosFaltantes)} horas faltantes</div>
            </div>
            <div className="stat-card verde">
              <div className="stat-label">A pagar (estimativa)</div>
              <div className="stat-valor stat-valor-menor">{fmtMoeda(f.valorFinal)}</div>
              <div className="stat-desc">Sem DSR, encargos e extras</div>
            </div>
            <div className="stat-card roxo">
              <div className="stat-label">Faltas / Atrasos</div>
              <div className="stat-valor">{t.diasFalta} / {t.diasAtraso}</div>
              <div className="stat-desc">Atraso total: {fmtMin(t.minutosAtraso)}</div>
            </div>
            <div className="stat-card azul">
              <div className="stat-label">Horas extras</div>
              <div className="stat-valor">{fmtMin(t.minutosExtras)}</div>
              <div className="stat-desc">Informativo (não somado)</div>
            </div>
          </div>

          {t.diasIncompletos > 0 && (
            <div className="aviso-permissao">
              ⚠️ {t.diasIncompletos} dia(s) com batida de saída faltando — clique em “+ Batida” no dia para lançar a saída. Enquanto isso, esses dias não geram desconto.
            </div>
          )}

          <div className="card-tabela">
            <div className="card-tabela-titulo">Espelho do mês</div>
            <div className="card-tabela-subtitulo">
              Clique em uma batida para ajustar o horário ou removê-la. Use “+ Batida” para lançar uma que faltou. Todo ajuste exige justificativa e fica registrado.
            </div>
            <EspelhoTabela
              dias={espelho.dias}
              admin
              onEditarBatida={(batida) => setAjuste({ modo: 'editar', batida })}
              onAdicionarBatida={(dia) => setAjuste({ modo: 'adicionar', data: dia.data })}
            />
          </div>
        </>
      )}

      {ajuste && (
        <AjusteBatidaModal
          modo={ajuste.modo}
          batida={ajuste.batida}
          data={ajuste.data}
          onClose={() => setAjuste(null)}
          onSalvar={salvarAjuste}
          onRemover={removerBatida}
        />
      )}
    </div>
  )
}
