# Estoque de Chuteiras

Sistema de controle de estoque para loja de chuteiras, com tamanhos fixos de 34 a 43.

Stack: **Java + Spring Boot** (backend) · **React + Vite** (frontend) · **PostgreSQL** (banco de dados)

---

## Funcionalidades

- Login com dois níveis de permissão: **Administrador** e **Usuário comum**
- **3 grades de estoque independentes**: Campo, Futsal e Society — cada uma com seus próprios tamanhos (34 a 43), sem misturar quantidades
- Para cada tamanho, dentro de cada categoria:
  - **Estoque** (com botões +/- — somente Administrador)
  - **Vendas da semana** (registrar venda — qualquer usuário logado, diminui do estoque)
  - **A caminho** (compras já feitas ao fornecedor, aguardando chegar)
  - **Meta** fixa (padrão 10 pares, editável apenas por Administrador)
  - **Compra sugerida da semana**, calculada automaticamente: `Meta - Estoque - A caminho`
- **Fazer Pedido** ("Mover p/ Correios"): abre um modal com a compra sugerida de cada tamanho; o Administrador informa a quantidade que *realmente* encomendou com o fornecedor (pode ser diferente da sugestão) e confirma — isso é o que entra em "A caminho"
- **Receber Correios**: abre um modal só com os tamanhos que têm alguma quantidade "a caminho"; o Administrador confirma quanto *realmente chegou* (pode ser menos que o pedido) — evita erro de receber mais do que foi comprado
- Relatórios semanais: fecha a semana para as 3 categorias de uma vez (zera as vendas), salva no histórico com a categoria de cada linha, e permite impressão
- Cadastro de usuários (somente Administrador), com escala de trabalho e salário para o ponto digital
- **Ponto digital**: o funcionário bate entrada/saída pelo botão "Bater ponto" (horário sempre do servidor, fuso de Brasília). Veja a seção "Ponto digital" abaixo
- **Histórico de vendas**: cada venda registrada fica salva permanentemente com data, hora, categoria, tamanho e o usuário que vendeu (visível apenas para Administrador, tela "Histórico de Vendas")
- **Cancelamento de venda (estorno)**: na tela de Histórico de Vendas, o Administrador pode cancelar uma venda — a quantidade volta ao estoque e é descontada das vendas da semana. O registro não é apagado: fica marcado como cancelado, guardando quem cancelou, quando e o motivo

---

## Pré-requisitos

- **Java 17+** e **Maven** (ou use o `mvnw` se preferir configurar um wrapper)
- **Node.js 18+** e npm
- **PostgreSQL 14+** rodando localmente (ou em container Docker)

---

## 1. Configurar o banco de dados

Crie o banco no PostgreSQL:

```sql
CREATE DATABASE estoque_chuteiras;
```

O Hibernate cria as tabelas automaticamente na primeira execução (`ddl-auto=update`).
Se preferir criar manualmente, use o script em `database/schema.sql`.

---

## 2. Rodar o backend

Edite `backend/src/main/resources/application.properties` se seu usuário/senha do
PostgreSQL forem diferentes de `postgres`/`postgres`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/estoque_chuteiras
spring.datasource.username=postgres
spring.datasource.password=postgres
```

**Importante:** troque `app.jwt.secret` por um valor único antes de colocar em produção.

Depois:

```bash
cd backend
mvn spring-boot:run
```

A API sobe em `http://localhost:8080`.

Na primeira execução, o sistema cria automaticamente:
- As 10 linhas de tamanho (34 a 43), com meta padrão 10 e tudo zerado
- Um usuário administrador: **usuário `admin`, senha `admin123`** — troque essa senha assim que possível (crie um novo admin pela tela de Usuários e desative o padrão, ou implemente uma tela de troca de senha)

---

## 3. Rodar o frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173` e já está configurado para conversar com a
API em `http://localhost:8080` (veja `src/api/api.js` caso precise mudar o endereço).

---

## Estrutura do projeto

```
chuteiras-estoque/
├── backend/                 # API Spring Boot
│   └── src/main/java/com/loja/estoque/
│       ├── model/            # Entidades JPA
│       ├── repository/       # Repositórios Spring Data
│       ├── service/          # Regras de negócio
│       ├── controller/       # Endpoints REST
│       ├── dto/               # Objetos de requisição/resposta
│       ├── security/          # JWT e autenticação
│       ├── config/            # Segurança, CORS, seed inicial
│       └── exception/         # Tratamento de erros
├── frontend/                # App React + Vite
│   └── src/
│       ├── pages/              # Login, Estoque, Relatórios, Usuários
│       ├── components/         # Navbar (topbar) e rota protegida
│       ├── context/            # Autenticação
│       └── api/                # Cliente axios com token JWT
└── database/
    └── schema.sql            # Script de referência do banco
```

---

## Regras de permissão (resumo)

| Ação                              | Administrador | Usuário comum |
|-----------------------------------|:--------------:|:--------------:|
| Login                              | ✅             | ✅             |
| Registrar venda                    | ✅             | ✅             |
| Ver estoque e relatórios           | ✅             | ✅             |
| Ajustar estoque (+/-)              | ✅             | ❌             |
| Ajustar "a caminho" / receber      | ✅             | ❌             |
| Alterar meta                       | ✅             | ❌             |
| Cadastrar/desativar usuários       | ✅             | ❌             |
| Fechar semana (relatório)          | ✅             | ✅             |

Se quiser restringir também o fechamento de semana só ao Administrador, adicione
`@PreAuthorize("hasRole('ADMIN')")` no método `fecharSemana` de
`RelatorioController.java`.

