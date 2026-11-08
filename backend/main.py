from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session

from backend import models, schemas, security
from backend.database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SíndicoHub - API Integrada",
    description="SaaS de gestão integrada de condomínios residenciais",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- TRATAMENTO GLOBAL DE EXCEÇÕES ---
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "erro_validacao",
            "mensagem": "Parâmetros inválidos enviados na requisição.",
            "detalhes": exc.errors()
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "erro", "mensagem": exc.detail}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"status": "erro_interno", "mensagem": "Erro interno no servidor."}
    )

# --- ROTAS BASE ---
@app.get("/")
def raiz():
    return {"mensagem": "API SíndicoHub Operacional", "versao": "3.0.0"}

# 1. Autenticação
@app.post("/login")
def login(dados: schemas.UsuarioLogin, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.email == dados.email).first()
    if not usuario or not security.verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou senha incorretos.")

    return {
        "access_token": f"token_sessao_{usuario.id}",
        "token_type": "bearer",
        "usuario": {
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email,
            "perfil": usuario.perfil
        }
    }

# 2. Encomendas
@app.get("/encomendas", response_model=List[schemas.EncomendaResponse])
def listar_encomendas(db: Session = Depends(get_db)):
    return db.query(models.Encomenda).order_by(models.Encomenda.id.desc()).all()

@app.post("/encomendas", response_model=schemas.EncomendaResponse, status_code=status.HTTP_201_CREATED)
def criar_encomenda(dados: schemas.EncomendaCreate, db: Session = Depends(get_db)):
    nova = models.Encomenda(**dados.model_dump())
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova

@app.put("/encomendas/{encomenda_id}/retirar")
def dar_baixa_encomenda(encomenda_id: int, db: Session = Depends(get_db)):
    encomenda = db.query(models.Encomenda).filter(models.Encomenda.id == encomenda_id).first()
    if not encomenda:
        raise HTTPException(status_code=404, detail="Encomenda não encontrada.")
    encomenda.retirado = True
    db.commit()
    return {"mensagem": "Encomenda marcada como retirada com sucesso."}

# 3. Mural Informativo & Regimento
@app.get("/avisos", response_model=List[schemas.AvisoResponse])
def listar_avisos(tipo: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Aviso)
    if tipo:
        query = query.filter(models.Aviso.tipo == tipo)
    return query.order_by(models.Aviso.fixado.desc(), models.Aviso.data_publicacao.desc()).all()

@app.post("/avisos", response_model=schemas.AvisoResponse, status_code=status.HTTP_201_CREATED)
def criar_aviso(dados: schemas.AvisoCreate, db: Session = Depends(get_db)):
    novo = models.Aviso(**dados.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

# 4. Escala de Plantão
@app.get("/plantao", response_model=List[schemas.EscalaPlantaoResponse])
def listar_plantoes(somente_ativos: bool = True, db: Session = Depends(get_db)):
    query = db.query(models.EscalaPlantao)
    if somente_ativos:
        query = query.filter(models.EscalaPlantao.em_servico == True)
    return query.all()

@app.post("/plantao", response_model=schemas.EscalaPlantaoResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_plantao(dados: schemas.EscalaPlantaoCreate, db: Session = Depends(get_db)):
    novo = models.EscalaPlantao(**dados.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo

# 5. Motor Anti-Conflito de Reservas (AC3)
@app.get("/reservas", response_model=List[schemas.ReservaAreaResponse])
def listar_reservas(db: Session = Depends(get_db)):
    return db.query(models.ReservaArea).order_by(models.ReservaArea.data_reserva.asc()).all()

@app.post("/reservas", response_model=schemas.ReservaAreaResponse, status_code=status.HTTP_201_CREATED)
def criar_reserva(dados: schemas.ReservaAreaCreate, db: Session = Depends(get_db)):
    conflito = db.query(models.ReservaArea).filter(
        models.ReservaArea.area == dados.area,
        models.ReservaArea.data_reserva == dados.data_reserva,
        models.ReservaArea.periodo == dados.periodo
    ).first()

    if conflito:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A área '{dados.area}' já está reservada para o dia {dados.data_reserva} no período {dados.periodo}."
        )

    nova_reserva = models.ReservaArea(**dados.model_dump())
    db.add(nova_reserva)
    db.commit()
    db.refresh(nova_reserva)
    return nova_reserva

# 6. Ocorrências e Chamados (AC3)
@app.get("/ocorrencias", response_model=List[schemas.OcorrenciaResponse])
def listar_ocorrencias(db: Session = Depends(get_db)):
    return db.query(models.Ocorrencia).order_by(models.Ocorrencia.id.desc()).all()

@app.post("/ocorrencias", response_model=schemas.OcorrenciaResponse, status_code=status.HTTP_201_CREATED)
def registrar_ocorrencia(dados: schemas.OcorrenciaCreate, db: Session = Depends(get_db)):
    nova = models.Ocorrencia(**dados.model_dump())
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova

@app.put("/ocorrencias/{ocorrencia_id}/status")
def atualizar_status_ocorrencia(ocorrencia_id: int, dados: schemas.OcorrenciaUpdateStatus, db: Session = Depends(get_db)):
    ocorrencia = db.query(models.Ocorrencia).filter(models.Ocorrencia.id == ocorrencia_id).first()
    if not ocorrencia:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada.")
    ocorrencia.status = dados.status
    db.commit()
    return {"mensagem": "Status da ocorrência atualizado com sucesso."}