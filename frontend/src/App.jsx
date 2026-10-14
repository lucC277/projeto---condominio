import React, { useState, useEffect } from 'react';

export default function App() {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');

  const [encomendas, setEncomendas] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [normas, setNormas] = useState([]);
  const [plantoes, setPlantoes] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('encomendas');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErroLogin('');
    setCarregando(true);

    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'E-mail ou senha incorretos.');
      }

      setToken(data.access_token || 'token_sessao_ativa');
      setUsuario(data.usuario || { nome: 'Lucas Ricardo', perfil: 'sindico', email });
    } catch (err) {
      setErroLogin(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const carregarDados = () => {
    fetch('http://localhost:8000/encomendas')
      .then((res) => res.json())
      .then((data) => setEncomendas(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Erro ao carregar encomendas:', err));

    fetch('http://localhost:8000/avisos?tipo=comunicado')
      .then((res) => res.json())
      .then((data) => setAvisos(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Erro ao carregar avisos:', err));

    fetch('http://localhost:8000/avisos?tipo=norma')
      .then((res) => res.json())
      .then((data) => setNormas(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Erro ao carregar normas:', err));

    fetch('http://localhost:8000/plantao')
      .then((res) => res.json())
      .then((data) => setPlantoes(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Erro ao carregar escala de plantão:', err));
  };

  useEffect(() => {
    if (token) {
      carregarDados();
    }
  }, [token]);

  const handleBaixaEncomenda = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/encomendas/${id}/retirar`, {
        method: 'PUT'
      });

      if (response.ok) {
        setEncomendas((prev) =>
          prev.map((enc) => (enc.id === id ? { ...enc, retirado: true } : enc))
        );
      }
    } catch (err) {
      console.error('Erro ao dar baixa:', err);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUsuario(null);
    setEmail('');
    setSenha('');
  };

  const encomendasFiltradas = encomendas.filter((enc) =>
    enc.destinatario.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    enc.apartamento.includes(filtroTexto) ||
    enc.bloco.toLowerCase().includes(filtroTexto.toLowerCase())
  );

  const plantaoAtual = plantoes.length > 0 ? plantoes[0] : null;

  if (!token) {
    return (
      <div style={styles.loginWrapper}>
        <div style={styles.loginBox}>
          <div style={styles.brandIconLarge}>🏢</div>
          <h2 style={styles.titleLogin}>SíndicoHub</h2>
          <p style={styles.subLogin}>Gestão Condominial Descomplicada</p>

          {erroLogin && <div style={styles.erroBox}>{erroLogin}</div>}

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>E-mail</label>
              <input
                type="email"
                required
                placeholder="sindico@sindicohub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Senha</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={carregando} style={styles.btnPrimary}>
              {carregando ? 'Autenticando...' : 'Entrar na Plataforma'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.navbar}>
        <div style={styles.navBrand}>
          <span style={styles.logoMark}>🏢</span>
          <div>
            <h1 style={styles.brandText}>SíndicoHub</h1>
            <span style={styles.tagline}>Portal Operacional</span>
          </div>
        </div>

        <div style={styles.navRight}>
          {plantaoAtual && (
            <div style={styles.plantaoPill}>
              <span style={styles.pulsingDot}>●</span>
              <span>
                <strong>Portaria:</strong> {plantaoAtual.funcionario_nome} ({plantaoAtual.turno})
              </span>
            </div>
          )}

          <div style={styles.userProfile}>
            <div style={styles.avatar}>
              {usuario?.nome ? usuario.nome.charAt(0) : 'U'}
            </div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{usuario?.nome}</span>
              <span style={styles.userRole}>{usuario?.perfil}</span>
            </div>
            <button onClick={handleLogout} style={styles.btnLogout}>Sair</button>
          </div>
        </div>
      </header>

      <main style={styles.content}>
        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Total de Encomendas</span>
            <span style={styles.metricNumber}>{encomendas.length}</span>
          </div>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Aguardando Retirada</span>
            <span style={{ ...styles.metricNumber, color: '#e07a5f' }}>
              {encomendas.filter((e) => !e.retirado).length}
            </span>
          </div>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Avisos Ativos</span>
            <span style={{ ...styles.metricNumber, color: '#3d5a80' }}>
              {avisos.length}
            </span>
          </div>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Normas Cadastradas</span>
            <span style={{ ...styles.metricNumber, color: '#2a9d8f' }}>
              {normas.length}
            </span>
          </div>
        </div>

        <div style={styles.tabsNav}>
          <button
            onClick={() => setAbaAtiva('encomendas')}
            style={abaAtiva === 'encomendas' ? styles.tabActive : styles.tabInactive}
          >
            📦 Controle de Encomendas
          </button>
          <button
            onClick={() => setAbaAtiva('mural')}
            style={abaAtiva === 'mural' ? styles.tabActive : styles.tabInactive}
          >
            📢 Mural de Avisos ({avisos.length})
          </button>
          <button
            onClick={() => setAbaAtiva('normas')}
            style={abaAtiva === 'normas' ? styles.tabActive : styles.tabInactive}
          >
            📜 Regimento & Normas ({normas.length})
          </button>
        </div>

        <div style={styles.panelCard}>
          {abaAtiva === 'encomendas' && (
            <div>
              <div style={styles.panelControls}>
                <input
                  type="text"
                  placeholder="Pesquisar morador, bloco ou apartamento..."
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  style={styles.searchBar}
                />
                <button onClick={carregarDados} style={styles.btnSecondary}>
                  Atualizar Dados
                </button>
              </div>

              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Destinatário</th>
                      <th style={styles.th}>Apartamento / Bloco</th>
                      <th style={styles.th}>Código</th>
                      <th style={styles.th}>Status</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {encomendasFiltradas.length > 0 ? (
                      encomendasFiltradas.map((enc) => (
                        <tr key={enc.id} style={styles.tr}>
                          <td style={styles.td}>
                            <strong>{enc.destinatario}</strong>
                          </td>
                          <td style={styles.td}>
                            Bloco {enc.bloco} - Apt {enc.apartamento}
                          </td>
                          <td style={styles.td}>
                            <span style={styles.codeTag}>
                              {enc.codigo_rastreio || `PKG-00${enc.id}`}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={enc.retirado ? styles.badgeSuccess : styles.badgeWarning}>
                              {enc.retirado ? 'Entregue' : 'Pendente'}
                            </span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            {!enc.retirado ? (
                              <button
                                onClick={() => handleBaixaEncomenda(enc.id)}
                                style={styles.btnAction}
                              >
                                Dar Baixa
                              </button>
                            ) : (
                              <span style={styles.textMuted}>Concluído</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={styles.emptyState}>
                          Nenhum registro encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {abaAtiva === 'mural' && (
            <div style={styles.cardsGrid}>
              {avisos.map((aviso) => (
                <div
                  key={aviso.id}
                  style={{
                    ...styles.noticeCard,
                    borderTop: aviso.fixado ? '4px solid #f4a261' : '4px solid #2a9d8f'
                  }}
                >
                  <div style={styles.noticeHeader}>
                    <h3 style={styles.noticeTitle}>
                      {aviso.fixado && '📌 '} {aviso.titulo}
                    </h3>
                  </div>
                  <p style={styles.noticeBody}>{aviso.conteudo}</p>
                </div>
              ))}
            </div>
          )}

          {abaAtiva === 'normas' && (
            <div style={styles.rulesList}>
              {normas.map((norma) => (
                <div key={norma.id} style={styles.ruleCard}>
                  <div style={styles.ruleTitleRow}>
                    <span style={styles.ruleIcon}>⚖️</span>
                    <strong style={styles.ruleName}>{norma.titulo}</strong>
                  </div>
                  <p style={styles.ruleDescription}>{norma.conteudo}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#334155'
  },
  loginWrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9'
  },
  loginBox: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center'
  },
  brandIconLarge: {
    fontSize: '40px',
    marginBottom: '8px'
  },
  titleLogin: {
    margin: 0,
    fontSize: '24px',
    color: '#0f172a'
  },
  subLogin: {
    color: '#64748b',
    fontSize: '14px',
    margin: '4px 0 24px 0'
  },
  erroBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'left'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569'
  },
  input: {
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none'
  },
  btnPrimary: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '6px'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '14px 36px'
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoMark: {
    fontSize: '28px'
  },
  brandText: {
    margin: 0,
    fontSize: '18px',
    color: '#0f172a',
    fontWeight: '700'
  },
  tagline: {
    fontSize: '12px',
    color: '#64748b'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  plantaoPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px'
  },
  pulsingDot: {
    color: '#10b981',
    fontSize: '12px'
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    color: '#334155'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a'
  },
  userRole: {
    fontSize: '11px',
    color: '#64748b',
    textTransform: 'capitalize'
  },
  btnLogout: {
    background: 'none',
    border: '1px solid #cbd5e1',
    color: '#64748b',
    padding: '5px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  content: {
    maxWidth: '1200px',
    margin: '32px auto',
    padding: '0 24px'
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '28px'
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  metricLabel: {
    fontSize: '13px',
    color: '#64748b'
  },
  metricNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a'
  },
  tabsNav: {
    display: 'flex',
    gap: '10px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '20px'
  },
  tabActive: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderBottom: '2px solid #0f172a',
    padding: '12px 20px',
    borderRadius: '8px 8px 0 0',
    fontWeight: '600',
    fontSize: '14px',
    color: '#0f172a',
    cursor: 'pointer'
  },
  tabInactive: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: '12px 20px',
    fontSize: '14px',
    color: '#64748b',
    cursor: 'pointer'
  },
  panelCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    padding: '24px'
  },
  panelControls: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    gap: '12px'
  },
  searchBar: {
    flex: 1,
    maxWidth: '400px',
    padding: '10px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none'
  },
  btnSecondary: {
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    color: '#334155',
    padding: '10px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  tableResponsive: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    padding: '12px 14px',
    fontSize: '12px',
    color: '#64748b',
    borderBottom: '1px solid #e2e8f0',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9'
  },
  td: {
    padding: '14px',
    fontSize: '14px'
  },
  codeTag: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace'
  },
  badgeWarning: {
    backgroundColor: '#fff7ed',
    color: '#c2410c',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  badgeSuccess: {
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  btnAction: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  textMuted: {
    color: '#94a3b8',
    fontSize: '13px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '30px',
    color: '#94a3b8'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px'
  },
  noticeCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
  },
  noticeHeader: {
    marginBottom: '8px'
  },
  noticeTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#0f172a'
  },
  noticeBody: {
    margin: 0,
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.5'
  },
  rulesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  ruleCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '16px 20px'
  },
  ruleTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px'
  },
  ruleIcon: {
    fontSize: '18px'
  },
  ruleName: {
    fontSize: '15px',
    color: '#0f172a'
  },
  ruleDescription: {
    margin: 0,
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.5'
  }
};