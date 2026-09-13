import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:8000';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('inicio');

  const [emailLogin, setEmailLogin] = useState('morador@email.com');
  const [senhaLogin, setSenhaLogin] = useState('senhaSegura123');

  const [encomendas, setEncomendas] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const [modalEncomenda, setModalEncomenda] = useState(false);
  const [modalOcorrencia, setModalOcorrencia] = useState(false);

  const [novaEnc, setNovaEnc] = useState({ destinatario: '', bloco: '', apartamento: '', descricao_pacote: '' });
  const [novaOc, setNovaOc] = useState({ titulo: '', descricao: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, { email: emailLogin, senha: senhaLogin });
      setUsuario(res.data.usuario);
    } catch (err) {
      alert('Credenciais inválidas.');
    }
  };

  const carregarDados = async () => {
    try {
      const encRes = await axios.get(`${API_URL}/encomendas`);
      const ocRes = await axios.get(`${API_URL}/ocorrencias`);
      setEncomendas(encRes.data);
      setOcorrencias(ocRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (usuario) carregarDados();
  }, [usuario]);

  const handleCriarEncomenda = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/encomendas`, novaEnc);
      setNovaEnc({ destinatario: '', bloco: '', apartamento: '', descricao_pacote: '' });
      setModalEncomenda(false);
      carregarDados();
    } catch (err) {
      alert('Erro ao salvar encomenda.');
    }
  };

  const handleDarBaixa = async (id) => {
    try {
      await axios.patch(`${API_URL}/encomendas/${id}/retirar`);
      carregarDados();
    } catch (err) {
      alert('Erro ao dar baixa.');
    }
  };

  const handleCriarOcorrencia = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/ocorrencias`, novaOc);
      setNovaOc({ titulo: '', descricao: '' });
      setModalOcorrencia(false);
      carregarDados();
    } catch (err) {
      alert('Erro ao registrar ocorrência.');
    }
  };

  const totalPendentes = encomendas.filter(e => !e.retirado).length;
  const totalEntregues = encomendas.filter(e => e.retirado).length;
  const totalOcorrencias = ocorrencias.length;

  const encomendasFiltradas = encomendas.filter(e => {
    const match = e.destinatario.toLowerCase().includes(busca.toLowerCase()) || 
                  e.apartamento.includes(busca) || 
                  e.descricao_pacote.toLowerCase().includes(busca.toLowerCase());
    if (filtroStatus === 'pendentes') return match && !e.retirado;
    if (filtroStatus === 'retirados') return match && e.retirado;
    return match;
  });

  if (!usuario) {
    return (
      <div className="login-screen">
        <div className="login-card-vet">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div className="brand-badge-box large">S</div>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>SíndicoHub</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Plataforma de Gestão Condominial
          </p>
          <form onSubmit={handleLogin} className="vet-form">
            <div className="form-field">
              <label>E-MAIL</label>
              <input type="email" value={emailLogin} onChange={(e) => setEmailLogin(e.target.value)} required />
            </div>
            <div className="form-field">
              <label>SENHA</label>
              <input type="password" value={senhaLogin} onChange={(e) => setSenhaLogin(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary-action" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
              Entrar na Plataforma
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="vet-layout">
      {/* Sidebar Lateral */}
      <aside className="vet-sidebar">
        <div>
          <div className="vet-brand">
            <div className="brand-badge-box">S</div>
            <div className="brand-info">
              <h2>SíndicoHub</h2>
              <span>Gestão Integrada</span>
            </div>
          </div>

          <div className="menu-section-label">Navegação Principal</div>
          <nav className="vet-nav">
            <button className={`nav-link ${abaAtiva === 'inicio' ? 'active' : ''}`} onClick={() => setAbaAtiva('inicio')}>
              🏠 Página Inicial
            </button>
            <button className={`nav-link ${abaAtiva === 'encomendas' ? 'active' : ''}`} onClick={() => setAbaAtiva('encomendas')}>
              📦 Encomendas
            </button>
            <button className={`nav-link ${abaAtiva === 'ocorrencias' ? 'active' : ''}`} onClick={() => setAbaAtiva('ocorrencias')}>
              ⚠️ Ocorrências
            </button>
          </nav>

          <div className="menu-section-label">Administração</div>
          <nav className="vet-nav">
            <button className="nav-link" onClick={() => alert('Módulo de Comunicados e Regras planejado para a AC3')}>
              📢 Mural & Regras
            </button>
            <button className="nav-link" onClick={() => alert('Módulo de Reformas e Vagas planejado para a Prova Final')}>
              🚗 Garagem & Vagas
            </button>
          </nav>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar-info">
            <div className="avatar-circle">{usuario.nome.charAt(0)}</div>
            <div className="user-text-info">
              <strong>{usuario.nome}</strong>
              <small>{usuario.perfil.toUpperCase()}</small>
            </div>
          </div>
          <button className="btn-icon-logout" onClick={() => setUsuario(null)} title="Sair">🚪</button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="vet-main">
        <header className="vet-header">
          <div className="page-title-group">
            <h1>
              {abaAtiva === 'inicio' && 'Visão Geral'}
              {abaAtiva === 'encomendas' && 'Gestão de Encomendas'}
              {abaAtiva === 'ocorrencias' && 'Central de Ocorrências'}
            </h1>
            <p>
              {abaAtiva === 'inicio' && 'Cuidando de todos os detalhes do condomínio com agilidade.'}
              {abaAtiva === 'encomendas' && 'Controle de recebimento e entrega de pacotes na portaria.'}
              {abaAtiva === 'ocorrencias' && 'Chamados e mediação direta entre moradores e administração.'}
            </p>
          </div>

          <div>
            {abaAtiva === 'encomendas' && (
              <button className="btn-primary-action" onClick={() => setModalEncomenda(true)}>
                + Nova Encomenda
              </button>
            )}
            {abaAtiva === 'ocorrencias' && (
              <button className="btn-primary-action" onClick={() => setModalOcorrencia(true)}>
                + Nova Ocorrência
              </button>
            )}
          </div>
        </header>

        {/* Banner de Boas-Vindas */}
        {abaAtiva === 'inicio' && (
          <>
            <div className="welcome-banner">
              <h2>Boa tarde! Que bom ter você aqui 🏢</h2>
              <p>Gerencie encomendas, acompanhe avisos e consulte ocorrências em tempo real.</p>
            </div>

            <div className="quick-actions-bar">
              <div className="quick-action-card" onClick={() => { setAbaAtiva('encomendas'); setModalEncomenda(true); }}>
                <div className="quick-icon">📦</div>
                <div>
                  <h5>Nova Encomenda</h5>
                  <span>Registrar pacote na portaria</span>
                </div>
              </div>
              <div className="quick-action-card" onClick={() => { setAbaAtiva('ocorrencias'); setModalOcorrencia(true); }}>
                <div className="quick-icon">⚠️</div>
                <div>
                  <h5>Nova Ocorrência</h5>
                  <span>Abrir chamado para o síndico</span>
                </div>
              </div>
              <div className="quick-action-card" onClick={() => setAbaAtiva('encomendas')}>
                <div className="quick-icon">🔍</div>
                <div>
                  <h5>Consultar Baixas</h5>
                  <span>Visualizar pacotes entregues</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Cards de Métricas (KPIs) */}
        <section className="vet-kpis">
          <div className="vet-kpi-card">
            <span className="kpi-title">Pendentes na Portaria</span>
            <h3>{totalPendentes}</h3>
          </div>
          <div className="vet-kpi-card">
            <span className="kpi-title">Entregues / Retirados</span>
            <h3>{totalEntregues}</h3>
          </div>
          <div className="vet-kpi-card">
            <span className="kpi-title">Ocorrências Totais</span>
            <h3>{totalOcorrencias}</h3>
          </div>
          <div className="vet-kpi-card">
            <span className="kpi-title">Status da API</span>
            <h3 style={{ color: 'var(--primary)', fontSize: '1.25rem', marginTop: '0.85rem' }}>Online 🟢</h3>
          </div>
        </section>

        {/* Conteúdo: Encomendas */}
        {(abaAtiva === 'encomendas' || abaAtiva === 'inicio') && (
          <section className="vet-content">
            <div className="table-toolbar">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Buscar por morador, apartamento ou pacote..." 
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <button className={`filter-pill ${filtroStatus === 'todos' ? 'active' : ''}`} onClick={() => setFiltroStatus('todos')}>Todos</button>
                <button className={`filter-pill ${filtroStatus === 'pendentes' ? 'active' : ''}`} onClick={() => setFiltroStatus('pendentes')}>Pendentes</button>
                <button className={`filter-pill ${filtroStatus === 'retirados' ? 'active' : ''}`} onClick={() => setFiltroStatus('retirados')}>Retirados</button>
              </div>
            </div>

            <div className="cards-collection">
              {encomendasFiltradas.map((item) => (
                <div key={item.id} className="pet-card">
                  <div>
                    <div className="pet-header">
                      <div className="pet-profile-group">
                        <div className="pet-avatar">📦</div>
                        <div className="pet-title">
                          <h4>{item.descricao_pacote}</h4>
                          <span className="pet-subtitle">Apto {item.apartamento} • Bloco {item.bloco}</span>
                        </div>
                      </div>
                      <span className={`tag-badge ${item.retirado ? 'tag-success' : 'tag-pending'}`}>
                        {item.retirado ? 'Retirado' : 'Pendente'}
                      </span>
                    </div>

                    <div className="pet-body">
                      <p><span>Destinatário:</span> <strong>{item.destinatario}</strong></p>
                      <p><span>Local:</span> <strong>Portaria Principal</strong></p>
                    </div>
                  </div>

                  <div className="pet-actions">
                    {!item.retirado ? (
                      <button className="btn-card-action primary" onClick={() => handleDarBaixa(item.id)}>
                        ✓ Dar Baixa
                      </button>
                    ) : (
                      <button className="btn-card-action" disabled style={{ opacity: 0.6, cursor: 'default' }}>
                        Entregue
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Conteúdo: Ocorrências */}
        {abaAtiva === 'ocorrencias' && (
          <section className="vet-content">
            <div className="cards-collection">
              {ocorrencias.map((oc) => (
                <div key={oc.id} className="pet-card">
                  <div>
                    <div className="pet-header">
                      <div className="pet-profile-group">
                        <div className="pet-avatar" style={{ background: 'var(--warning-light)' }}>⚠️</div>
                        <div className="pet-title">
                          <h4>{oc.titulo}</h4>
                          <span className="pet-subtitle">Chamado #{oc.id}</span>
                        </div>
                      </div>
                      <span className="tag-badge tag-pending">{oc.status}</span>
                    </div>
                    <div className="pet-body">
                      <p style={{ flexDirection: 'column', gap: '0.25rem' }}>
                        <span>Descrição:</span>
                        <strong>{oc.descricao}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Modal Nova Encomenda */}
      {modalEncomenda && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header-row">
              <h3>Nova Encomenda</h3>
              <button className="btn-close-modal" onClick={() => setModalEncomenda(false)}>✕</button>
            </div>
            <form onSubmit={handleCriarEncomenda} className="vet-form">
              <div className="form-field">
                <label>NOME DO DESTINATÁRIO</label>
                <input 
                  type="text" 
                  placeholder="Ex: Carlos Souza" 
                  value={novaEnc.destinatario} 
                  onChange={(e) => setNovaEnc({...novaEnc, destinatario: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-grid-2">
                <div className="form-field">
                  <label>BLOCO</label>
                  <input 
                    type="text" 
                    placeholder="Ex: A" 
                    value={novaEnc.bloco} 
                    onChange={(e) => setNovaEnc({...novaEnc, bloco: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-field">
                  <label>APARTAMENTO</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 102" 
                    value={novaEnc.apartamento} 
                    onChange={(e) => setNovaEnc({...novaEnc, apartamento: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="form-field">
                <label>DESCRIÇÃO DO PACOTE</label>
                <input 
                  type="text" 
                  placeholder="Ex: Caixa Amazon - Livros" 
                  value={novaEnc.descricao_pacote} 
                  onChange={(e) => setNovaEnc({...novaEnc, descricao_pacote: e.target.value})} 
                  required 
                />
              </div>
              <button type="submit" className="btn-primary-action" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                Cadastrar Encomenda
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova Ocorrência */}
      {modalOcorrencia && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header-row">
              <h3>Nova Ocorrência</h3>
              <button className="btn-close-modal" onClick={() => setModalOcorrencia(false)}>✕</button>
            </div>
            <form onSubmit={handleCriarOcorrencia} className="vet-form">
              <div className="form-field">
                <label>TÍTULO</label>
                <input 
                  type="text" 
                  placeholder="Ex: Barulho após 22h" 
                  value={novaOc.titulo} 
                  onChange={(e) => setNovaOc({...novaOc, titulo: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-field">
                <label>DESCRIÇÃO DETALHADA</label>
                <textarea 
                  rows="4" 
                  placeholder="Relate o ocorrido com detalhes..." 
                  value={novaOc.descricao} 
                  onChange={(e) => setNovaOc({...novaOc, descricao: e.target.value})} 
                  required 
                />
              </div>
              <button type="submit" className="btn-primary-action" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                Registrar Chamado
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;