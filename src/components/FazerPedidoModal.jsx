import { useState } from 'react'

/**
 * Modal "Mover para Correios (A Caminho)".
 * Mostra todos os tamanhos da categoria com a quantidade SUGERIDA de compra
 * (Meta - Estoque - A caminho) como referência. O usuário informa quanto
 * realmente encomendou com o fornecedor para cada tamanho (pode ser igual,
 * menor ou maior que o sugerido) e confirma. Só então essa quantidade
 * entra em "A caminho".
 *
 * O botão "Correios" (ReceberCorreiosModal) continua servindo só para
 * RECEBER o que já está a caminho -- este modal aqui é só para REGISTRAR
 * o pedido feito ao fornecedor.
 */
export default function FazerPedidoModal({ itens, onClose, onConfirm }) {
  const [quantidades, setQuantidades] = useState(() => {
    const inicial = {}
    itens.forEach((item) => {
      inicial[item.tamanho] = 0
    })
    return inicial
  })
  const [enviando, setEnviando] = useState(false)

  function alterar(tamanho, delta) {
    setQuantidades((prev) => {
      const atual = prev[tamanho] || 0
      const novo = Math.max(0, atual + delta)
      return { ...prev, [tamanho]: novo }
    })
  }

  function alterarDireto(tamanho, valor) {
    let numero = Number(valor)
    if (Number.isNaN(numero) || numero < 0) numero = 0
    setQuantidades((prev) => ({ ...prev, [tamanho]: numero }))
  }

  async function handleConfirmar() {
    const selecionados = itens
      .map((item) => ({ tamanho: item.tamanho, quantidade: quantidades[item.tamanho] || 0 }))
      .filter((item) => item.quantidade > 0)

    if (selecionados.length === 0) {
      alert('Informe a quantidade encomendada de pelo menos um tamanho.')
      return
    }

    setEnviando(true)
    try {
      await onConfirm(selecionados)
    } finally {
      setEnviando(false)
    }
  }

  const totalPedido = Object.values(quantidades).reduce((s, v) => s + (Number(v) || 0), 0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-titulo">🚚 Mover para Correios (A Caminho)</div>
            <div className="modal-subtitulo">
              Abaixo estão os pares sugeridos para compra. Ajuste a quantidade que você <strong>realmente encomendou</strong> com o fornecedor.
            </div>
          </div>
          <button className="modal-fechar" onClick={onClose}>✕</button>
        </div>

        <div className="modal-lista">
          {itens.map((item) => (
            <div key={item.tamanho} className="modal-linha">
              <div className="modal-linha-tamanho">
                <span className="tamanho-selo">{item.tamanho}</span>
                <div>
                  <div className="modal-linha-titulo">Tamanho Nº {item.tamanho}</div>
                  <div className="modal-linha-info sugerido">Sugerido: {item.compraSugerida}</div>
                </div>
              </div>

              <div className="modal-linha-acoes">
                <button className="btn-mini" onClick={() => alterar(item.tamanho, -1)}>−</button>
                <input
                  type="number"
                  min="0"
                  value={quantidades[item.tamanho]}
                  onChange={(e) => alterarDireto(item.tamanho, e.target.value)}
                  className="input-laranja"
                />
                <button className="btn-mini" onClick={() => alterar(item.tamanho, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <span className="modal-total">Total do pedido: <strong>{totalPedido}</strong> par(es)</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-outline" onClick={onClose} disabled={enviando}>Cancelar</button>
            <button className="btn-header laranja" onClick={handleConfirmar} disabled={enviando}>
              {enviando ? 'Enviando...' : '✓ Confirmar Pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
