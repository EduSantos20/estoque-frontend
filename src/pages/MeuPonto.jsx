import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'
import BaterPontoModal from '../components/BaterPontoModal.jsx'
import ChipsBatidas from '../components/ChipsBatidas.jsx'
import EspelhoTabela from '../components/EspelhoTabela.jsx'
import { fmtMin, mesAtual } from '../utils/formatadores'

export default function MeuPonto() {
  const [mes, setMes] = useState(mesAtual())
  const [status, setStatus] = useState(null)
  const [espelho, setEspelho] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const st = await api.get('/ponto/status')
      setStatus(st.data)
      if (!st.data.controlaPonto) {
        setEspelho(null)
        return
      }
      const esp = await api.get('/ponto/meu', { params: { mes } })
      setEspelho(esp.data)
      setErro('')
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Não foi possível carregar o seu ponto.')
    } finally {
      setCarregando(false)
    }
  }, [mes])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    window.addEventListener('ponto-atualizado', carregar)
    return () => window.removeEventListener('ponto-atualizado', carregar)
  }, [carregar])

  if (carregando) {
    return <div className="conteudo"><p>Carregando...</p></div>
  }

  if (status && !status.controlaPonto) {
    return (
      <div className="conteudo">
        <div className="topo-pagina"><div><h1>Meu ponto</h1></div></div>
        <div className="vazio">
          <h3>Ponto digital não habilitado</h3>
          <p>Seu usuário não está configurado para bater ponto. Fale com o administrador.</p>
        </div>
      </div>
    )
  }

  const t = espelho?.totais
  const pontualidade = t && t.diasTrabalhados > 0
    ? Math.round(((t.diasTrabalhados - t.diasAtraso) / t.diasTrabalhados) * 100)
    : 100

  return (
    <div className="conteudo">
      <div className="topo-pagina">
        <div>
          <h1>Meu ponto</h1>
          <div className="subtitulo">{status?.escala ? `Sua escala: ${status.escala}` : 'Espelho de ponto'}</div>
        </div>
        <div className="no-print">
          <label className="rotulo-inline">Mês</label>
          <input type="month" className="input-mes" value={mes} onChange={(e) => e.target.value && setMes(e.target.value)} />
        </div>
      </div>

      {erro && <div className="erro-msg">{erro}</div>}

      <div className="card-hoje no-print">
        <div>
          <div className="card-pedido-label">Hoje</div>
          <ChipsBatidas batidas={status?.batidasHoje} />
        </div>
        <button className="btn-header verde" onClick={() => setModalAberto(true)}>
          🕒 Registrar {status?.proximoTipo === 'SAIDA' ? 'saída' : 'entrada'}
        </button>
      </div>

      {t && (
        <div className="grade-stats">
          <div className="stat-card branco">
            <div className="stat-label">Horas trabalhadas</div>
            <div className="stat-valor">{fmtMin(t.minutosTrabalhados)}</div>
            <div className="stat-desc">{t.diasTrabalhados} dia(s) com batida</div>
          </div>
          <div className="stat-card laranja">
            <div className="stat-label">Atrasos</div>
            <div className="stat-valor">{fmtMin(t.minutosAtraso)}</div>
            <div className="stat-desc">{t.diasAtraso} dia(s) com atraso</div>
          </div>
          <div className="stat-card roxo">
            <div className="stat-label">Faltas</div>
            <div className="stat-valor">{t.diasFalta}</div>
            <div className="stat-desc">Horas faltantes: {fmtMin(t.minutosFaltantes)}</div>
          </div>
          <div className="stat-card azul">
            <div className="stat-label">Horas extras</div>
            <div className="stat-valor">{fmtMin(t.minutosExtras)}</div>
            <div className="stat-desc">Acima da jornada</div>
          </div>
          <div className="stat-card verde">
            <div className="stat-label">Pontualidade</div>
            <div className="stat-valor">{pontualidade}%</div>
            <div className="stat-desc">Dias sem atraso</div>
          </div>
        </div>
      )}

      {t && t.diasIncompletos > 0 && (
        <div className="aviso-permissao">
          ⚠️ Você tem {t.diasIncompletos} dia(s) com batida de saída faltando. Avise o administrador para ajustar.
        </div>
      )}

      <div className="card-tabela">
        <div className="card-tabela-titulo">Espelho do mês</div>
        <div className="card-tabela-subtitulo">Suas batidas, atrasos e horas dia a dia</div>
        {espelho && <EspelhoTabela dias={espelho.dias} />}
      </div>

      {modalAberto && <BaterPontoModal status={status} onClose={() => setModalAberto(false)} />}
    </div>
  )
}
