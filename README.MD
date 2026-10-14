```markdown
# 🏢 SíndicoHub - Sistema de Gestão de Condomínio

Plataforma SaaS moderna para gestão integrada de condomínios, desenvolvida com arquitetura desacoplada (**FastAPI + React + PostgreSQL**). O sistema foca no controle e digitalização do fluxo de portaria, gestão de encomendas com baixa em tempo real, governança condominial e autenticação baseada em perfis de acesso.

---

## 📌 Histórico de Entregas e Funcionalidades

### ✅ AC1 - Fundação Arquitetural & Controle de Portaria
- **Infraestrutura em Docker:** Banco de dados relacional PostgreSQL rodando em container.
- **Autenticação Segura:** Hashing unidirecional e checagem criptográfica de senhas via **Bcrypt**.
- **API RESTful com FastAPI:** Endpoints para login (`/login`), gestão de usuários e ciclo de vida de encomendas.
- **Frontend Responsivo:** Dashboard em React (Vite) com visual SaaS limpo, métricas operacionais (KPIs) e registro de baixa imediata de pacotes.

### ✅ AC2 - Convivência, Operação em Tempo Real & Resiliência Técnica
- **📢 Mural Informativo do Condomínio:** Feed de comunicados gerais com priorização de avisos urgentes fixados no topo (`GET /avisos?tipo=comunicado`).
- **📜 Regimento & Normas de Convivência:** Consulta rápida e categorizada das regras internas (silêncio, horários de obras, circulação de pets) (`GET /avisos?tipo=norma`).
- **🟢 Escala de Plantão da Portaria:** Indicador em tempo real exibido no cabeçalho informando o funcionário em turno e ramal de emergência ativo (`GET /plantao`).
- **🔧 Tratamento Global de Exceções:** Handlers centralizados na API interceptando códigos HTTP (`400`, `401`, `404`, `422` e `500`), garantindo retornos JSON amigáveis sem exposição de tracebacks do servidor.
- **Navegação Moderna em Abas:** Interface redesenhada com alternância instantânea entre Encomendas, Mural e Regimento.

---

## 🛠️ Tecnologias e Ferramentas

- **Front-end:** React 18, Vite, CSS Moderno com navegação por abas.
- **Back-end:** FastAPI (Python 3.11+ / 3.13), SQLAlchemy ORM, Pydantic v2.
- **Criptografia & Segurança:** Bcrypt (hashing de senhas) e Middleware CORS integrado.
- **Banco de Dados:** PostgreSQL 15+ containerizado via Docker.
- **Versionamento & Gestão:** Git, GitHub Actions e Trello (Kanban Ágil).

---

## 📋 Pré-requisitos para Instalação

Antes de começar, certifique-se de ter instalado em sua máquina:

1. **Git:** [Download Git](https://git-scm.com/)
2. **Python 3.11+ ou 3.13:** [Download Python](https://www.python.org/) *(Marque a opção "Add Python to PATH" durante a instalação)*.
3. **Node.js (v18 ou superior) & npm:** [Download Node.js](https://nodejs.org/)
4. **Docker Desktop:** [Download Docker](https://www.docker.com/) *(Necessário estar em execução)*.

---

## 🚀 Guia Passo a Passo de Execução

### 1. Clonar o Repositório

```bash
git clone [https://github.com/lucC277/projeto---condominio.git](https://github.com/lucC277/projeto---condominio.git)
cd projeto---condominio

```

---

### 2. Inicializar o Banco de Dados (PostgreSQL via Docker)

Com o Docker Desktop em execução, inicie o container:

```bash
docker compose up -d
# Caso utilize o arquivo dentro da pasta backend:
# docker compose -f backend/docker-compose.yml up -d

```

> O banco subirá mapeado na porta `5432` com a database `condominio_db`.

---

### 3. Configurar e Rodar o Back-end (FastAPI)

Abra um terminal na pasta raiz do projeto:

**No Windows (PowerShell):**

```powershell
# 1. Criar o ambiente virtual (caso ainda não exista)
python -m venv venv

# 2. Ativar o ambiente virtual
.\venv\Scripts\Activate.ps1

# 3. Instalar as dependências
pip install fastapi uvicorn sqlalchemy psycopg2-binary bcrypt email-validator

# 4. Criar as tabelas no banco de dados
python -c "from backend.database import engine; from backend import models; models.Base.metadata.create_all(bind=engine); print('Tabelas sincronizadas!')"

# 5. Iniciar o servidor
uvicorn backend.main:app --reload --port 8000

```

**No Linux / macOS (Bash):**

```bash
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary bcrypt email-validator
python3 -c "from backend.database import engine; from backend import models; models.Base.metadata.create_all(bind=engine); print('Tabelas sincronizadas!')"
uvicorn backend.main:app --reload --port 8000

```

* **API Local:** `http://localhost:8000`
* **Swagger Interativo (OpenAPI):** `http://localhost:8000/docs`

---

### 4. Popular os Dados de Teste da AC2 (Seeds)

Com o banco e o ambiente virtual ativos, execute o comando abaixo para inserir os comunicados, normas e o plantão da portaria:

```powershell
python -c "from backend.database import SessionLocal; from backend.models import Aviso, EscalaPlantao; db = SessionLocal(); db.add_all([Aviso(titulo='Manutenção Preventiva dos Elevadores', conteudo='No dia 18/09, das 09h às 12h, os elevadores do Bloco A passarão por revisão periódica.', tipo='comunicado', fixado=True), Aviso(titulo='Assembleia Geral Ordinária', conteudo='Convocação de todos os condôminos para a AGO na próxima quinta-feira às 19h30 no Salão de Festas.', tipo='comunicado', fixado=False), Aviso(titulo='Horário de Silêncio e Obras', conteudo='Silêncio rigoroso das 22h às 08h. Obras e reformas autorizadas de seg a sex (08h às 17h) e sáb (09h às 13h). Proibido aos domingos e feriados.', tipo='norma', fixado=True), Aviso(titulo='Regras para Animais Domésticos', conteudo='Animais de médio e grande porte devem circular pelas áreas comuns sempre com guia curta e focinheira nos elevadores de serviço.', tipo='norma', fixado=False), EscalaPlantao(funcionario_nome='Carlos Portaria', cargo='Porteiro Líder', turno='Diurno (07:00 - 19:00)', telefone_contato='Ramal 100 / (11) 98888-0001', em_servico=True)]); db.commit(); print('>>> DADOS DA AC2 POVOADOS COM SUCESSO! <<<')"

```

---

### 5. Configurar e Rodar o Front-end (React + Vite)

Abra um **segundo terminal** (mantendo o do back-end ativo):

```bash
cd frontend
npm install
npm run dev

```

* **Aplicação Web:** `http://localhost:5173`

---

## 🔑 Credenciais e Usuários de Teste

> **Senha padrão para todos os acessos:** `senhaSegura123`

| Perfil | Nome do Usuário | E-mail de Acesso | Senha | Finalidade de Teste |
| --- | --- | --- | --- | --- |
| **Síndico** | Lucas Mendes | `sindico@sindicohub.com` | `senhaSegura123` | Acesso completo, gestão de pacotes e avisos. |
| **Porteiro** | Carlos Portaria | `porteiro@sindicohub.com` | `senhaSegura123` | Entrada de encomendas, baixas e checagem de plantão. |
| **Morador** | Mariana Souza | `mariana@sindicohub.com` | `senhaSegura123` | Consulta de encomendas (Bloco A, Apt 101). |
| **Morador** | Roberto Alves | `roberto@sindicohub.com` | `senhaSegura123` | Consulta de encomendas (Bloco B, Apt 204). |
| **Morador** | Camila Rocha | `camila@sindicohub.com` | `senhaSegura123` | Consulta de encomendas (Bloco A, Apt 302). |

---

## 📦 Estrutura do Projeto

```text
projeto---condominio/
├── backend/
│   ├── database.py       # Conexão SQLAlchemy e SessionLocal
│   ├── models.py         # Modelos ORM (Usuario, Encomenda, Aviso, EscalaPlantao)
│   ├── schemas.py        # Schemas Pydantic com validação de dados
│   ├── security.py       # Funções de hashing e verificação via Bcrypt
│   └── main.py           # Endpoints REST e Middleware de Exceções Globais
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Aplicação React integrada (Dashboard em abas)
│   │   └── main.jsx      # Ponto de montagem React
│   ├── package.json      # Dependências do frontend
│   └── vite.config.js    # Configurações do Vite
├── docker-compose.yml    # Orquestração do container PostgreSQL
├── README.md             # Documentação técnica completa
└── .gitignore            # Arquivos ignorados pelo Git

```

---

## 🧪 Resolução de Problemas Comuns

* **`UndefinedTable: relation "avisos" does not exist`:** Execute a criação de metadados com `python -c "from backend.database import engine; from backend import models; models.Base.metadata.create_all(bind=engine)"`.
* **`ModuleNotFoundError: No module named 'email_validator'`:** Execute `pip install email-validator` no ambiente virtual ativado.
* **Falha de conexão com o banco (`connection to server at localhost:5432 failed`):** Verifique se o container está ativo executando `docker ps`. Se necessário, reinicie o Docker Compose.

---

## 👥 Autor

Desenvolvido por **Lucas Ricardo Da Silva**

GitHub: [@lucC277](https://www.google.com/search?q=https://github.com/lucC277)

```

```