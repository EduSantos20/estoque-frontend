import { useState } from 'react'

/**
 * Modal "Receber Correios".
 * Mostra apenas os tamanhos que têm alguma quantidade "a caminho" (> 0),
 * para evitar receber mais do que realmente foi comprado.
 * O usuário confirma a quantidade que de fato chegou para cada tamanho
 * (por padrão, já vem preenchido com o total "a caminho", mas pode editar
 * caso tenha chegado só uma parte do pedido).
 */
export default function ReceberCorreiosModal({ itens, onClose, onConfirm }) {
  const [quantidades, setQuantidades] = useState(() => {
    const inicial = {}
    itens.forEach((item) => {
      inicial[item.tamanho] = item.aCaminho
    })
    return inicial
  })
  const [enviando, setEnviando] = useState(false)

  function alterarQuantidade(tamanho, valor, max) {
    let numero = Number(valor)
    if (Number.isNaN(numero)) numero = 0
    if (numero < 0) numero = 0
    if (numero > max) numero = max
    setQuantidades((prev) => ({ ...prev, [tamanho]: numero }))
  }

  function marcarTudo(tamanho, max) {
    setQuantidades((prev) => ({ ...prev, [tamanho]: max }))
  }

  function marcarNada(tamanho) {
    setQuantidades((prev) => ({ ...prev, [tamanho]: 0 }))
  }

  async function handleConfirmar() {
    const selecionados = itens
      .map((item) => ({ tamanho: item.tamanho, quantidade: quantidades[item.tamanho] || 0 }))
      .filter((item) => item.quantidade > 0)

    if (selecionados.length === 0) {
      alert('Informe ao menos uma quantidade recebida maior que zero.')
      return
    }

    setEnviando(true)
    try {
      await onConfirm(selecionados)
    } finally {
      setEnviando(false)
    }
  }

  const totalSelecionado = Object.values(quantidades).reduce((s, v) => s + (Number(v) || 0), 0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-titulo">📬 Receber Correios</div>
            <div className="modal-subtitulo">
              Só aparecem aqui os tamanhos com pares "a caminho". Confirme a quantidade que realmente chegou.
            </div>
          </div>
          <button className="modal-fechar" onClick={onClose}>✕</button>
        </div>

        {itens.length === 0 ? (
          <div className="modal-vazio">Não há nenhum pedido "a caminho" no momento.</div>
        ) : (
          <div className="modal-lista">
            {itens.map((item) => (
              <div key={item.tamanho} className="modal-linha">
                <div className="modal-linha-tamanho">
                  <span className="tamanho-chip">{item.tamanho}</span>
                  <span className="modal-linha-info">{item.aCaminho} par(es) a caminho</span>
                </div>

                <div className="modal-linha-acoes">
                  <button className="btn-mini" onClick={() => marcarNada(item.tamanho)}>0</button>
                  <input
                    type="number"
                    min="0"
                    max={item.aCaminho}
                    value={quantidades[item.tamanho]}
                    onChange={(e) => alterarQuantidade(item.tamanho, e.target.value, item.aCaminho)}
                  />
                  <button className="btn-mini" onClick={() => marcarTudo(item.tamanho, item.aCaminho)}>Tudo</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-footer">
          <span className="modal-total">Total a receber: <strong>{totalSelecionado}</strong> par(es)</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-outline" onClick={onClose} disabled={enviando}>Cancelar</button>
            <button className="btn-header azul" onClick={handleConfirmar} disabled={enviando || itens.length === 0}>
              {enviando ? 'Recebendo...' : 'Confirmar recebimento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