---

## Principais endpoints da API

| Método | Rota                                          | Descrição                                        | Acesso |
|--------|------------------------------------------------|---------------------------------------------------|--------|
| POST   | `/api/auth/login`                               | Login, retorna token JWT                          | Público |
| GET    | `/api/estoque/categorias`                       | Lista as categorias fixas (CAMPO, FUTSAL, SOCIETY) | Autenticado |
| GET    | `/api/estoque/{categoria}`                      | Lista os 10 tamanhos daquela categoria             | Autenticado |
| POST   | `/api/estoque/{categoria}/{tamanho}/venda`      | Registra venda (diminui estoque)                   | Autenticado |
| POST   | `/api/estoque/{categoria}/{tamanho}/estoque`    | Ajusta estoque (+/-)                               | Admin |
| POST   | `/api/estoque/{categoria}/{tamanho}/a-caminho`  | Ajusta "a caminho" (+/-) — usado pelo "Fazer Pedido" | Admin |
| POST   | `/api/estoque/{categoria}/{tamanho}/receber`    | Recebe encomenda (a caminho → estoque)             | Admin |
| PUT    | `/api/estoque/{categoria}/{tamanho}/meta`       | Altera a meta do tamanho                           | Admin |
| GET    | `/api/relatorios`                               | Histórico de relatórios semanais                   | Autenticado |
| GET    | `/api/relatorios/{id}`                          | Detalhe de um relatório (com categoria por linha)  | Autenticado |
| POST   | `/api/relatorios/fechar-semana`                 | Fecha a semana para as 3 categorias e zera vendas  | Autenticado |
| GET    | `/api/usuarios`                                 | Lista usuários                                     | Admin |
| POST   | `/api/usuarios`                                 | Cria usuário                                       | Admin |
| DELETE | `/api/usuarios/{id}`                            | Desativa usuário                                   | Admin |
| GET    | `/api/vendas`                                   | Histórico de vendas (quem vendeu o quê e quando)   | Admin |
| GET    | `/api/vendas?categoria=CAMPO`                   | Histórico filtrado por categoria                   | Admin |
| POST   | `/api/vendas/{id}/cancelar`                     | Cancela a venda e devolve a quantidade ao estoque  | Admin |

`{categoria}` aceita: `CAMPO`, `FUTSAL` ou `SOCIETY`.


---

## Ponto digital

**Configuração (Administrador):** na tela *Usuários*, crie ou edite um usuário e marque **"Bate ponto na loja"**. Defina entrada, saída, tolerância (padrão 10 min), intervalo/almoço, dias de trabalho, salário mensal e a data de início do controle (dias anteriores não geram falta).

**Funcionário:** botão **Bater ponto** no topo (alterna entrada/saída automaticamente) e tela **Meu Ponto** com o espelho do mês: batidas, horas trabalhadas, atrasos, extras, faltas e pontualidade. O funcionário não vê valores em dinheiro.

**Administrador:** tela **Controle de Ponto**
- *Registro do dia*: quem bateu, quem não bateu, atrasados e folgas.
- *Folha do mês*: faltas, atrasos, horas faltantes, desconto e valor a pagar de cada funcionário (com impressão).
- *Espelho / ajustes*: clique numa batida para corrigir o horário ou removê-la, ou use **+ Batida** para lançar uma que faltou. Toda alteração exige justificativa e guarda quem alterou, quando e o horário original. Batidas removidas não são apagadas do banco.

**Regras de cálculo**
- Batidas do dia alternam entrada/saída; horas trabalhadas = soma dos pares entrada→saída.
- Se o dia tem só 2 batidas e a escala tem intervalo, o intervalo é descontado automaticamente.
- **Atraso**: primeira entrada depois do horário da escala + tolerância (conta o atraso inteiro).
- **Faltantes/extras**: só contam em dias encerrados e acima da tolerância. Dia escalado sem batida = **falta** (jornada inteira).
- Dia com entrada sem saída = **incompleto**: não gera desconto até o administrador ajustar (a tela avisa).
- **Desconto** = horas faltantes × valor da hora, onde valor da hora = salário ÷ (dias de escala no mês × horas da jornada).
- Horas extras são apenas informadas (não somadas ao pagamento). É uma estimativa: não considera DSR, encargos nem benefícios.
- Proteção contra clique duplo: não aceita nova batida em menos de 1 minuto.
- Limitação: turnos que passam da meia-noite ainda não são suportados.

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET  | `/api/ponto/status` | Próxima batida e batidas de hoje | Autenticado |
| POST | `/api/ponto/bater` | Registra a batida do usuário logado | Habilitado |
| GET  | `/api/ponto/meu?mes=AAAA-MM` | Espelho do próprio usuário (sem valores) | Habilitado |
| GET  | `/api/ponto/admin/dia?data=AAAA-MM-DD` | Registro geral do dia | Admin |
| GET  | `/api/ponto/admin/mes?mes=AAAA-MM` | Folha do mês de todos | Admin |
| GET  | `/api/ponto/admin/usuarios/{id}?mes=` | Espelho de um funcionário, com folha | Admin |
| POST | `/api/ponto/admin/usuarios/{id}/batidas` | Lança batida (com justificativa) | Admin |
| PUT  | `/api/ponto/admin/batidas/{id}` | Ajusta o horário de uma batida | Admin |
| POST | `/api/ponto/admin/batidas/{id}/remover` | Remove uma batida (com justificativa) | Admin |
| PUT  | `/api/usuarios/{id}` | Edita usuário, escala e salário | Admin |
