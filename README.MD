```markdown
# 🏢 SíndicoHub - Sistema de Gestão Condominial

Plataforma SaaS moderna para gestão integrada de condomínios, desenvolvida com arquitetura desacoplada (FastAPI + React + PostgreSQL). O sistema foca no controle e digitalização de fluxo de portaria, gestão de encomendas com baixa em tempo real e autenticação baseada em perfis de acesso.

---

## 🛠️ Tecnologias e Ferramentas

- **Front-end:** React 18, Vite, Lucide Icons, CSS Modular Moderno (SaaS Design System).
- **Back-end:** FastAPI (Python 3.11+ / 3.13), SQLAlchemy ORM, Pydantic v2.
- **Criptografia & Segurança:** Bcrypt (hashing seguro de senhas) e Middleware CORS liberado para o front-end.
- **Banco de Dados:** PostgreSQL 15+ containerizado via Docker.
- **Versionamento:** Git & GitHub Actions.

---

## 📋 Pré-requisitos para Instalação

Antes de começar, certifique-se de ter instalado em sua máquina:
1. **Git:** [Download Git](https://git-scm.com/)
2. **Python 3.11+ ou 3.13:** [Download Python](https://www.python.org/) *(Lembre-se de marcar a opção "Add Python to PATH" durante a instalação)*.
3. **Node.js (v18 ou superior) & npm:** [Download Node.js](https://nodejs.org/)
4. **Docker Desktop:** [Download Docker](https://www.docker.com/) *(Necessário estar em execução)*.

---

## 🚀 Guia Passo a Passo de Instalação e Execução

### 1. Clonar o Repositório
Abra o terminal (PowerShell, Bash ou CMD) e clone o projeto:
```bash
git clone [https://github.com/lucC277/projeto---condominio.git](https://github.com/lucC277/projeto---condominio.git)
cd projeto---condominio

```

---

### 2. Inicializar o Banco de Dados (PostgreSQL via Docker)

Certifique-se de que o Docker Desktop está aberto e rodando. Na pasta raiz do projeto, suba o container:

```bash
docker compose up -d

```

> O banco subirá mapeado na porta padrão `5432` com o banco `condominio_db`.

---

### 3. Configurar e Rodar o Back-end (FastAPI)

Abra um terminal na pasta raiz do projeto:

**No Windows (PowerShell):**

```powershell
# 1. Criar o ambiente virtual
python -m venv venv

# 2. Ativar o ambiente virtual
.\venv\Scripts\Activate.ps1

# 3. Instalar as dependências do back-end
pip install -r backend/requirements.txt
# (Caso não tenha o requirements.txt, instale diretamente):
# pip install fastapi uvicorn sqlalchemy psycopg2-binary bcrypt pydantic[email] python-multipart

# 4. Iniciar o servidor com auto-reload
uvicorn backend.main:app --reload --port 8000

```

**No Linux / macOS (Bash):**

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000

```

* **API local:** `http://localhost:8000`
* **Swagger interativo (OpenAPI):** `http://localhost:8000/docs`

---

### 4. Configurar e Rodar o Front-end (React + Vite)

Abra um **segundo terminal** (mantenha o terminal do back-end em execução):

```bash
# Entrar na pasta do front-end
cd frontend

# Instalar os pacotes necessários
npm install

# Iniciar o servidor de desenvolvimento
npm run dev

```

* **Aplicação Web:** `http://localhost:5173`

---

## 🔑 Credenciais e Usuários de Teste

Todos os usuários de teste foram populados com a senha padrão abaixo:

> **Senha padrão para todos os acessos:** `senhaSegura123`

| Perfil | Nome do Usuário | E-mail de Acesso | Senha | Finalidade de Teste |
| --- | --- | --- | --- | --- |
| **Síndico** | Lucas Mendes | `sindico@sindicohub.com` | `senhaSegura123` | Visão geral, métricas de pacotes e chamados. |
| **Porteiro** | Carlos Portaria | `porteiro@sindicohub.com` | `senhaSegura123` | Entrada de encomendas e conferência de retiradas. |
| **Morador** | Mariana Souza | `mariana@sindicohub.com` | `senhaSegura123` | Consulta de encomendas (Bloco A, Apt 101). |
| **Morador** | Roberto Alves | `roberto@sindicohub.com` | `senhaSegura123` | Consulta de encomendas (Bloco B, Apt 204). |
| **Morador** | Camila Rocha | `camila@sindicohub.com` | `senhaSegura123` | Consulta de encomendas (Bloco A, Apt 302). |

---

## 📦 Estrutura do Projeto

```text
projeto---condominio/
├── backend/
│   ├── database.py       # Conexão com o banco SQLAlchemy
│   ├── models.py         # Mapeamento das tabelas (Usuario, Encomenda, Ocorrencia)
│   ├── schemas.py        # Validação de dados de entrada/saída (Pydantic)
│   ├── security.py       # Funções de hashing e checagem via Bcrypt
│   └── main.py           # Endpoints REST e inicialização da API
├── frontend/
│   ├── src/              # Telas, componentes e integração Axios/Fetch
│   ├── package.json      # Dependências Node.js
│   └── vite.config.js    # Configurações do Vite
├── docker-compose.yml    # Configuração do container PostgreSQL
├── README.md             # Guia de documentação e execução
└── .gitignore            # Arquivos ignorados pelo Git

```

---

## 🧪 Resolução de Problemas Comuns

* **Erro de conexão com o banco (`connection to server at localhost:5432 failed`):** Verifique se o container Docker está rodando executando `docker ps`. Se necessário, reinicie com `docker compose down && docker compose up -d`.
* **Erro de script desabilitado no PowerShell (`Execution_Policies`):** Se der erro ao rodar `Activate.ps1`, execute no PowerShell como Administrador: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.
* **Erro de Módulo (`ModuleNotFoundError: No module named 'backend'`):** Certifique-se de executar o comando `uvicorn backend.main:app` a partir da pasta raiz do projeto e com a virtualenv ativada.

---

## 👥 Autor

Desenvolvido por **Lucas Ricardo** ([@lucC277](https://www.google.com/search?q=https://github.com/lucC277&utm_source=gemini)).
