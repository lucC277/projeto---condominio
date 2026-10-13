import React, { useState, useEffect } from 'react';

export default function App() {
  // Estados de Autenticação
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');

  // Estados dos Módulos do Sistema
  const [encomendas, setEncomendas] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [normas, setNormas] = useState([]);
  const [plantoes, setPlantoes] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // 1. Função de Login
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
      setUsuario(data.usuario || { nome: 'Lucas Mendes', perfil: 'sindico', email });
    } catch (err) {
      setErroLogin(err.message);
    } finally {
      setCarregando(false);
    }
  };

  // 2. Carregamento dos dados após autenticação
  const carregarDadosDashboard = () => {
    // Carregar Encomendas (AC1)
    fetch('http://localhost:8000/encomendas')
      .then((res) => res.json())
      .then((data) => setEncomendas(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Erro ao buscar encomendas:', err));

    // Carregar Mural de Avisos (AC2)
    fetch('http://localhost:8000/avisos?tipo=comunicado')
      .then((res) => res.json())
      .then((data) => setAvisos(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Erro ao buscar comunicados:', err));

    // Carregar Normas de Convivência (AC2)
    fetch('http://localhost:8000/avisos?tipo=norma')
      .then((res) => res.json())
      .then((data) => setNormas(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Erro ao buscar normas:', err));

    // Carregar Plantão da Portaria (AC2)
    fetch('http://localhost:8000/plantao')
      .then((res) => res.json())
      .then((data) => setPlantoes(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Erro ao buscar plantão:', err));
  };

  useEffect(() => {
    if (token) {
      carregarDadosDashboard();
    }
  }, [token]);

  // 3. Dar baixa / Retirar encomenda (AC1)
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

  // 4. Logout
  const handleLogout = () => {
    setToken(null);
    setUsuario(null);
    setEmail('');
    setSenha('');
  };

  // --- TELA DE LOGIN ---
  if (!token) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={styles.logoBadge}>🏢</div>
          <h2 style={styles.loginTitle}>SíndicoHub</h2>
          <p style={styles.loginSubtitle}>Gestão Condominial Integrada</p>

          {erroLogin && <div style={styles.alertaErro}>{erroLogin}</div>}

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

            <button type="submit" disabled={carregando} style={styles.btnPrimario}>
              {carregando ? 'Validando credenciais...' : 'Entrar na Plataforma'}
            </button>
          </form>

          <div style={styles.loginFooter}>
            <small>Acesso seguro com criptografia Bcrypt & FastAPI</small>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD PRINCIPAL INTEGRADO (AC1 + AC2) ---
  return (
    <div style={styles.appContainer}>
      {/* CABEÇALHO */}
      <header style={styles.header}>
        <div style={styles.headerBrand}>
          <span style={styles.brandIcon}>🏢</span>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#1b4332' }}>SíndicoHub</h2>
        </div>
        <div style={styles.headerUser}>
          <span style={{ fontSize: '14px', color: '#2d6a4f' }}>
            Conectado como: <strong>{usuario?.nome || 'Usuário'}</strong> ({usuario?.perfil || 'Síndico'})
          </span>
          <button onClick={handleLogout} style={styles.btnSair}>Sair</button>
        </div>
      </header>

      <main style={styles.mainContent}>
        {/* BARRA OPERACIONAL: PLANTÃO DA PORTARIA (AC2) */}
        <section style={styles.plantaoBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={styles.statusOnline}>●</span>
            <strong>Plantão da Portaria em Tempo Real:</strong>
          </div>
          <div style={styles.plantaoInfo}>
            {plantoes.length > 0 ? (
              plantoes.map((p) => (
                <span key={p.id} style={{ fontSize: '14px' }}>
                  <strong>{p.funcionario_nome}</strong> ({p.cargo}) — Turno: {p.turno} — Contato: {p.telefone_contato || 'Ramal 100'}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '14px', color: '#555' }}>Carlos Portaria (Porteiro Líder) — Turno Diurno — Ramal 100</span>
            )}
          </div>
        </section>

        {/* CARDS DE MÉTRICAS / KPIS */}
        <section style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Total de Encomendas</span>
            <span style={styles.kpiValue}>{encomendas.length}</span>
          </div>
          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Pendentes de Retirada</span>
            <span style={{ ...styles.kpiValue, color: '#e76f51' }}>
              {encomendas.filter((e) => !e.retirado).length}
            </span>
          </div>
          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Avisos Publicados</span>
            <span style={{ ...styles.kpiValue, color: '#2a9d8f' }}>{avisos.length}</span>
          </div>
        </section>

        {/* GRID PRINCIPAL: ENCOMENDAS (AC1) + MURAL & NORMAS (AC2) */}
        <div style={styles.dashboardGrid}>
          {/* COLUNA ESQUERDA: GESTÃO DE ENCOMENDAS (AC1) */}
          <section style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>📦 Controle de Encomendas</h3>
              <button onClick={carregarDadosDashboard} style={styles.btnRecarregar}>Atualizar</button>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Destinatário</th>
                    <th style={styles.th}>Unidade</th>
                    <th style={styles.th}>Código</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {encomendas.length > 0 ? (
                    encomendas.map((enc) => (
                      <tr key={enc.id} style={styles.tableRow}>
                        <td style={styles.td}><strong>{enc.destinatario}</strong></td>
                        <td style={styles.td}>{enc.bloco} - Apt {enc.apartamento}</td>
                        <td style={styles.td}><code>{enc.codigo_rastreio || 'PORT-00' + enc.id}</code></td>
                        <td style={styles.td}>
                          <span style={enc.retirado ? styles.badgeRetirado : styles.badgePendente}>
                            {enc.retirado ? 'Retirado' : 'Pendente'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {!enc.retirado ? (
                            <button
                              onClick={() => handleBaixaEncomenda(enc.id)}
                              style={styles.btnBaixa}
                            >
                              Dar Baixa
                            </button>
                          ) : (
                            <span style={{ color: '#6c757d', fontSize: '13px' }}>Concluído</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                        Nenhuma encomenda registrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* COLUNA DIREITA: COMUNICAÇÃO & NORMAS (AC2) */}
          <div style={styles.sideColumn}>
            {/* 1. MURAL INFORMATIVO */}
            <section style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>📢 Mural Informativo</h3>
              <div style={styles.cardsList}>
                {avisos.length > 0 ? (
                  avisos.map((av) => (
                    <div
                      key={av.id}
                      style={{
                        ...styles.avisoItem,
                        backgroundColor: av.fixado ? '#fffde7' : '#ffffff',
                        borderColor: av.fixado ? '#ffe082' : '#e0e0e0'
                      }}
                    >
                      <div style={styles.avisoHead}>
                        <span style={styles.avisoTitulo}>
                          {av.fixado && '📌 '}<strong>{av.titulo}</strong>
                        </span>
                      </div>
                      <p style={styles.avisoTexto}>{av.conteudo}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#888', fontSize: '14px' }}>Nenhum comunicado ativo.</p>
                )}
              </div>
            </section>

            {/* 2. REGIMENTO & NORMAS DE CONVIVÊNCIA */}
            <section style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>📜 Normas de Conduta</h3>
              <div style={styles.cardsList}>
                {normas.length > 0 ? (
                  normas.map((norma) => (
                    <div key={norma.id} style={styles.normaItem}>
                      <span style={styles.normaTitulo}>• {norma.titulo}</span>
                      <p style={styles.normaTexto}>{norma.conteudo}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#888', fontSize: '14px' }}>Regimento interno em atualização.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

// ESTILOS EM LINHA (SaaS Moderno / VetCare Palette)
const styles = {
  loginContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  loginCard: {
    backgroundColor: '#ffffff',
    padding: '36px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center'
  },
  logoBadge: {
    fontSize: '36px',
    marginBottom: '8px'
  },
  loginTitle: {
    margin: 0,
    fontSize: '24px',
    color: '#1b4332'
  },
  loginSubtitle: {
    margin: '4px 0 24px 0',
    color: '#52b788',
    fontSize: '14px'
  },
  alertaErro: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    textAlign: 'left'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#2d3748'
  },
  input: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none'
  },
  btnPrimario: {
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  },
  loginFooter: {
    marginTop: '20px',
    color: '#94a3b8'
  },
  appContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 28px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0'
  },
  headerBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  brandIcon: {
    fontSize: '22px'
  },
  headerUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  btnSair: {
    backgroundColor: 'transparent',
    border: '1px solid #cbd5e1',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#475569'
  },
  mainContent: {
    padding: '24px 28px',
    maxWidth: '1280px',
    margin: '0 auto'
  },
  plantaoBar: {
    backgroundColor: '#d8f3dc',
    border: '1px solid #b7e4c7',
    padding: '12px 18px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    color: '#1b4332',
    flexWrap: 'wrap',
    gap: '10px'
  },
  statusOnline: {
    color: '#2d6a4f',
    fontSize: '16px'
  },
  plantaoInfo: {
    color: '#2d6a4f'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    padding: '18px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  kpiLabel: {
    fontSize: '13px',
    color: '#64748b'
  },
  kpiValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1b4332'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1.2fr',
    gap: '20px'
  },
  sideColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#1e293b'
  },
  btnRecarregar: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#2d6a4f',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  tableHeaderRow: {
    borderBottom: '2px solid #f1f5f9'
  },
  th: {
    padding: '10px 12px',
    fontSize: '12px',
    textTransform: 'uppercase',
    color: '#64748b',
    fontWeight: '600'
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9'
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#334155'
  },
  badgePendente: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600'
  },
  badgeRetirado: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600'
  },
  btnBaixa: {
    backgroundColor: '#2d6a4f',
    color: '#ffffff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  cardsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '12px'
  },
  avisoItem: {
    padding: '12px 14px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0'
  },
  avisoHead: {
    marginBottom: '6px'
  },
  avisoTitulo: {
    fontSize: '14px',
    color: '#0f172a'
  },
  avisoTexto: {
    margin: 0,
    fontSize: '13px',
    color: '#475569',
    lineHeight: '1.4'
  },
  normaItem: {
    backgroundColor: '#f8fafc',
    padding: '10px 14px',
    borderRadius: '6px',
    borderLeft: '3px solid #2d6a4f'
  },
  normaTitulo: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b'
  },
  normaTexto: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#64748b',
    lineHeight: '1.4'
  }
};