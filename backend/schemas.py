from pydantic import BaseModel
from typing import Optional

class UsuarioBase(BaseModel):
    nome: str
    email: str
    perfil: str

class UsuarioCreate(UsuarioBase):
    senha: str

class UsuarioLogin(BaseModel):
    email: str
    senha: str

class UsuarioResponse(UsuarioBase):
    id: int

    class Config:
        from_attributes = True


class EncomendaBase(BaseModel):
    destinatario: str
    bloco: str
    apartamento: str
    descricao_pacote: str

class EncomendaCreate(EncomendaBase):
    pass

class EncomendaResponse(EncomendaBase):
    id: int
    retirado: bool

    class Config:
        from_attributes = True


class OcorrenciaBase(BaseModel):
    titulo: str
    descricao: str

class OcorrenciaCreate(OcorrenciaBase):
    pass

class OcorrenciaResponse(OcorrenciaBase):
    id: int
    status: str

    class Config:
        from_attributes = True