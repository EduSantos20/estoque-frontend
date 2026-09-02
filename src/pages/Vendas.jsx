import { useEffect, useState } from 'react'
import api from '../api/api'

const CATEGORIAS = [
  { valor: '', label: 'Todas as categorias' },
  { valor: 'CAMPO', label: 'Campo' },
  { valor: 'FUTSAL', label: 'Futsal' },
  { valor: 'SOCIETY', label: 'Society' },
]

export default function Vendas() {
  const [vendas, setVendas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  async function carregar() {
    setCarregando(true)
    try {
      const params = filtroCategoria ? { categoria: filtroCategoria } : {}
      const { data } = await api.get('/vendas', { params })
      setVendas(data)
      setErro('')
    } catch (err) {
      setErro('Não foi possível carregar o histórico de vendas.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroCategoria])

  function formatarDataHora(dataStr) {
    return new Date(dataStr).toLocaleString('pt-BR')
  }

  const labelCategoria = (valor) => CATEGORIAS.find((c) => c.valor === valor)?.label || valor

  return (
    <div className="conteudo">
      <div className="topo-pagina">
        <div>
          <h1>Histórico de vendas</h1>
          <div className="subtitulo">Quem registrou cada venda, com data, hora, categoria e tamanho</div>
        </div>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--texto)', fontSize: '13.5px', fontWeight: 600 }}
        >
          {CATEGORIAS.map((c) => (
            <option key={c.valor} value={c.valor}>{c.label}</option>
          ))}
        </select>
      </div>

      {erro && <div className="erro-msg">{erro}</div>}

      {carregando ? (
        <p>Carregando...</p>
      ) : vendas.length === 0 ? (
        <div className="vazio">
          <h3>Nenhuma venda registrada ainda</h3>
          <p>Assim que alguém registrar uma venda, ela aparece aqui com o nome de quem vendeu.</p>
        </div>
      ) : (
        <div className="card-tabela">
          <div className="tabela-wrap">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Usuário</th>
                  <th>Categoria</th>
                  <th>Tamanho</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((v) => (
                  <tr key={v.id}>
                    <td>{formatarDataHora(v.dataHora)}</td>
                    <td><strong>{v.usuario}</strong></td>
                    <td>{labelCategoria(v.categoria)}</td>
                    <td>{v.tamanho}</td>
                    <td>{v.quantidade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
