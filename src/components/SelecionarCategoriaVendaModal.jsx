const CATEGORIAS_VENDA = [
  { valor: 'CAMPO', label: 'Campo', icone: '🌱' },
  { valor: 'FUTSAL', label: 'Futsal', icone: '🏟️' },
  { valor: 'SOCIETY', label: 'Society', icone: '⚽' },
]

/**
 * Modal exibido ao clicar em "Vender". Como o botão de venda é o mesmo
 * independente da aba (categoria) selecionada na tela, este modal obriga
 * o usuário a confirmar de qual grade (Campo, Futsal ou Society) é o par
 * vendido, para não descontar do estoque errado por engano.
 */
export default function SelecionarCategoriaVendaModal({ tamanho, onClose, onSelecionar, enviando }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-pequeno" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-titulo">🛒 Registrar venda — Tamanho {tamanho}</div>
            <div className="modal-subtitulo">
              De qual grade é este par? Isso garante que o desconto vá para o estoque certo.
            </div>
          </div>
          <button className="modal-fechar" onClick={onClose}>✕</button>
        </div>

        <div className="modal-opcoes-categoria">
          {CATEGORIAS_VENDA.map((c) => (
            <button
              key={c.valor}
              className="opcao-categoria-venda"
              onClick={() => onSelecionar(c.valor)}
              disabled={enviando}
            >
              <span className="opcao-categoria-icone">{c.icone}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button className="btn-outline" onClick={onClose} disabled={enviando}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}
