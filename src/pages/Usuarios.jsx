import { useEffect, useState } from "react";
import api from "../api/api";
import { fmtMoeda, hojeISO } from "../utils/formatadores";

const DIAS = [
  { n: 1, l: "Seg" },
  { n: 2, l: "Ter" },
  { n: 3, l: "Qua" },
  { n: 4, l: "Qui" },
  { n: 5, l: "Sex" },
  { n: 6, l: "Sáb" },
  { n: 7, l: "Dom" },
];

const PONTO_PADRAO = {
  controlaPonto: false,
  horaEntrada: "08:00",
  horaSaida: "18:00",
  toleranciaMinutos: 10,
  intervaloMinutos: 0,
  diasTrabalho: [1, 2, 3, 4, 5, 6],
  salarioMensal: "",
  pontoDesde: hojeISO(),
};

function montarPayloadPonto(f) {
  return {
    controlaPonto: f.controlaPonto,
    horaEntrada: f.horaEntrada || null,
    horaSaida: f.horaSaida || null,
    toleranciaMinutos: Number(f.toleranciaMinutos),
    intervaloMinutos: Number(f.intervaloMinutos),
    diasTrabalho: [...f.diasTrabalho].sort().join(","),
    salarioMensal: f.salarioMensal === "" ? null : Number(f.salarioMensal),
    pontoDesde: f.pontoDesde || null,
  };
}

function pontoDoUsuario(u) {
  return {
    controlaPonto: u.controlaPonto,
    horaEntrada: u.horaEntrada ? u.horaEntrada.slice(0, 5) : "08:00",
    horaSaida: u.horaSaida ? u.horaSaida.slice(0, 5) : "18:00",
    toleranciaMinutos: u.toleranciaMinutos ?? 10,
    intervaloMinutos: u.intervaloMinutos ?? 0,
    diasTrabalho: u.diasTrabalho
      ? u.diasTrabalho.split(",").map(Number)
      : [1, 2, 3, 4, 5, 6],
    salarioMensal: u.salarioMensal ?? "",
    pontoDesde: u.pontoDesde || hojeISO(),
  };
}

