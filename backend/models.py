from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Text
from backend.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    perfil = Column(String, default="morador")
    criado_em = Column(DateTime, default=datetime.utcnow)

class Encomenda(Base):
    __tablename__ = "encomendas"

    id = Column(Integer, primary_key=True, index=True)
    destinatario = Column(String, nullable=False)
    apartamento = Column(String, nullable=False)
    bloco = Column(String, nullable=False)
    codigo_rastreio = Column(String, nullable=True)
    retirado = Column(Boolean, default=False)
    data_recebimento = Column(DateTime, default=datetime.utcnow)

class Aviso(Base):
    __tablename__ = "avisos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    conteudo = Column(Text, nullable=False)
    tipo = Column(String, default="comunicado", index=True)  # 'comunicado' ou 'norma'
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

class ReservaArea(Base):
    __tablename__ = "reservas_areas"

    id = Column(Integer, primary_key=True, index=True)
    area = Column(String, nullable=False)  # Ex: "Salão de Festas", "Churrasqueira A"
    morador_nome = Column(String, nullable=False)
    apartamento = Column(String, nullable=False)
    bloco = Column(String, nullable=False)
    data_reserva = Column(Date, nullable=False)
    periodo = Column(String, nullable=False)  # "Diurno" ou "Noturno"
    criado_em = Column(DateTime, default=datetime.utcnow)

class Ocorrencia(Base):
    __tablename__ = "ocorrencias"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descricao = Column(Text, nullable=False)
    morador_nome = Column(String, nullable=False)
    apartamento = Column(String, nullable=False)
    bloco = Column(String, nullable=False)
    status = Column(String, default="aberto")  # "aberto", "em_analise", "resolvido"
    data_abertura = Column(DateTime, default=datetime.utcnow)