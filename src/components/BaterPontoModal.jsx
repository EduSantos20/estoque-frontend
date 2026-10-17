import { useEffect, useState } from 'react'
import api from '../api/api'
import ChipsBatidas from './ChipsBatidas.jsx'
import { fmtHora } from '../utils/formatadores'

/**
 * Confirmação de batida. O horário registrado é SEMPRE o do servidor
 * (o relógio abaixo é só para o usuário conferir).
 */
export default function BaterPontoModal({ status, onClose }) {
  const [agora, setAgora] = useState(new Date())
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const tipo = status?.proximoTipo === 'SAIDA' ? 'Saída' : 'Entrada'

  async function confirmar() {
    setEnviando(true)
    setErro('')
    try {
      const { data } = await api.post('/ponto/bater')
      setResultado(data)
      window.dispatchEvent(new Event('ponto-atualizado'))
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Não foi possível registrar o ponto.')
    } finally {
      setEnviando(false)
    }
  }

  const batidasMostradas = resultado ? resultado.batidasHoje : status?.batidasHoje || []
  const ultima = resultado && resultado.batidasHoje.length > 0
    ? resultado.batidasHoje[resultado.batidasHoje.length - 1]
    : null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-pequeno" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-titulo">🕒 Bater ponto</div>
            <div className="modal-subtitulo">
              {resultado ? 'Ponto registrado com sucesso.' : `Próxima batida: ${tipo}`}
            </div>
          </div>
          <button className="modal-fechar" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '18px 22px 6px' }}>
          <div className="relogio-grande">{agora.toLocaleTimeString('pt-BR')}</div>
          <div className="relogio-data">
            {agora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </div>

          {resultado && ultima && (
            <div className="aviso-sucesso">
              ✅ {ultima.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'} registrada às <strong>{fmtHora(ultima.dataHora)}</strong>
            </div>
          )}

          {erro && <div className="erro-msg">{erro}</div>}

          <div className="rotulo-secao">Batidas de hoje</div>
          <ChipsBatidas batidas={batidasMostradas} />
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          {resultado ? (
            <button className="btn-header verde" onClick={onClose}>Fechar</button>
          ) : (
            <>
              <button className="btn-outline" onClick={onClose} disabled={enviando}>Cancelar</button>
              <button className="btn-header verde" onClick={confirmar} disabled={enviando}>
                {enviando ? 'Registrando...' : `Confirmar ${tipo.toLowerCase()}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
