from datetime import datetime
from typing import Optional
from pydantic import BaseModel

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