/** Campos de ponto/escala/salário, usados no cadastro e na edição. */
function CamposPonto({ valor, onChange }) {
  const set = (campo, v) => onChange({ ...valor, [campo]: v });

  function alternarDia(n) {
    const atual = valor.diasTrabalho;
    set(
      "diasTrabalho",
      atual.includes(n) ? atual.filter((d) => d !== n) : [...atual, n],
    );
  }

  return (
    <div className="bloco-ponto">
      <label className="check-linha">
        <input
          type="checkbox"
          checked={valor.controlaPonto}
          onChange={(e) => set("controlaPonto", e.target.checked)}
        />
        <span>Bate ponto na loja</span>
      </label>

      {valor.controlaPonto && (
        <>
          <div className="grade-form">
            <div className="campo-form">
              <label>Entrada</label>
              <input
                type="time"
                value={valor.horaEntrada}
                onChange={(e) => set("horaEntrada", e.target.value)}
                required
              />
            </div>
            <div className="campo-form">
              <label>Saída</label>
              <input
                type="time"
                value={valor.horaSaida}
                onChange={(e) => set("horaSaida", e.target.value)}
                required
              />
            </div>
            <div className="campo-form">
              <label>Tolerância (min)</label>
              <input
                type="number"
                min="0"
                max="60"
                value={valor.toleranciaMinutos}
                onChange={(e) => set("toleranciaMinutos", e.target.value)}
              />
            </div>
            <div className="campo-form">
              <label title="Descontado automaticamente quando o dia tem só entrada e saída">
                Intervalo/almoço (min)
              </label>
              <input
                type="number"
                min="0"
                max="240"
                value={valor.intervaloMinutos}
                onChange={(e) => set("intervaloMinutos", e.target.value)}
              />
            </div>
            <div className="campo-form">
              <label>Salário mensal (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={valor.salarioMensal}
                onChange={(e) => set("salarioMensal", e.target.value)}
              />
            </div>
            <div className="campo-form">
              <label>Controle a partir de</label>
              <input
                type="date"
                value={valor.pontoDesde}
                onChange={(e) => set("pontoDesde", e.target.value)}
              />
            </div>
          </div>

          <div className="campo-form">
            <label>Dias de trabalho</label>
            <div className="dias-semana">
              {DIAS.map((d) => (
                <button
                  key={d.n}
                  type="button"
                  className={`dia-toggle ${valor.diasTrabalho.includes(d.n) ? "ativo" : ""}`}
                  onClick={() => alternarDia(d.n)}
                >
                  {d.l}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    username: "",
    nomeCompleto: "",
    senha: "",
    role: "USER",
  });
  const [ponto, setPonto] = useState(PONTO_PADRAO);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({ nomeCompleto: "", senha: "" });
  const [editPonto, setEditPonto] = useState(PONTO_PADRAO);
  const [erroEdicao, setErroEdicao] = useState("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  async function carregar() {
    const { data } = await api.get("/usuarios");
    setUsuarios(data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await api.post("/usuarios", { ...form, ...montarPayloadPonto(ponto) });
      setForm({ username: "", nomeCompleto: "", senha: "", role: "USER" });
      setPonto({ ...PONTO_PADRAO, pontoDesde: hojeISO() });
      await carregar();
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao criar usuário");
    } finally {
      setSalvando(false);
    }
  }

  function abrirEdicao(u) {
    setEditando(u);
    setEditForm({ nomeCompleto: u.nomeCompleto || "", senha: "" });
    setEditPonto(pontoDoUsuario(u));
    setErroEdicao("");
  }

  async function salvarEdicao(e) {
    e.preventDefault();
    setErroEdicao("");
    setSalvandoEdicao(true);
    try {
      await api.put(`/usuarios/${editando.id}`, {
        ...editForm,
        ...montarPayloadPonto(editPonto),
      });
      setEditando(null);
      await carregar();
    } catch (err) {
      setErroEdicao(err.response?.data?.mensagem || "Erro ao salvar o usuário");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function desativar(id) {
    if (!window.confirm("Desativar este usuário?")) return;
    await api.delete(`/usuarios/${id}`);
    await carregar();
  }

  return (
    <div className="conteudo">
      <div className="topo-pagina">
        <div>
          <h1>Usuários</h1>
          <div className="subtitulo">
            Quem acessa o sistema, escala de trabalho e salário para o ponto
            digital
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-form">
        <h3 style={{ marginBottom: "14px", fontSize: "18px" }}>Novo usuário</h3>

        {erro && <div className="erro-msg">{erro}</div>}

        <div className="campo-form">
          <label>Usuário (login)</label>
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>
        <div className="campo-form">
          <label>Nome completo</label>
          <input
            value={form.nomeCompleto}
            onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })}
          />
        </div>
        <div className="campo-form">
          <label>Senha</label>
          <input
            type="password"
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            required
            minLength={6}
          />
        </div>
        <div className="campo-form">
          <label>Permissão</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="USER">Usuário comum (vendas e relatórios)</option>
            <option value="ADMIN">Administrador (acesso total)</option>
          </select>
        </div>

        <CamposPonto valor={ponto} onChange={setPonto} />

        <button className="btn-primario" type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Criar usuário"}
        </button>
      </form>

      <div className="card-tabela">
        <div className="tabela-wrap">
          <table className="tabela">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Nome</th>
                <th>Permissão</th>
                <th>Ponto (escala)</th>
                <th>Salário</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.nomeCompleto || "—"}</td>
                  <td>{u.role === "ADMIN" ? "Administrador" : "Usuário"}</td>
                  <td>
                    {u.controlaPonto
                      ? `${u.horaEntrada?.slice(0, 5)} – ${u.horaSaida?.slice(0, 5)}`
                      : "—"}
                  </td>
                  <td>{u.controlaPonto ? fmtMoeda(u.salarioMensal) : "—"}</td>
                  <td>{u.ativo ? "Ativo" : "Inativo"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button
                      className="btn-outline"
                      style={{
                        padding: "5px 10px",
                        fontSize: "12px",
                        marginRight: "6px",
                      }}
                      onClick={() => abrirEdicao(u)}
                    >
                      Editar
                    </button>
                    {u.ativo && (
                      <button
                        className="btn-outline"
                        style={{ padding: "5px 10px", fontSize: "12px" }}
                        onClick={() => desativar(u.id)}
                      >
                        Desativar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editando && (
        <div className="modal-overlay" onClick={() => setEditando(null)}>
          <div
            className="modal-card modal-card-medio"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="modal-titulo">Editar {editando.username}</div>
                <div className="modal-subtitulo">
                  Dados, escala de trabalho e salário para o ponto digital
                </div>
              </div>
              <button
                className="modal-fechar"
                onClick={() => setEditando(null)}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={salvarEdicao}
              style={{ display: "flex", flexDirection: "column", minHeight: 0 }}
            >
              <div className="modal-corpo">
                {erroEdicao && <div className="erro-msg">{erroEdicao}</div>}
                <div className="campo-form">
                  <label>Nome completo</label>
                  <input
                    value={editForm.nomeCompleto}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nomeCompleto: e.target.value })
                    }
                  />
                </div>
                <div className="campo-form">
                  <label>Nova senha (deixe em branco para manter)</label>
                  <input
                    type="password"
                    value={editForm.senha}
                    onChange={(e) =>
                      setEditForm({ ...editForm, senha: e.target.value })
                    }
                    minLength={6}
                  />
                </div>
                <CamposPonto valor={editPonto} onChange={setEditPonto} />
              </div>
              <div
                className="modal-footer"
                style={{ justifyContent: "flex-end" }}
              >
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setEditando(null)}
                  disabled={salvandoEdicao}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-header verde"
                  disabled={salvandoEdicao}
                >
                  {salvandoEdicao ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
