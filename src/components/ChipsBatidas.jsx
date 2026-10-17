import { fmtHora } from '../utils/formatadores'

/** Lista de batidas do dia. Se "onClick" for passado, cada batida vira um botão (admin ajusta). */
export default function ChipsBatidas({ batidas, onClick }) {
  if (!batidas || batidas.length === 0) {
    return <span className="texto-fraco">Nenhuma batida</span>
  }

  return (
    <div className="chips-batidas">
      {batidas.map((b) => {
        const classe = `chip-batida ${b.tipo === 'ENTRADA' ? 'entrada' : 'saida'} ${b.ajustada ? 'ajustada' : ''}`
        let titulo = b.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'
        if (b.origem === 'MANUAL') titulo += ' — lançada pelo administrador'
        else if (b.ajustada) titulo += ` — ajustada (original ${fmtHora(b.dataHoraOriginal)})`
        if (b.ajustada && b.ajustadoPor) titulo += ` por ${b.ajustadoPor}`
        if (b.ajustada && b.justificativa) titulo += `: ${b.justificativa}`

        const conteudo = (
          <>
            <span className="chip-tipo">{b.tipo === 'ENTRADA' ? 'E' : 'S'}</span>
            {fmtHora(b.dataHora)}
            {b.ajustada && <span className="chip-lapis"> ✎</span>}
          </>
        )

        return onClick ? (
          <button key={b.id} type="button" className={classe} title={titulo} onClick={() => onClick(b)}>
            {conteudo}
          </button>
        ) : (
          <span key={b.id} className={classe} title={titulo}>{conteudo}</span>
        )
      })}
    </div>
  )
}
