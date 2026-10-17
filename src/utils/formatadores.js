// Helpers de formatacao. Datas "AAAA-MM-DD" NUNCA passam por new Date() aqui,
// porque isso interpreta como UTC e mostra o dia anterior no fuso do Brasil.

export function fmtMin(min) {
  const m = Math.abs(Math.round(min || 0))
  const h = Math.floor(m / 60)
  const r = m % 60
  return `${String(h).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

/** "2026-10-16T08:02:11" -> "08:02" */
export function fmtHora(iso) {
  return iso ? iso.slice(11, 16) : '--:--'
}

/** "2026-10-16" + "SEX" -> "Sex - 16/10" */
export function fmtDataCurta(isoData, diaSemana) {
  const [, m, d] = isoData.split('-')
  const dia = diaSemana ? diaSemana.charAt(0) + diaSemana.slice(1).toLowerCase() : ''
  return `${dia} - ${d}/${m}`
}

export function fmtMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function mesAtual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function hojeISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const SITUACOES = {
  PONTUAL: { label: 'Pontual', classe: 'ok' },
  ATRASO: { label: 'Atraso', classe: 'atraso' },
  FALTA: { label: 'Falta', classe: 'falta' },
  NAO_BATEU: { label: 'Não bateu', classe: 'falta' },
  AGUARDANDO: { label: 'Aguardando', classe: 'neutro' },
  FOLGA: { label: 'Folga', classe: 'neutro' },
  FOLGA_TRABALHADA: { label: 'Folga trabalhada', classe: 'info' },
  SEM_CONTROLE: { label: '—', classe: 'neutro' },
}
