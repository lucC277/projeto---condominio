from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend import models, schemas, security
from backend.database import engine, get_db

models.Base.metadata.create_all(bind=engine)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API Gestão de Condomínio",
    description="Back-end seguro com PostgreSQL e Bcrypt",
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
def health_check():
    return {"status": "ok", "mensagem": "API Condomínio operacional"}

@app.post("/usuarios", response_model=schemas.UsuarioResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    usuario_existente = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

    hash_da_senha = security.gerar_hash_senha(usuario.senha)
    novo_usuario = models.Usuario(
        nome=usuario.nome,
        email=usuario.email,
        senha_hash=hash_da_senha,
        perfil=usuario.perfil,
        bloco=usuario.bloco,
        apartamento=usuario.apartamento
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario

@app.post("/login")
def login(dados: schemas.UsuarioLogin, db: Session = Depends(get_db)):
    print(f"\n--- TENTATIVA DE LOGIN ---")
    print(f"Buscando e-mail: '{dados.email.strip()}'")
    
    usuario = db.query(models.Usuario).filter(
        models.Usuario.email.ilike(dados.email.strip())
    ).first()

    if not usuario:
        print("❌ Usuário NÃO encontrado no banco de dados!")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos."
        )

    print(f"✅ Usuário encontrado: {usuario.nome} (ID: {usuario.id})")
    print(f"Hash armazenado no banco: {usuario.senha_hash[:15]}...")
   
    senha_valida = security.verificar_senha(dados.senha, usuario.senha_hash)
    print(f"Resultado da validação da senha: {senha_valida}")

    if not senha_valida:
        print("❌ Senha incorreta segundo o bcrypt!")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos."
        )

    print("🎉 LOGIN BEM-SUCEDIDO!\n")
    return {
        "status": "sucesso",
        "usuario": {
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email,
            "perfil": usuario.perfil
        }
    }

@app.post("/encomendas", response_model=schemas.EncomendaResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_encomenda(encomenda: schemas.EncomendaCreate, db: Session = Depends(get_db)):
    nova_enc = models.Encomenda(
        destinatario=encomenda.destinatario,
        bloco=encomenda.bloco,
        apartamento=encomenda.apartamento,
        descricao_pacote=encomenda.descricao_pacote,
        horario_retirada_limite=encomenda.horario_retirada_limite
    )
    db.add(nova_enc)
    db.commit()
    db.refresh(nova_enc)
    return nova_enc

@app.get("/encomendas", response_model=list[schemas.EncomendaResponse])
def listar_encomendas(db: Session = Depends(get_db)):
    return db.query(models.Encomenda).all()

@app.patch("/encomendas/{encomenda_id}/retirar", response_model=schemas.EncomendaResponse)
def dar_baixa_encomenda(encomenda_id: int, db: Session = Depends(get_db)):
    enc = db.query(models.Encomenda).filter(models.Encomenda.id == encomenda_id).first()
    if not enc:
        raise HTTPException(status_code=404, detail="Encomenda não encontrada.")
    enc.retirado = True
    db.commit()
    db.refresh(enc)
    return enc

@app.post("/ocorrencias", response_model=schemas.OcorrenciaResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_ocorrencia(ocorrencia: schemas.OcorrenciaCreate, db: Session = Depends(get_db)):
    nova_oc = models.Ocorrencia(
        titulo=ocorrencia.titulo,
        descricao=ocorrencia.descricao
    )
    db.add(nova_oc)
    db.commit()
    db.refresh(nova_oc)
    return nova_oc

@app.get("/ocorrencias", response_model=list[schemas.OcorrenciaResponse])
def listar_ocorrencias(db: Session = Depends(get_db)):
    return db.query(models.Ocorrencia).all()