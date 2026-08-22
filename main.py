from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware  
from sqlalchemy.orm import Session
import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API - Gestão de Condomínio",
    description="Back-end do sistema de gestão condominial",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)    
@app.get("/")
def home():
    return {"mensagem": "API do Condomínio funcionando com sucesso!"}

@app.post("/usuarios", response_model=schemas.UsuarioResponse, status_code=status.HTTP_201_CREATED)
def criar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
       
    usuario_existente = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    novo_usuario = models.Usuario(
        nome=usuario.nome,
        email=usuario.email,
        senha=usuario.senha,
        apartamento=usuario.apartamento
    )
        
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario) 
    
    return novo_usuario

@app.post("/login")
def fazer_login(login_data: schemas.UsuarioLogin, db: Session = Depends(get_db)):
        
    usuario_db = db.query(models.Usuario).filter(models.Usuario.email == login_data.email).first()
        
    if not usuario_db or usuario_db.senha != login_data.senha:
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
        
    return {
        "mensagem": "Login autorizado com sucesso!", 
        "usuario": usuario_db.nome, 
        "is_sindico": usuario_db.is_sindico
    }