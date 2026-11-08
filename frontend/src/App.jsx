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
  const [reservas, setReservas] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);

  const [abaAtiva, setAbaAtiva] = useState('reservas');
  const [carregando, setCarregando] = useState(false);

  // Estados de formulário de reserva
  const [areaSelecionada, setAreaSelecionada] = useState('Salão de Festas');
  const [dataReserva, setDataReserva] = useState('');
  const [periodoReserva, setPeriodoReserva] = useState('Noturno');
  const [msgReserva, setMsgReserva] = useState({ tipo: '', texto: '' });

  // Mock financeiro persistente em front para demonstração da AC3
  const [taxas] = useState([
    {
      id: 1,
      competencia: 'Novembro / 2026',
      valor: 'R$ 485,50',
      vencimento: '10/11/2026',
      status: 'Pendente',
      codigoBarras: '34191.79001 01043.510047 91020.150008 4 95310000048550'
    },
    {
      id: 2,
      competencia: 'Outubro / 2026',
      valor: 'R$ 485,50',
      vencimento: '10/10/2026',
      status: 'Pago',
      codigoBarras: '34191.79001 01043.510047 91020.150008 4 95000000048550'
    },
    {
      id: 3,
      competencia: 'Setembro / 2026',
      valor: 'R$ 460,00',
      vencimento: '10/09/2026',
      status: 'Pago',
      codigoBarras: '34191.79001 01043.510047 91020.150008 4 94700000046000'
    }
  ]);

  const espacosDisponiveis = [
    {
      nome: 'Salão de Festas',
      capacidade: '80 pessoas',
      taxa: 'R$ 150,00',
      icone: '🎉',
      descricao: 'Ambiente climatizado com cozinha completa, churrasqueira interna e mesas.'
    },
    {
      nome: 'Churrasqueira A',
      capacidade: '25 pessoas',
      taxa: 'R$ 50,00',
      icone: '🥩',
      descricao: 'Próxima às quadras, com freezer horizontal, grelha giratória e bancada.'
    },
    {
      nome: 'Churrasqueira B',
      capacidade: '20 pessoas',
      taxa: 'R$ 50,00',
      icone: '🔥',
      descricao: 'Espaço privativo ao ar livre próximo ao jardim e deck solarium.'
    },
    {
      nome: 'Espaço Gourmet',
      capacidade: '30 pessoas',
      taxa: 'R$ 100,00',
      icone: '🍷',
      descricao: 'Estrutura refinada com cooktop por indução, adega e lounge de estar.'
    }
  ];

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
      .catch((err) => console.error(err));

    fetch('http://localhost:8000/avisos?tipo=comunicado')
      .then((res) => res.json())
      .then((data) => setAvisos(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));

    fetch('http://localhost:8000/avisos?tipo=norma')
      .then((res) => res.json())
      .then((data) => setNormas(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));

    fetch('http://localhost:8000/plantao')
      .then((res) => res.json())
      .then((data) => setPlantoes(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));

    fetch('http://localhost:8000/reservas')
      .then((res) => res.json())
      .then((data) => setReservas(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));

    fetch('http://localhost:8000/ocorrencias')
      .then((res) => res.json())
      .then((data) => setOcorrencias(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (token) {
      carregarDados();
    }
  }, [token]);

  const handleCriarReserva = async (e) => {
    e.preventDefault();
    setMsgReserva({ tipo: '', texto: '' });

    if (!dataReserva) {
      setMsgReserva({ tipo: 'erro', texto: 'Selecione uma data para o agendamento.' });
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area: areaSelecionada,
          morador_nome: usuario?.nome || 'Lucas Ricardo',
          apartamento: '101',
          bloco: 'A',
          data_reserva: dataReserva,
          periodo: periodoReserva
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Falha ao registrar reserva.');
      }

      setMsgReserva({ tipo: 'sucesso', texto: `Reserva para "${areaSelecionada}" confirmada!` });
      setDataReserva('');
      carregarDados();
    } catch (err) {
      setMsgReserva({ tipo: 'erro', texto: err.message });
    }
  };

  const handleCopiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo);
    alert('Linha digitável copiada para a área de transferência!');
  };

  const plantaoAtual = plantoes.length > 0 ? plantoes[0] : null;

  if (!token) {
    return (
      <div style={styles.loginWrapper}>
        <div style={styles.loginBox}>
          <div style={styles.brandIconLarge}>🏢</div>
          <h2 style={styles.titleLogin}>SíndicoHub</h2>
          <p style={styles.subLogin}>Portal Administrativo e do Condômino</p>

          {erroLogin && <div style={styles.erroBox}>{erroLogin}</div>}

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>E-mail de Acesso</label>
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
              {carregando ? 'Autenticando...' : 'Acessar Sistema'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Superior */}
      <header style={styles.navbar}>
        <div style={styles.navBrand}>
          <span style={styles.logoMark}>🏢</span>
          <div>
            <h1 style={styles.brandText}>SíndicoHub</h1>
            <span style={styles.tagline}>Gestão Integrada de Condomínios</span>
          </div>
        </div>

        <div style={styles.navRight}>
          {plantaoAtual && (
            <div style={styles.plantaoPill}>
              <span style={styles.pulsingDot}>●</span>
              <span>
                <strong>Portaria Ativa:</strong> {plantaoAtual.funcionario_nome} ({plantaoAtual.turno})
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
            <button onClick={() => setToken(null)} style={styles.btnLogout}>Sair</button>
          </div>
        </div>
      </header>

      <main style={styles.content}>
        {/* Navegação por Abas em formato de Cards de Seção */}
        <div style={styles.tabsNav}>
          <button
            onClick={() => setAbaAtiva('reservas')}
            style={abaAtiva === 'reservas' ? styles.tabActive : styles.tabInactive}
          >
            📅 Reservas de Áreas Comuns
          </button>
          <button
            onClick={() => setAbaAtiva('taxas')}
            style={abaAtiva === 'taxas' ? styles.tabActive : styles.tabInactive}
          >
            💳 Taxas & Boletos
          </button>
          <button
            onClick={() => setAbaAtiva('mural')}
            style={abaAtiva === 'mural' ? styles.tabActive : styles.tabInactive}
          >
            📢 Mural de Avisos
          </button>
          <button
            onClick={() => setAbaAtiva('normas')}
            style={abaAtiva === 'normas' ? styles.tabActive : styles.tabInactive}
          >
            📜 Regimento Interno
          </button>
        </div>

        {/* 1. ABA DE RESERVAS DE ÁREAS COMUNS (CARDS) */}
        {abaAtiva === 'reservas' && (
          <div>
            <div style={styles.sectionHeaderBox}>
              <h2 style={styles.sectionHeading}>Espaços de Lazer Disponíveis para Reserva</h2>
              <p style={styles.sectionSub}>Selecione um espaço abaixo, indique a data e confirme seu agendamento instantaneamente.</p>
            </div>

            {msgReserva.texto && (
              <div style={msgReserva.tipo === 'sucesso' ? styles.sucessoBox : styles.erroBox}>
                {msgReserva.texto}
              </div>
            )}

            {/* Grid com Cards dos Espaços */}
            <div style={styles.cardsGridEspacos}>
              {espacosDisponiveis.map((espaco) => {
                const isSelected = areaSelecionada === espaco.nome;
                return (
                  <div
                    key={espaco.nome}
                    onClick={() => setAreaSelecionada(espaco.nome)}
                    style={{
                      ...styles.spaceCard,
                      borderColor: isSelected ? '#0f172a' : '#e2e8f0',
                      boxShadow: isSelected ? '0 8px 20px -4px rgba(15, 23, 42, 0.12)' : '0 2px 6px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={styles.spaceCardTop}>
                      <span style={styles.spaceIcon}>{espaco.icone}</span>
                      <span style={styles.spaceBadge}>{espaco.taxa}</span>
                    </div>
                    <h3 style={styles.spaceTitle}>{espaco.nome}</h3>
                    <p style={styles.spaceDesc}>{espaco.descricao}</p>
                    <div style={styles.spaceFooter}>
                      <span style={styles.spaceCap}>👥 Capacidade: {espaco.capacidade}</span>
                      <button
                        type="button"
                        style={isSelected ? styles.btnCardSelected : styles.btnCardSelect}
                      >
                        {isSelected ? '✓ Selecionado' : 'Escolher'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Card de Formulário de Agendamento do Espaço Selecionado */}
            <div style={styles.bookingCard}>
              <h3 style={styles.bookingTitle}>
                Confirmar Agendamento: <span style={{ color: '#0f172a' }}>{areaSelecionada}</span>
              </h3>
              <form onSubmit={handleCriarReserva} style={styles.bookingForm}>
                <div style={styles.bookingFormGroup}>
                  <label style={styles.label}>Data do Evento</label>
                  <input
                    type="date"
                    required
                    value={dataReserva}
                    onChange={(e) => setDataReserva(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.bookingFormGroup}>
                  <label style={styles.label}>Período / Turno</label>
                  <select
                    value={periodoReserva}
                    onChange={(e) => setPeriodoReserva(e.target.value)}
                    style={styles.input}
                  >
                    <option value="Diurno">Diurno (09:00 às 15:00)</option>
                    <option value="Noturno">Noturno (17:00 às 23:00)</option>
                  </select>
                </div>

                <div style={styles.bookingFormGroup}>
                  <label style={styles.label}>Unidade do Solicitante</label>
                  <input
                    type="text"
                    disabled
                    value="Bloco A - Apartamento 101"
                    style={{ ...styles.input, backgroundColor: '#f1f5f9' }}
                  />
                </div>

                <button type="submit" style={styles.btnSubmitBooking}>
                  Solicitar Reserva
                </button>
              </form>
            </div>

            {/* Cards com as Próximas Reservas Confirmadas */}
            <h3 style={{ ...styles.sectionHeading, marginTop: '36px', marginBottom: '16px' }}>
              Próximas Reservas Confirmadas no Condomínio
            </h3>
            <div style={styles.cardsGridMini}>
              {reservas.length === 0 ? (
                <p style={styles.textMuted}>Nenhuma reserva agendada no momento.</p>
              ) : (
                reservas.map((res) => (
                  <div key={res.id} style={styles.reservedCard}>
                    <div style={styles.reservedHeader}>
                      <strong style={styles.reservedArea}>{res.area}</strong>
                      <span style={styles.badgeSuccess}>Confirmada</span>
                    </div>
                    <div style={styles.reservedRow}>
                      <span>📅 <strong>Data:</strong> {res.data_reserva}</span>
                      <span>⏰ <strong>Turno:</strong> {res.periodo}</span>
                    </div>
                    <div style={styles.reservedFooter}>
                      <small style={styles.textMuted}>
                        Reservado por <strong>{res.morador_nome}</strong> (Bloco {res.bloco} - Apt {res.apartamento})
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 2. ABA DE TAXAS & BOLETOS DE CONDOMÍNIO (CARDS) */}
        {abaAtiva === 'taxas' && (
          <div>
            <div style={styles.sectionHeaderBox}>
              <h2 style={styles.sectionHeading}>Taxas Condominiais & Prestação de Contas</h2>
              <p style={styles.sectionSub}>Acompanhe o status dos boletos mensais da sua unidade com emissão de 2ª via rápida.</p>
            </div>

            <div style={styles.cardsGridFinanceiro}>
              {taxas.map((taxa) => {
                const isPendente = taxa.status === 'Pendente';
                return (
                  <div
                    key={taxa.id}
                    style={{
                      ...styles.financeCard,
                      borderTop: isPendente ? '4px solid #e76f51' : '4px solid #2a9d8f'
                    }}
                  >
                    <div style={styles.financeHeader}>
                      <div>
                        <span style={styles.financeCompetencia}>{taxa.competencia}</span>
                        <h3 style={styles.financeValor}>{taxa.valor}</h3>
                      </div>
                      <span style={isPendente ? styles.badgeWarning : styles.badgeSuccess}>
                        {taxa.status}
                      </span>
                    </div>

                    <div style={styles.financeDetail}>
                      <div style={styles.financeRow}>
                        <span style={styles.textMuted}>Vencimento:</span>
                        <strong>{taxa.vencimento}</strong>
                      </div>
                      <div style={styles.financeRow}>
                        <span style={styles.textMuted}>Unidade:</span>
                        <span>Bloco A - Apt 101</span>
                      </div>
                    </div>

                    <div style={styles.barcodeBox}>
                      <span style={styles.barcodeLabel}>Linha Digitável:</span>
                      <code style={styles.barcodeCode}>{taxa.codigoBarras}</code>
                    </div>

                    <div style={styles.financeActions}>
                      <button
                        onClick={() => handleCopiarCodigo(taxa.codigoBarras)}
                        style={styles.btnActionSecondary}
                      >
                        Copiar Código
                      </button>
                      <button
                        onClick={() => alert(`Baixando boleto referente a ${taxa.competencia}...`)}
                        style={styles.btnAction}
                      >
                        Baixar PDF (2ª Via)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. ABA DO MURAL DE AVISOS (CARDS) */}
        {abaAtiva === 'mural' && (
          <div>
            <div style={styles.sectionHeaderBox}>
              <h2 style={styles.sectionHeading}>Mural Informativo do Condomínio</h2>
              <p style={styles.sectionSub}>Comunicações oficiais da administração e avisos importantes de manutenção.</p>
            </div>

            <div style={styles.cardsGridAvisos}>
              {avisos.map((aviso) => (
                <div
                  key={aviso.id}
                  style={{
                    ...styles.noticeCard,
                    borderLeft: aviso.fixado ? '5px solid #f4a261' : '5px solid #3d5a80'
                  }}
                >
                  <div style={styles.noticeHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{aviso.fixado ? '📌' : '📢'}</span>
                      <h3 style={styles.noticeTitle}>{aviso.titulo}</h3>
                    </div>
                    {aviso.fixado && <span style={styles.badgePin}>Prioridade</span>}
                  </div>
                  <p style={styles.noticeBody}>{aviso.conteudo}</p>
                  <div style={styles.cardFooter}>
                    <small style={styles.textMuted}>Publicado pela Administração</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. ABA DO REGIMENTO INTERNO (CARDS) */}
        {abaAtiva === 'normas' && (
          <div>
            <div style={styles.sectionHeaderBox}>
              <h2 style={styles.sectionHeading}>Regimento Interno & Normas de Convivência</h2>
              <p style={styles.sectionSub}>Diretrizes estabelecidas em convenção para a harmonia e segurança de todos os moradores.</p>
            </div>

            <div style={styles.cardsGridNormas}>
              {normas.map((norma) => (
                <div key={norma.id} style={styles.ruleCard}>
                  <div style={styles.ruleHeader}>
                    <div style={styles.ruleIconCircle}>⚖️</div>
                    <div>
                      <h4 style={styles.ruleTitle}>{norma.titulo}</h4>
                      <span style={styles.ruleCapitulo}>Capítulo de Conduta Geral</span>
                    </div>
                  </div>
                  <p style={styles.ruleText}>{norma.conteudo}</p>
                  <div style={styles.ruleFooter}>
                    <span style={styles.ruleSanction}>Infração sujeita a advertência e multa</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b' },
  loginWrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' },
  loginBox: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' },
  brandIconLarge: { fontSize: '42px', marginBottom: '8px' },
  titleLogin: { margin: 0, fontSize: '24px', color: '#0f172a' },
  subLogin: { color: '#64748b', fontSize: '14px', margin: '4px 0 24px 0' },
  erroBox: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '18px', border: '1px solid #fecaca' },
  sucessoBox: { backgroundColor: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '18px', border: '1px solid #bbf7d0' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#475569' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' },
  btnPrimary: { backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '14px 36px' },
  navBrand: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoMark: { fontSize: '28px' },
  brandText: { margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '700' },
  tagline: { fontSize: '12px', color: '#64748b' },
  navRight: { display: 'flex', alignItems: 'center', gap: '24px' },
  plantaoPill: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '6px 14px', borderRadius: '20px', fontSize: '13px' },
  pulsingDot: { color: '#10b981', fontSize: '12px' },
  userProfile: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#334155' },
  userInfo: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '13px', fontWeight: '600', color: '#0f172a' },
  userRole: { fontSize: '11px', color: '#64748b', textTransform: 'capitalize' },
  btnLogout: { background: 'none', border: '1px solid #cbd5e1', color: '#64748b', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  
  content: { maxWidth: '1200px', margin: '32px auto', padding: '0 24px' },
  tabsNav: { display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', marginBottom: '28px', flexWrap: 'wrap' },
  tabActive: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderBottom: '2px solid #0f172a', padding: '12px 20px', borderRadius: '8px 8px 0 0', fontWeight: '600', fontSize: '14px', color: '#0f172a', cursor: 'pointer' },
  tabInactive: { backgroundColor: 'transparent', border: 'none', padding: '12px 20px', fontSize: '14px', color: '#64748b', cursor: 'pointer' },

  sectionHeaderBox: { marginBottom: '24px' },
  sectionHeading: { fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' },
  sectionSub: { fontSize: '14px', color: '#64748b', margin: 0 },

  // Cards de Espaços Comuns
  cardsGridEspacos: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '28px' },
  spaceCard: { backgroundColor: '#ffffff', borderRadius: '12px', border: '2px solid #e2e8f0', padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  spaceCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  spaceIcon: { fontSize: '32px' },
  spaceBadge: { backgroundColor: '#f1f5f9', color: '#0f172a', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' },
  spaceTitle: { margin: '0 0 8px 0', fontSize: '17px', color: '#0f172a', fontWeight: '600' },
  spaceDesc: { margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' },
  spaceFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' },
  spaceCap: { fontSize: '12px', color: '#64748b', fontWeight: '500' },
  btnCardSelect: { backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
  btnCardSelected: { backgroundColor: '#0f172a', border: '1px solid #0f172a', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },

  // Card de Confirmação de Reserva
  bookingCard: { backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },
  bookingTitle: { margin: '0 0 16px 0', fontSize: '16px', color: '#64748b' },
  bookingForm: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'flex-end' },
  bookingFormGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  btnSubmitBooking: { backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '11px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', height: '42px' },

  // Mini Cards de Reservas
  cardsGridMini: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' },
  reservedCard: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  reservedHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  reservedArea: { fontSize: '15px', color: '#0f172a' },
  reservedRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' },
  reservedFooter: { borderTop: '1px solid #f8fafc', paddingTop: '6px' },

  // Cards de Boletos e Taxas
  cardsGridFinanceiro: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' },
  financeCard: { backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' },
  financeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  financeCompetencia: { fontSize: '13px', color: '#64748b', fontWeight: '500' },
  financeValor: { margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#0f172a' },
  financeDetail: { display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '12px 0' },
  financeRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px' },
  barcodeBox: { backgroundColor: '#f8fafc', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid #e2e8f0' },
  barcodeLabel: { fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' },
  barcodeCode: { fontSize: '11px', fontFamily: 'monospace', color: '#334155', wordBreak: 'break-all' },
  financeActions: { display: 'flex', gap: '10px' },
  btnActionSecondary: { flex: 1, backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '9px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  btnAction: { flex: 1, backgroundColor: '#0f172a', border: 'none', color: '#ffffff', padding: '9px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },

  // Cards de Mural
  cardsGridAvisos: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' },
  noticeCard: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  noticeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  noticeTitle: { margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '600' },
  noticeBody: { margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.5' },
  cardFooter: { marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f8fafc' },
  badgePin: { backgroundColor: '#ffedd5', color: '#c2410c', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' },

  // Cards de Regimento
  cardsGridNormas: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' },
  ruleCard: { backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  ruleHeader: { display: 'flex', alignItems: 'center', gap: '12px' },
  ruleIconCircle: { width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  ruleTitle: { margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '600' },
  ruleCapitulo: { fontSize: '12px', color: '#64748b' },
  ruleText: { margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.5' },
  ruleFooter: { borderTop: '1px solid #f1f5f9', paddingTop: '8px' },
  ruleSanction: { fontSize: '12px', color: '#b91c1c', fontWeight: '500' },

  // Badges gerais
  badgeWarning: { backgroundColor: '#fff7ed', color: '#c2410c', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
  badgeSuccess: { backgroundColor: '#f0fdf4', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
  textMuted: { color: '#94a3b8', fontSize: '13px' }
};