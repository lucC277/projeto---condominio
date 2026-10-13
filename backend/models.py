from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime
from backend.database import Base


class Aviso(Base):
    __tablename__ = "avisos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    conteudo = Column(Text, nullable=False)
    tipo = Column(String, default="comunicado", index=True)
    fixado = Column(Boolean, default=False)
    data_publicacao = Column(DateTime, default=datetime.utcnow)

class EscalaPlantao(Base):
    __tablename__ = "escalas_plantao"

    id = Column(Integer, primary_key=True, index=True)
    funcionario_nome = Column(String, nullable=False)
    cargo = Column(String, default="Porteiro")
    turno = Column(String, nullable=False)
    telefone_contato = Column(String, nullable=True)
    em_servico = Column(Boolean, default=True)

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    perfil = Column(String(20), nullable=False) 
    bloco = Column(String(10), nullable=True)
    apartamento = Column(String(10), nullable=True)

class Encomenda(Base):
    __tablename__ = "encomendas"

    id = Column(Integer, primary_key=True, index=True)
    destinatario = Column(String(100), nullable=False)
    bloco = Column(String(10), nullable=False)
    apartamento = Column(String(10), nullable=False)
    descricao_pacote = Column(String(200), nullable=False)
    horario_retirada_limite = Column(String(50), nullable=True)
    retirado = Column(Boolean, default=False)
    data_registro = Column(DateTime, default=datetime.utcnow)

class Ocorrencia(Base):
    __tablename__ = "ocorrencias"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(100), nullable=False)
    descricao = Column(Text, nullable=False)
    status = Column(String(50), default="Pendente")