from pydantic import BaseModel


class UsuarioCreate(BaseModel):
    nome: str
    email: str
    senha: str
    apartamento: str

class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: str
    apartamento: str
    is_sindico: bool

    class Config:
        from_attributes = True

class UsuarioLogin(BaseModel):
    email: str
    senha: str        