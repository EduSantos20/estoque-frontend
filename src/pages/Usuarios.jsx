import { useEffect, useState } from 'react'
import api from '../api/api'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [form, setForm] = useState({ username: '', nomeCompleto: '', senha: '', role: 'USER' })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    const { data } = await api.get('/usuarios')
    setUsuarios(data)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      await api.post('/usuarios', form)
      setForm({ username: '', nomeCompleto: '', senha: '', role: 'USER' })
      await carregar()
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao criar usuário')
    } finally {
      setSalvando(false)
    }
  }

  async function desativar(id) {
    if (!window.confirm('Desativar este usuário?')) return
    await api.delete(`/usuarios/${id}`)
    await carregar()
  }

  return (
    <div className="conteudo">
      <div className="topo-pagina">
        <div>
          <h1>Usuários</h1>
          <div className="subtitulo">Cadastro de quem pode acessar o sistema</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '24px', maxWidth: '480px', boxShadow: 'var(--sombra)' }}>
        <h3 style={{ marginBottom: '14px', fontSize: '18px', color: '#f8fafc' }}>Novo usuário</h3>

        {erro && <div className="erro-msg">{erro}</div>}

        <div className="campo-form">
          <label>Usuário (login)</label>
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        </div>
        <div className="campo-form">
          <label>Nome completo</label>
          <input value={form.nomeCompleto} onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })} />
        </div>
        <div className="campo-form">
          <label>Senha</label>
          <input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} required minLength={6} />
        </div>
        <div className="campo-form">
          <label>Permissão</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            style={{ width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '14.5px', background: 'var(--dark)', color: 'var(--texto)' }}
          >
            <option value="USER">Usuário comum (vendas e relatórios)</option>
            <option value="ADMIN">Administrador (acesso total)</option>
          </select>
        </div>
        <button className="btn-primario" type="submit" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Criar usuário'}
        </button>
      </form>

      <table className="tabela" style={{ maxWidth: '640px' }}>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Nome</th>
            <th>Permissão</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.nomeCompleto || '—'}</td>
              <td>{u.role === 'ADMIN' ? 'Administrador' : 'Usuário'}</td>
              <td>{u.ativo ? 'Ativo' : 'Inativo'}</td>
              <td>
                {u.ativo && (
                  <button className="btn-outline" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => desativar(u.id)}>
                    Desativar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
