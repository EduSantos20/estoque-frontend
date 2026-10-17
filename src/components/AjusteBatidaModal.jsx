import { useState } from 'react'
import { fmtHora } from '../utils/formatadores'

/**
 * Ajuste de batida pelo administrador.
 * modo "editar": altera o horário (ou remove) uma batida existente.
 * modo "adicionar": lança uma batida que faltou naquele dia.
 * Toda alteração exige justificativa e fica registrada com o nome de quem alterou.
 */
export default function AjusteBatidaModal({ modo, batida, data, onClose, onSalvar, onRemover }) {
  const [dataHora, setDataHora] = useState(
    modo === 'editar' ? batida.dataHora.slice(0, 16) : `${data}T08:00`
  )
  const [justificativa, setJustificativa] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const justificativaOk = justificativa.trim().length >= 3

  async function executar(acao) {
    if (!justificativaOk) {
      setErro('Informe a justificativa (mínimo 3 caracteres).')
      return
    }
    setEnviando(true)
    setErro('')
    try {
      await acao()
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Não foi possível salvar o ajuste.')
      setEnviando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-pequeno" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-titulo">
              {modo === 'editar'
                ? `✎ Ajustar ${batida.tipo === 'ENTRADA' ? 'entrada' : 'saída'}`
                : '➕ Lançar batida'}
            </div>
            <div className="modal-subtitulo">
              {modo === 'editar' && batida.ajustada
                ? `Já ajustada${batida.dataHoraOriginal ? ` (original ${fmtHora(batida.dataHoraOriginal)})` : ' (lançada manualmente)'}${batida.ajustadoPor ? ` por ${batida.ajustadoPor}` : ''}.`
                : 'Toda alteração fica registrada com a justificativa.'}
            </div>
          </div>
          <button className="modal-fechar" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '18px 22px 4px' }}>
          {erro && <div className="erro-msg">{erro}</div>}

          <div className="campo-form">
            <label>Data e hora da batida</label>
            <input type="datetime-local" value={dataHora} onChange={(e) => setDataHora(e.target.value)} />
          </div>

          <div className="campo-form">
            <label>Justificativa (obrigatória)</label>
            <input
              type="text"
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Ex: esqueceu de bater a saída, atestado, erro de lançamento..."
              maxLength={255}
              autoFocus
            />
          </div>
        </div>

        <div className="modal-footer">
          {modo === 'editar' ? (
            <button
              className="btn-header vermelho"
              disabled={enviando}
              onClick={() => executar(() => onRemover(justificativa.trim()))}
            >
              Remover batida
            </button>
          ) : <span />}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-outline" onClick={onClose} disabled={enviando}>Cancelar</button>
            <button
              className="btn-header verde"
              disabled={enviando || !dataHora}
              onClick={() => executar(() => onSalvar(dataHora, justificativa.trim()))}
            >
              {enviando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
