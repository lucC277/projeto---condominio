from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr
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