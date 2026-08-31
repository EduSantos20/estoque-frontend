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
- Cadastro de usuários (somente Administrador)

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

`{categoria}` aceita: `CAMPO`, `FUTSAL` ou `SOCIETY`.
