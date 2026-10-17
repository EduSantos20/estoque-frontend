import ChipsBatidas from './ChipsBatidas.jsx'
import { fmtMin, fmtDataCurta, SITUACOES } from '../utils/formatadores'

/**
 * Espelho de ponto: um dia por linha (mais recente primeiro).
 * No modo admin, as batidas viram botões (editar/remover) e cada dia ganha "+ Batida".
 */
export default function EspelhoTabela({ dias, admin = false, onEditarBatida, onAdicionarBatida }) {
  const ordenados = [...dias].reverse()

  if (ordenados.length === 0) {
    return (
      <div className="vazio">
        <p>Nenhum dia para mostrar neste período.</p>
      </div>
    )
  }

  return (
    <div className="tabela-wrap">
      <table className="tabela tabela-ponto">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Data</th>
            <th style={{ textAlign: 'left' }}>Batidas</th>
            <th>Trabalhadas</th>
            <th className="col-caminho">Atraso</th>
            <th className="col-comprar">Extras</th>
            <th>Faltantes</th>
            <th>Situação</th>
            {admin && <th className="no-print">Ajuste</th>}
          </tr>
        </thead>
        <tbody>
          {ordenados.map((d) => {
            const sit = SITUACOES[d.situacao] || SITUACOES.SEM_CONTROLE
            return (
              <tr key={d.data} className={d.escalado ? '' : 'linha-folga'}>
                <td style={{ textAlign: 'left', whiteSpace: 'nowrap' }}><strong>{fmtDataCurta(d.data, d.diaSemana)}</strong></td>
                <td style={{ textAlign: 'left' }}>
                  <ChipsBatidas batidas={d.batidas} onClick={admin ? onEditarBatida : undefined} />
                </td>
                <td>{fmtMin(d.minutosTrabalhados)}</td>
                <td className={d.minutosAtraso > 0 ? 'valor-atraso' : 'texto-fraco'}>{fmtMin(d.minutosAtraso)}</td>
                <td className={d.minutosExtras > 0 ? 'valor-extra' : 'texto-fraco'}>{fmtMin(d.minutosExtras)}</td>
                <td className={d.minutosFaltantes > 0 ? 'valor-falta' : 'texto-fraco'}>{fmtMin(d.minutosFaltantes)}</td>
                <td>
                  <div className="badges-linha">
                    <span className={`badge-sit ${sit.classe}`}>{sit.label}</span>
                    {d.emExpediente && <span className="badge-sit info">Em expediente</span>}
                    {d.incompleto && <span className="badge-sit atraso" title="Falta a batida de saída. Não gera desconto até ser ajustada.">Incompleto</span>}
                  </div>
                </td>
                {admin && (
                  <td className="no-print">
                    <button className="btn-mini-texto" onClick={() => onAdicionarBatida(d)}>+ Batida</button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
