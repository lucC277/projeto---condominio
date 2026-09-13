import bcrypt

def gerar_hash_senha(senha: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(senha.encode("utf-8"), salt).decode("utf-8")

def verificar_senha(senha_pura: str, senha_hash: str) -> bool:
    try:
        senha_bytes = senha_pura.encode("utf-8")
        hash_bytes = senha_hash.encode("utf-8") if isinstance(senha_hash, str) else senha_hash
        return bcrypt.checkpw(senha_bytes, hash_bytes)
    except Exception as e:
        print(f"⚠️ Exceção no bcrypt: {e}")
        return False