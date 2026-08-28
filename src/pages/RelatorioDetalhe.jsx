import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/api'

export default function RelatorioDetalhe() {
  const { id } = useParams()
  const [relatorio, setRelatorio] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    api.get(`/relatorios/${id}`).then(({ data }) => {
      setRelatorio(data)
      setCarregando(false)
    })
  }, [id])

  if (carregando) {
    return <div className="conteudo"><p>Carregando...</p></div>
  }

  if (!relatorio) {
    return <div className="conteudo"><p>Relatório não encontrado.</p></div>
  }

  const detalhesOrdenados = [...relatorio.detalhes].sort((a, b) => a.tamanho - b.tamanho)

  return (
    <div className="conteudo">
      <div className="topo-pagina">
        <div>
          <h1>Relatório semanal</h1>
          <div className="subtitulo">
            {new Date(relatorio.inicioSemana).toLocaleDateString('pt-BR')} a {new Date(relatorio.fimSemana).toLocaleDateString('pt-BR')}
            {' · '}fechado por {relatorio.fechadoPor}
          </div>
        </div>
        <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
          <Link to="/relatorios" className="btn-outline" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Voltar
          </Link>
          <button className="btn-accent" onClick={() => window.print()}>Imprimir</button>
        </div>
      </div>

      <table className="tabela">
        <thead>
          <tr>
            <th>Tamanho</th>
            <th>Vendas na semana</th>
            <th>Estoque final</th>
            <th>Meta</th>
            <th>Compra sugerida</th>
          </tr>
        </thead>
        <tbody>
          {detalhesOrdenados.map((d) => (
            <tr key={d.tamanho}>
              <td><strong>{d.tamanho}</strong></td>
              <td>{d.vendas}</td>
              <td>{d.estoqueFinal}</td>
              <td>{d.meta}</td>
              <td>{d.compraSugerida}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 700 }}>
            <td>Total</td>
            <td>{relatorio.totalVendas}</td>
            <td colSpan={3}></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
