from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel

# --- USUÁRIOS & AUTENTICAÇÃO ---
class UsuarioBase(BaseModel):
    nome: str
    email: str
    perfil: str

class UsuarioCreate(UsuarioBase):
    senha: str

class UsuarioResponse(UsuarioBase):
    id: int

    class Config:
        from_attributes = True

class UsuarioLogin(BaseModel):
    email: str
    senha: str

# --- ENCOMENDAS ---
class EncomendaBase(BaseModel):
    destinatario: str
    apartamento: str
    bloco: str
    codigo_rastreio: Optional[str] = None
    retirado: bool = False

class EncomendaCreate(EncomendaBase):
    pass

class EncomendaResponse(EncomendaBase):
    id: int
    data_recebimento: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- AVISOS & REGRAS ---
class AvisoBase(BaseModel):
    titulo: str
    conteudo: str
    tipo: str = "comunicado"
    fixado: bool = False

class AvisoCreate(AvisoBase):
    pass

class AvisoResponse(AvisoBase):
    id: int
    data_publicacao: datetime

    class Config:
        from_attributes = True

# --- ESCALA DE PLANTÃO ---
class EscalaPlantaoBase(BaseModel):
    funcionario_nome: str
    cargo: str
    turno: str
    telefone_contato: Optional[str] = None
    em_servico: bool = True

class EscalaPlantaoCreate(EscalaPlantaoBase):
    pass

class EscalaPlantaoResponse(EscalaPlantaoBase):
    id: int

    class Config:
        from_attributes = True

# --- RESERVAS (AC3) ---
class ReservaAreaBase(BaseModel):
    area: str
    morador_nome: str
    apartamento: str
    bloco: str
    data_reserva: date
    periodo: str

class ReservaAreaCreate(ReservaAreaBase):
    pass

class ReservaAreaResponse(ReservaAreaBase):
    id: int
    criado_em: datetime

    class Config:
        from_attributes = True

# --- OCORRÊNCIAS (AC3) ---
class OcorrenciaBase(BaseModel):
    titulo: str
    descricao: str
    morador_nome: str
    apartamento: str
    bloco: str

class OcorrenciaCreate(OcorrenciaBase):
    pass

class OcorrenciaUpdateStatus(BaseModel):
    status: str

class OcorrenciaResponse(OcorrenciaBase):
    id: int
    status: str
    data_abertura: datetime

    class Config:
        from_attributes = True