import React, { useState, useEffect } from 'react';

// ===== API BASE URL =====
const API_BASE = 'http://localhost:5000/api';

// ===== TOAST NOTIFICATION COMPONENT =====
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch(type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getBackground = () => {
    switch(type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#667eea';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: getBackground(),
      color: 'white',
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      zIndex: 10001,
      animation: 'slideIn 0.3s ease-out',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: '300px',
      maxWidth: '450px'
    }}>
      <span style={{ fontSize: '1.5rem' }}>{getIcon()}</span>
      <span style={{ flex: 1, fontSize: '0.95rem' }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'transparent',
        border: 'none',
        color: 'white',
        fontSize: '1.2rem',
        cursor: 'pointer',
        padding: '0 5px'
      }}>×</button>
    </div>
  );
}

// ===== MAIN APP COMPONENT =====
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCurrentPage('home');
    showToast('Logged out successfully!', 'success');
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      <Navbar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      />
      <div style={styles.page}>
        {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} showToast={showToast} />}
        {currentPage === 'register' && (
          <RegisterPage
            setCurrentPage={setCurrentPage}
            setToken={setToken}
            setUser={setUser}
            API_BASE={API_BASE}
            setUnverifiedEmail={setUnverifiedEmail}
            showToast={showToast}
          />
        )}
        {currentPage === 'login' && (
          <LoginPage
            setCurrentPage={setCurrentPage}
            setToken={setToken}
            setUser={setUser}
            API_BASE={API_BASE}
            showToast={showToast}
          />
        )}
        {currentPage === 'packages' && <PackagesPage API_BASE={API_BASE} setCurrentPage={setCurrentPage} showToast={showToast} />}
        {currentPage === 'consultation' && (
          <ConsultationPage 
            token={token} 
            user={user} 
            setCurrentPage={setCurrentPage}
            API_BASE={API_BASE}
            showToast={showToast}
          />
        )}
        {currentPage === 'saved' && token && (
          <SavedRequestsPage token={token} API_BASE={API_BASE} setCurrentPage={setCurrentPage} showToast={showToast} />
        )}
        {currentPage === 'appointments' && token && (
          <MyAppointmentsPage 
            token={token} 
            API_BASE={API_BASE}
            setCurrentPage={setCurrentPage}  
            showToast={showToast}
          />
        )}
        {currentPage === 'ai-chat' && (
          <AIChatPage token={token} setCurrentPage={setCurrentPage} API_BASE={API_BASE} showToast={showToast} />
        )}
        {currentPage === 'verify' && (
          <VerifyEmailPage
            setCurrentPage={setCurrentPage}
            setToken={setToken}
            setUser={setUser}
            API_BASE={API_BASE}
            email={unverifiedEmail}
            showToast={showToast}
          />
        )}
        {currentPage === 'general-booking' && token && (
          <GeneralBookingPage 
            token={token} 
            setCurrentPage={setCurrentPage} 
            API_BASE={API_BASE} 
            showToast={showToast}
          />
        )}
        {currentPage === 'schedule' && token && user?.email === 'sureen130@gmail.com' && (
          <AdminSchedulePage token={token} API_BASE={API_BASE} setCurrentPage={setCurrentPage} showToast={showToast} />
        )}
      </div>
    </div>
  );
}

// ===== STYLES =====
const styles = {
  app: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: '#f0f2f5',
    minHeight: '100vh',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  page: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
    animation: 'fadeIn 0.5s ease-out',
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(styleSheet);

// ===== NAVBAR =====
function Navbar({ currentPage, setCurrentPage, user, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav style={navbarStyles.navbar}>
      <div style={navbarStyles.container}>
        <div style={navbarStyles.logo} onClick={() => setCurrentPage('home')}>
          <span style={navbarStyles.logoIcon}>✈️</span>
          <span style={navbarStyles.logoText}>SmartTravel</span>
        </div>
        
        <button style={navbarStyles.mobileMenuBtn} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>☰</button>

        <div style={{...navbarStyles.menu, ...(isMobileMenuOpen && navbarStyles.menuMobile)}}>
          <button style={{...navbarStyles.navBtn, ...(currentPage === 'packages' && navbarStyles.navBtnActive)}} onClick={() => { setCurrentPage('packages'); setIsMobileMenuOpen(false); }}>🌍 Packages</button>
          <button style={{...navbarStyles.navBtn, ...(currentPage === 'consultation' && navbarStyles.navBtnActive)}} onClick={() => { setCurrentPage('consultation'); setIsMobileMenuOpen(false); }}>🤖 AI Consultant</button>
          <button style={{...navbarStyles.navBtn, ...(currentPage === 'ai-chat' && navbarStyles.navBtnActive)}} onClick={() => { setCurrentPage('ai-chat'); setIsMobileMenuOpen(false); }}>💬 AI Chat</button>
          {user && (
            <>
              <button style={{...navbarStyles.navBtn, ...(currentPage === 'saved' && navbarStyles.navBtnActive)}} onClick={() => { setCurrentPage('saved'); setIsMobileMenuOpen(false); }}>💾 Saved</button>
              <button style={{...navbarStyles.navBtn, ...(currentPage === 'appointments' && navbarStyles.navBtnActive)}} onClick={() => { setCurrentPage('appointments'); setIsMobileMenuOpen(false); }}>📅 My Appointments</button>
              <button style={{...navbarStyles.navBtn, ...(currentPage === 'general-booking' && navbarStyles.navBtnActive)}} onClick={() => { setCurrentPage('general-booking'); setIsMobileMenuOpen(false); }}>📅 Quick Booking</button>
              {user.email === 'sureen10@gmail.com' && (
                <button style={{...navbarStyles.navBtn, ...(currentPage === 'schedule' && navbarStyles.navBtnActive)}} onClick={() => { setCurrentPage('schedule'); setIsMobileMenuOpen(false); }}>📊 Admin Schedule</button>
              )}
            </>
          )}
          {user ? (
            <div style={navbarStyles.userSection}>
              <span style={navbarStyles.userName}>👋 {user.name}</span>
              <button style={navbarStyles.logoutBtn} onClick={onLogout}>Logout</button>
            </div>
          ) : (
            <div style={navbarStyles.authButtons}>
              <button style={navbarStyles.loginBtn} onClick={() => { setCurrentPage('login'); setIsMobileMenuOpen(false); }}>Login</button>
              <button style={navbarStyles.signupBtn} onClick={() => { setCurrentPage('register'); setIsMobileMenuOpen(false); }}>Sign Up</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const navbarStyles = {
  navbar: { background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 1000 },
  container: { maxWidth: '1400px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' },
  logo: { display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold' },
  logoIcon: { fontSize: '1.8rem' },
  logoText: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' },
  mobileMenuBtn: { display: 'none', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#333' },
  menu: { 
    display: 'flex', 
    gap: '0.5rem',  
    alignItems: 'center', 
    flexWrap: 'nowrap',  
    overflowX: 'auto',  
  },
  menuMobile: { display: 'flex', flexDirection: 'column', position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', padding: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 999 },
  navBtn: { 
    padding: '0.5rem 1rem',  
    border: 'none', 
    background: 'transparent', 
    color: '#4a5568', 
    fontSize: '0.9rem',  
    fontWeight: '500', 
    cursor: 'pointer', 
    borderRadius: '8px', 
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',  
  },
  navBtnActive: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' },
  userSection: { display: 'flex', alignItems: 'center', gap: '0.8rem', marginLeft: '1rem', flexShrink: 0 },  
  userName: { color: '#4a5568', fontWeight: '500', whiteSpace: 'nowrap' },
  logoutBtn: { padding: '0.5rem 1rem', border: 'none', background: '#ef4444', color: 'white', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' },
  authButtons: { display: 'flex', gap: '0.8rem', flexShrink: 0 },
  loginBtn: { padding: '0.5rem 1rem', border: '2px solid #667eea', background: 'transparent', color: '#667eea', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', whiteSpace: 'nowrap' },
  signupBtn: { padding: '0.5rem 1rem', border: 'none', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', whiteSpace: 'nowrap' },
};

// ===== HOME PAGE =====
function HomePage({ setCurrentPage, showToast }) {
  return (
    <div>
      <div style={homeStyles.hero}>
        <h1 style={homeStyles.heroTitle}>Discover Your Perfect <span style={homeStyles.gradientText}>Getaway</span></h1>
        <p style={homeStyles.heroSubtitle}>AI-powered travel recommendations tailored to your preferences</p>
        <div style={homeStyles.heroButtons}>
          <button style={homeStyles.primaryBtn} onClick={() => setCurrentPage('consultation')}>🤖 Get AI Recommendations</button>
          <button style={homeStyles.secondaryBtn} onClick={() => setCurrentPage('packages')}>🌍 Browse Packages</button>
          <button style={homeStyles.aiBtn} onClick={() => setCurrentPage('ai-chat')}>💬 Chat with AI Assistant</button>
        </div>
      </div>
      <div style={homeStyles.stats}>
        <div style={homeStyles.statCard}><div style={homeStyles.statNumber}>100+</div><div style={homeStyles.statLabel}>Travel Packages</div></div>
        <div style={homeStyles.statCard}><div style={homeStyles.statNumber}>50+</div><div style={homeStyles.statLabel}>Destinations</div></div>
        <div style={homeStyles.statCard}><div style={homeStyles.statNumber}>10k+</div><div style={homeStyles.statLabel}>Happy Travelers</div></div>
      </div>
      <div style={homeStyles.features}>
        <div style={homeStyles.featureCard}><div style={homeStyles.featureIcon}>🎯</div><h3>Smart Matching</h3><p>AI analyzes your preferences and recommends perfect packages</p></div>
        <div style={homeStyles.featureCard}><div style={homeStyles.featureIcon}>🌍</div><h3>Global Coverage</h3><p>Explore curated packages across all continents</p></div>
        <div style={homeStyles.featureCard}><div style={homeStyles.featureIcon}>💾</div><h3>Save & Plan</h3><p>Create an account to save your favorite recommendations</p></div>
      </div>
    </div>
  );
}

const homeStyles = {
  hero: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center', color: 'white', marginBottom: '3rem' },
  heroTitle: { fontSize: '3rem', marginBottom: '1rem', fontWeight: '700' },
  gradientText: { background: 'linear-gradient(135deg, #ffd89b 0%, #8d989f )', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' },
  heroSubtitle: { fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.95 },
  heroButtons: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: { padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: '600', border: 'none', borderRadius: '50px', background: 'white', color: '#667eea', cursor: 'pointer' },
  secondaryBtn: { padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: '600', border: '2px solid white', borderRadius: '50px', background: 'transparent', color: 'white', cursor: 'pointer' },
  aiBtn: { padding: '0.8rem 2rem', fontSize: '1rem', fontWeight: '600', border: '2px solid white', borderRadius: '50px', background: 'rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' },
  statCard: { background: 'white', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  statNumber: { fontSize: '2rem', fontWeight: 'bold', color: '#667eea', marginBottom: '0.5rem' },
  statLabel: { color: '#6c757d', fontSize: '0.9rem' },
  features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' },
  featureCard: { background: 'white', padding: '2rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  featureIcon: { fontSize: '3rem', marginBottom: '1rem' },
};

// ===== AUTH STYLES =====
const authStyles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' },
  card: { background: 'white', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px' },
  title: { fontSize: '1.8rem', textAlign: 'center', marginBottom: '0.5rem', color: '#2d3748' },
  subtitle: { textAlign: 'center', color: '#718096', marginBottom: '2rem' },
  input: { width: '100%', padding: '0.8rem', margin: '0.5rem 0', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' },
  submitBtn: { width: '100%', padding: '0.8rem', marginTop: '1rem', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  error: { background: '#fed7d7', color: '#c53030', padding: '0.8rem', borderRadius: '10px', marginBottom: '1rem', textAlign: 'center' },
  footer: { textAlign: 'center', marginTop: '1.5rem', color: '#718096' },
  link: { color: '#667eea', cursor: 'pointer', fontWeight: '600' },
};

// ===== REGISTER PAGE WITH LIVE PASSWORD VALIDATION =====
function RegisterPage({ setCurrentPage, setToken, setUser, API_BASE, setUnverifiedEmail, showToast }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const validatePasswordLive = (password) => {
    setPasswordValidation({
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
    return passwordValidation;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    validatePasswordLive(newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if password meets all requirements
    const isValid = Object.values(passwordValidation).every(v => v === true);
    if (!isValid) {
      setError('Please meet all password requirements');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setRegisteredEmail(data.email);
        setUnverifiedEmail(data.email);
        showToast('Registration successful! Check your email for verification code.', 'success');
        setTimeout(() => setCurrentPage('verify'), 1500);
      } else {
        setError(data.error || 'Registration failed');
        showToast(data.error || 'Registration failed', 'error');
      }
    } catch (err) {
      setError('Cannot connect to server');
      showToast('Cannot connect to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={authStyles.container}>
        <div style={authStyles.card}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: '3rem'}}>📧</div>
            <h2 style={authStyles.title}>Check Your Email</h2>
            <p style={authStyles.subtitle}>We've sent a <strong>6-digit verification code</strong> to:<br/><strong style={{color: '#667eea'}}>{registeredEmail}</strong></p>
            <p>Please enter the code on the next screen to complete registration.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={authStyles.container}>
      <div style={authStyles.card}>
        <h2 style={authStyles.title}>Create Account</h2>
        <p style={authStyles.subtitle}>Join us and start your journey</p>
        {error && <div style={authStyles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Full Name *" style={authStyles.input} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <input type="email" placeholder="Email *" style={authStyles.input} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          
          <input type="password" placeholder="Password *" style={authStyles.input} value={formData.password} onChange={handlePasswordChange} required />
          
          {/* Live password requirements */}
          <div style={{ margin: '0.5rem 0 1rem 0', fontSize: '0.85rem', background: '#f8f9fa', padding: '0.8rem', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '0.8rem' }}>Password must contain:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>{passwordValidation.length ? '✅' : '❌'}</span>
                <span>At least 6 characters</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>{passwordValidation.uppercase ? '✅' : '❌'}</span>
                <span>One uppercase letter</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>{passwordValidation.lowercase ? '✅' : '❌'}</span>
                <span>One lowercase letter</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>{passwordValidation.number ? '✅' : '❌'}</span>
                <span>One number</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>{passwordValidation.special ? '✅' : '❌'}</span>
                <span>One special character (!@#$%^&*)</span>
              </div>
            </div>
          </div>
          
          <button type="submit" disabled={loading} style={authStyles.submitBtn}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p style={authStyles.footer}>Already have an account? <span style={authStyles.link} onClick={() => setCurrentPage('login')}>Login</span></p>
      </div>
    </div>
  );
}

// ===== VERIFY EMAIL PAGE =====
function VerifyEmailPage({ setCurrentPage, setToken, setUser, API_BASE, email, showToast }) {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = [];

  useEffect(() => {
    let timer;
    if (countdown > 0) timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    if (value && index < 5) inputRefs[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) inputRefs[index - 1]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullCode = verificationCode.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fullCode })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast('🎉 Email verified successfully! Welcome aboard!', 'success');
        setCurrentPage('home');
      } else {
        setError(data.error || 'Invalid or expired verification code');
        showToast(data.error || 'Invalid verification code', 'error');
      }
    } catch (err) {
      setError('Cannot connect to server');
      showToast('Cannot connect to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResendLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        showToast('📧 New verification code sent!', 'success');
        setCountdown(60);
        setVerificationCode(['', '', '', '', '', '']);
        setError('');
      } else {
        const data = await response.json();
        showToast(data.error || 'Error sending code', 'error');
      }
    } catch (err) {
      showToast('Error sending code', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={authStyles.container}>
      <div style={authStyles.card}>
        <h2 style={authStyles.title}>Verify Your Email</h2>
        <p style={authStyles.subtitle}>Enter the 6-digit code sent to:<br/><strong>{email}</strong></p>
        {error && <div style={authStyles.error}>{error}</div>}
        <form onSubmit={handleVerify}>
          <div style={codeStyles.container}>
            {verificationCode.map((digit, index) => (
              <input key={index} ref={(el) => inputRefs[index] = el} type="text" maxLength="1" style={codeStyles.input} value={digit} onChange={(e) => handleCodeChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)} autoFocus={index === 0} />
            ))}
          </div>
          <button type="submit" disabled={loading} style={authStyles.submitBtn}>{loading ? 'Verifying...' : 'Verify Email'}</button>
        </form>
        <p style={authStyles.footer}>Didn't receive code? <span style={{...authStyles.link, ...(countdown > 0 && { opacity: 0.5, cursor: 'not-allowed' })}} onClick={handleResend}>{resendLoading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}</span></p>
        <p style={authStyles.footer}><span style={authStyles.link} onClick={() => setCurrentPage('login')}>Back to Login</span></p>
      </div>
    </div>
  );
}

const codeStyles = {
  container: { display: 'flex', gap: '0.8rem', justifyContent: 'center', marginBottom: '1.5rem' },
  input: { width: '50px', height: '60px', textAlign: 'center', fontSize: '1.8rem', fontWeight: 'bold', border: '2px solid #e2e8f0', borderRadius: '12px', background: 'white' },
};

// ===== LOGIN PAGE (FIXED) =====
function LoginPage({ setCurrentPage, setToken, setUser, API_BASE, showToast }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast(`Welcome back, ${data.user.name}! ✨`, 'success');
        setCurrentPage('home');
      } else {
        setError(data.error || 'Login failed');
        showToast(data.error || 'Login failed', 'error');
      }
    } catch (err) {
      setError('Cannot connect to server');
      showToast('Cannot connect to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authStyles.container}>
      <div style={authStyles.card}>
        <h2 style={authStyles.title}>Welcome Back</h2>
        <p style={authStyles.subtitle}>Login to continue your journey</p>
        {error && <div style={authStyles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email" 
            style={authStyles.input} 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            style={authStyles.input} 
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            required 
          />
          <button 
            type="submit" 
            disabled={loading} 
            style={authStyles.submitBtn}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={authStyles.footer}>
          Don't have an account? 
          <span style={authStyles.link} onClick={() => setCurrentPage('register')}> Sign Up</span>
        </p>
      </div>
    </div>
  );
}

// ===== PACKAGES PAGE STYLES =====
const packagesStyles = {
  header: { textAlign: 'center', marginBottom: '2rem' },
  title: { fontSize: '2rem', color: '#2d3748', marginBottom: '0.5rem' },
  subtitle: { color: '#718096' },
  filters: { display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' },
  searchInput: { flex: 1, padding: '0.8rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' },
  filterSelect: { padding: '0.8rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', background: 'white' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' },
  card: { background: 'white', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  packageName: { fontSize: '1.2rem', color: '#2d3748' },
  price: { fontSize: '1.3rem', fontWeight: 'bold' },
  location: { color: '#718096', marginBottom: '0.8rem' },
  tags: { display: 'flex', gap: '0.5rem' },
  typeTag: { background: '#e2e8f0', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: '#4a5568' },
  durationTag: { background: '#e2e8f0', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: '#4a5568' },
  details: { marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' },
  bookBtn: { width: '100%', padding: '0.8rem', marginTop: '1rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  loading: { textAlign: 'center', padding: '3rem', color: '#718096' },
  empty: { textAlign: 'center', padding: '3rem', color: '#718096' },
};

// ===== PACKAGES PAGE =====
function PackagesPage({ API_BASE, setCurrentPage, showToast }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/packages`).then(res => res.json()).then(data => { setPackages(data.packages || []); setLoading(false); }).catch(err => { console.error(err); setLoading(false); showToast('Failed to load packages', 'error'); });
  }, [API_BASE]);

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = searchTerm === '' || pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) || pkg.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || pkg.type === selectedType;
    return matchesSearch && matchesType;
  });

  const types = ['relaxation', 'adventure', 'shopping', 'family', 'luxury'];
  if (loading) return <div style={packagesStyles.loading}>Loading amazing packages...</div>;

  return (
    <div>
      <div style={packagesStyles.header}><h1 style={packagesStyles.title}>Explore Travel Packages</h1><p style={packagesStyles.subtitle}>Find your perfect destination</p></div>
      <div style={packagesStyles.filters}>
        <input type="text" placeholder="🔍 Search by destination..." style={packagesStyles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select style={packagesStyles.filterSelect} value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <option value="">All Types</option>
          {types.map(type => (<option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>))}
        </select>
      </div>
      <div style={packagesStyles.grid}>{filteredPackages.map(pkg => (<PackageCard key={pkg.id} package={pkg} setCurrentPage={setCurrentPage} API_BASE={API_BASE} showToast={showToast} />))}</div>
      {filteredPackages.length === 0 && (<div style={packagesStyles.empty}><p>No packages found. Try adjusting your filters.</p></div>)}
    </div>
  );
}

function PackageCard({ package: pkg, setCurrentPage, API_BASE, showToast }) {
  const [expanded, setExpanded] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const getPriceColor = (price) => { if (price < 1000) return '#10b981'; if (price < 2500) return '#f59e0b'; return '#ef4444'; };

  return (
    <>
      <div style={packagesStyles.card}>
        <div style={packagesStyles.cardHeader} onClick={() => setExpanded(!expanded)}>
          <h3 style={packagesStyles.packageName}>{pkg.name}</h3>
          <span style={{...packagesStyles.price, color: getPriceColor(pkg.price)}}>${pkg.price}</span>
        </div>
        <p style={packagesStyles.location} onClick={() => setExpanded(!expanded)}>{pkg.city}, {pkg.country}</p>
        <div style={packagesStyles.tags} onClick={() => setExpanded(!expanded)}>
          <span style={packagesStyles.typeTag}>{pkg.type}</span>
          <span style={packagesStyles.durationTag}>{pkg.duration} days</span>
        </div>
        {expanded && pkg.highlights && (
          <div style={packagesStyles.details}>
            <h4>🌟 Highlights:</h4>
            <ul>{pkg.highlights.map((h, i) => (<li key={i}>{h}</li>))}</ul>
            <button style={packagesStyles.bookBtn} onClick={(e) => { e.stopPropagation(); setShowBookingModal(true); }}>📅 Book This Package & Schedule Meeting</button>
          </div>
        )}
      </div>
      {showBookingModal && (<BookingModal package={pkg} onClose={() => setShowBookingModal(false)} token={localStorage.getItem('token')} API_BASE={API_BASE} setCurrentPage={setCurrentPage} showToast={showToast} />)}
    </>
  );
}

// ===== CONSULTATION PAGE =====
function ConsultationPage({ token, setCurrentPage, API_BASE, showToast }) {
  const [formData, setFormData] = useState({ budget: '', travelType: '', duration: '', travelers: '' });
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/consultation/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setRecommendation(data);
      showToast('AI found your perfect match! 🎯', 'success');
    } catch (err) { showToast('Error: ' + err.message, 'error'); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!token) { setCurrentPage('login'); showToast('Please login to save recommendations', 'warning'); return; }
    try {
      const response = await fetch(`${API_BASE}/consultation/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, packageId: recommendation.recommended_package.id })
      });
      if (response.ok) { showToast('Saved successfully! 💾', 'success'); setCurrentPage('saved'); }
    } catch (err) { showToast('Error saving: ' + err.message, 'error'); }
  };

  const handleBookNow = () => {
    setSelectedPackage(recommendation.recommended_package);
    setShowBookingModal(true);
  };

  if (recommendation) {
    return (
      <>
        <div style={consultStyles.result}>
          <div style={consultStyles.resultCard}>
            <h2 style={consultStyles.resultTitle}>🎯 Your Perfect Match!</h2>
            <h3 style={consultStyles.packageName}>{recommendation.recommended_package?.name}</h3>
            <p style={consultStyles.location}>{recommendation.recommended_package?.city}, {recommendation.recommended_package?.country}</p>
            <div style={consultStyles.priceTag}>${recommendation.recommended_package?.price}</div>
            <p style={consultStyles.reason}>{recommendation.reason}</p>
            <div style={consultStyles.confidence}>Confidence: {recommendation.confidence_score}%</div>
            <div style={consultStyles.buttons}>
              <button style={consultStyles.saveBtn} onClick={handleSave}>💾 Save This</button>
              <button style={consultStyles.bookBtn} onClick={handleBookNow}>📅 Book Now</button>
              <button style={consultStyles.newBtn} onClick={() => setRecommendation(null)}>🔄 New Search</button>
            </div>
          </div>
        </div>
        {showBookingModal && selectedPackage && (
          <BookingModal 
            package={selectedPackage} 
            onClose={() => setShowBookingModal(false)} 
            token={token} 
            API_BASE={API_BASE} 
            setCurrentPage={setCurrentPage} 
            showToast={showToast}
          />
        )}
      </>
    );
  }

  return (
    <div style={consultStyles.container}>
      <div style={consultStyles.header}><h1 style={consultStyles.title}>AI Travel Consultant</h1><p style={consultStyles.subtitle}>Tell us what you're looking for</p></div>
      <form onSubmit={handleSubmit} style={consultStyles.form}>
        <input type="number" placeholder="💰 Budget (USD)" style={consultStyles.input} value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} required />
        <select style={consultStyles.input} value={formData.travelType} onChange={(e) => setFormData({...formData, travelType: e.target.value})} required>
          <option value="">🎯 Select Travel Type</option>
          <option value="relaxation">🏖️ Relaxation</option><option value="adventure">🏔️ Adventure</option>
          <option value="shopping">🛍️ Shopping</option><option value="family">👨‍👩‍👧‍👦 Family</option><option value="luxury">✨ Luxury</option>
        </select>
        <input type="number" placeholder="📅 Duration (days)" style={consultStyles.input} value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} required />
        <input type="number" placeholder="👥 Number of Travelers" style={consultStyles.input} value={formData.travelers} onChange={(e) => setFormData({...formData, travelers: e.target.value})} required />
        <button type="submit" disabled={loading} style={consultStyles.submitBtn}>{loading ? 'Analyzing...' : 'Get AI Recommendations ✨'}</button>
      </form>
    </div>
  );
}

const consultStyles = {
  container: { maxWidth: '600px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '2rem' },
  title: { fontSize: '2rem', color: '#2d3748', marginBottom: '0.5rem' },
  subtitle: { color: '#718096' },
  form: { background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  input: { width: '100%', padding: '0.8rem', margin: '0.5rem 0', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' },
  submitBtn: { width: '100%', padding: '1rem', marginTop: '1rem', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer' },
  result: { maxWidth: '600px', margin: '0 auto' },
  resultCard: { background: 'white', padding: '2rem', borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  resultTitle: { color: '#667eea', marginBottom: '1rem' },
  packageName: { fontSize: '1.5rem', color: '#2d3748', marginBottom: '0.5rem' },
  location: { color: '#718096', marginBottom: '1rem' },
  priceTag: { fontSize: '2rem', fontWeight: 'bold', color: '#667eea', marginBottom: '1rem' },
  reason: { background: '#f0f2f5', padding: '1rem', borderRadius: '10px', marginBottom: '1rem' },
  confidence: { color: '#10b981', marginBottom: '1rem' },
  buttons: { display: 'flex', gap: '1rem', justifyContent: 'center' },
  saveBtn: { padding: '0.8rem 1.5rem', border: 'none', borderRadius: '10px', background: '#10b981', color: 'white', cursor: 'pointer' },
  bookBtn: { padding: '0.8rem 1.5rem', border: 'none', borderRadius: '10px', background: '#667eea', color: 'white', cursor: 'pointer' },
  newBtn: { padding: '0.8rem 1.5rem', border: '2px solid #667eea', borderRadius: '10px', background: 'transparent', color: '#667eea', cursor: 'pointer' },
};

// ===== SAVED REQUESTS PAGE =====
function SavedRequestsPage({ token, API_BASE, setCurrentPage, showToast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchSavedRequests();
    fetchSavedRecommendations();
  }, [token, API_BASE]);

  const fetchSavedRequests = async () => {
    try {
      const response = await fetch(`${API_BASE}/user/requests`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) { console.error(err); showToast('Failed to load saved items', 'error'); } finally { setLoading(false); }
  };

  const fetchSavedRecommendations = async () => {
    try {
      const response = await fetch(`${API_BASE}/ai/saved-recommendations`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const data = await response.json();
      if (data.recommendations) {
        setRequests(prev => [...prev, ...data.recommendations]);
      }
    } catch (err) { console.error(err); }
  };

  const handleBookFromRequest = (request) => {
    const destinationMatch = request.recommendationData?.match(/\*\*Recommended Destination:\*\* (.*)/);
    const priceMatch = request.recommendationData?.match(/\*\*Estimated Cost:\*\* \$(\d+)/);
    
    const pkg = {
      id: request.packageId || 'custom',
      name: destinationMatch ? destinationMatch[1] : (request.packageName || 'Custom Travel Package'),
      price: priceMatch ? parseInt(priceMatch[1]) : (request.budget || 1000),
      duration: request.duration || 5,
      city: 'Custom Destination',
      country: 'Various'
    };
    setSelectedRequest(pkg);
    setShowBookingModal(true);
  };

  if (loading) return <div style={packagesStyles.loading}>Loading your saved items...</div>;

  return (
    <div>
      <div style={packagesStyles.header}>
        <h1 style={packagesStyles.title}>My Saved Items</h1>
        <p style={packagesStyles.subtitle}>Your personalized travel recommendations and consultations</p>
      </div>
      
      {requests.length === 0 ? (
        <div style={packagesStyles.empty}>
          <p>No saved items yet. Get AI recommendations and save them here!</p>
          <button style={{...packagesStyles.bookBtn, width: 'auto', marginTop: '1rem'}} onClick={() => setCurrentPage('ai-chat')}>
            🤖 Get AI Recommendations
          </button>
        </div>
      ) : (
        <div style={packagesStyles.grid}>
          {requests.map(req => (
            <div key={req.id} style={packagesStyles.card}>
              <div style={packagesStyles.cardHeader}>
                <h3>{req.packageName || req.recommendationData?.match(/\*\*Recommended Destination:\*\* (.*)/)?.[1] || 'AI Recommendation'}</h3>
              </div>
              <div style={packagesStyles.details}>
                {req.budget && <p><strong>💰 Budget:</strong> ${req.budget}</p>}
                {req.travelType && <p><strong>🎯 Type:</strong> {req.travelType}</p>}
                {req.duration && <p><strong>📅 Duration:</strong> {req.duration} days</p>}
                {req.travelers && <p><strong>👥 Travelers:</strong> {req.travelers}</p>}
                {req.recommendationData && (
                  <div style={{marginTop: '0.5rem', fontSize: '0.9rem', color: '#4a5568'}}>
                    {req.recommendationData.split('\n').slice(0, 3).map((line, i) => (
                      <p key={i} style={{margin: '2px 0'}}>{line.replace(/\*\*/g, '')}</p>
                    ))}
                  </div>
                )}
                <p><strong>📅 Saved:</strong> {req.savedAt ? new Date(req.savedAt).toLocaleDateString() : req.timestamp ? new Date(req.timestamp).toLocaleDateString() : 'N/A'}</p>
              </div>
              <button 
                style={packagesStyles.bookBtn}
                onClick={() => handleBookFromRequest(req)}
              >
                📅 Book This Trip
              </button>
            </div>
          ))}
        </div>
      )}
      
      {showBookingModal && selectedRequest && (
        <BookingModal 
          package={selectedRequest} 
          onClose={() => setShowBookingModal(false)} 
          token={token} 
          API_BASE={API_BASE} 
          setCurrentPage={setCurrentPage} 
          showToast={showToast}
        />
      )}
    </div>
  );
}

// ===== AI CHAT PAGE =====
function AIChatPage({ token, setCurrentPage, API_BASE, showToast }) {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I\'m your AI travel assistant. Ask me about destinations, best times to visit, or tell me your preferences for a personalized recommendation! ✈️' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({ budget: '', travelType: '', duration: '', travelers: '' });
  const [aiRecommendation, setAiRecommendation] = useState(null);

  const formatBotMessage = (content) => {
    if (!content) return '';
    
    let formatted = content;
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/^[•\-*]\s+(.*?)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*?<\/li>\n?)+/gs, (match) => {
      return `<ul style="margin: 8px 0; padding-left: 20px;">${match}</ul>`;
    });
    const paragraphs = formatted.split('\n\n');
    formatted = paragraphs.map(para => {
      if (para.trim().startsWith('<ul>')) return para;
      if (para.trim().startsWith('<li>')) return `<ul>${para}</ul>`;
      if (para.trim()) return `<p style="margin: 8px 0;">${para.replace(/\n/g, '<br/>')}</p>`;
      return '';
    }).join('');
    formatted = formatted.replace(/<\/ul>\s*<ul>/g, '');
    return formatted;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/ai/advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'bot', content: data.advice, formatted: true }]);
      
      if (userMessage.toLowerCase().includes('recommend') || userMessage.toLowerCase().includes('suggest') || userMessage.toLowerCase().includes('where should i go')) {
        setShowPreferences(true);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I encountered an error. Please try again.' }]);
      showToast('AI service error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendation = async () => {
    if (!preferences.budget || !preferences.travelType) {
      showToast('Please fill in budget and travel type', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/ai/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences })
      });
      const data = await response.json();
      setAiRecommendation(data.recommendation);
      setMessages(prev => [...prev, { role: 'bot', content: data.recommendation, isRecommendation: true }]);
      setShowPreferences(false);
      showToast('AI generated your personalized recommendation! ✨', 'success');
    } catch (err) {
      showToast('Error getting recommendation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveRecommendation = async () => {
    if (!token) {
      setCurrentPage('login');
      showToast('Please login to save recommendations', 'warning');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/ai/save-recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ recommendationData: aiRecommendation })
      });
      if (response.ok) {
        showToast('Recommendation saved! You can book it from your saved items.', 'success');
        setAiRecommendation(null);
      }
    } catch (err) {
      showToast('Error saving', 'error');
    }
  };

  const bookFromRecommendation = () => {
    if (!token) {
      setCurrentPage('login');
      showToast('Please login to book', 'warning');
      return;
    }
    const match = aiRecommendation?.match(/\*\*Recommended Destination:\*\* (.*)/);
    const destination = match ? match[1] : 'Custom Destination';
    const priceMatch = aiRecommendation?.match(/\*\*Estimated Cost:\*\* \$(\d+)/);
    const price = priceMatch ? parseInt(priceMatch[1]) : 1000;
    
    const customPackage = {
      id: 'ai-recommendation',
      name: destination,
      price: price,
      duration: preferences.duration || 5,
      city: destination.split(',')[0] || 'Various',
      country: destination.split(',')[1] || 'Destination'
    };
    
    setCurrentPage('general-booking');
  };

  return (
    <div style={chatStyles.container}>
      <div style={chatStyles.header}>
        <h1 style={chatStyles.title}>💬 AI Travel Assistant</h1>
        <p style={chatStyles.subtitle}>Get personalized travel advice and recommendations</p>
      </div>
      
      <div style={chatStyles.chatContainer}>
        <div style={chatStyles.messagesArea}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{...chatStyles.message, ...(msg.role === 'user' ? chatStyles.userMessage : chatStyles.botMessage)}}>
              <div style={{...chatStyles.messageContent, ...(msg.role === 'user' && { background: '#667eea', color: 'white' })}}>
                {msg.role === 'bot' ? (
                  <div dangerouslySetInnerHTML={{ __html: formatBotMessage(msg.content) }} />
                ) : (
                  <div style={{whiteSpace: 'pre-wrap'}}>{msg.content}</div>
                )}
              </div>
            </div>
          ))}
          {loading && (<div style={chatStyles.botMessage}><div style={chatStyles.typing}>🤖 Thinking...</div></div>)}
        </div>
        
        <div style={chatStyles.inputArea}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Ask about destinations, seasons, activities..." style={chatStyles.input} />
          <button onClick={sendMessage} style={chatStyles.sendBtn} disabled={loading}>Send</button>
        </div>
      </div>

      {showPreferences && (
        <div style={prefStyles.overlay}>
          <div style={prefStyles.modal}>
            <h3 style={prefStyles.title}>Tell me about your perfect trip</h3>
            <input type="number" placeholder="Budget (USD)" style={prefStyles.input} value={preferences.budget} onChange={(e) => setPreferences({...preferences, budget: e.target.value})} />
            <select style={prefStyles.input} value={preferences.travelType} onChange={(e) => setPreferences({...preferences, travelType: e.target.value})}>
              <option value="">Select Travel Type</option>
              <option value="relaxation">🏖️ Relaxation</option><option value="adventure">🏔️ Adventure</option>
              <option value="shopping">🛍️ Shopping</option><option value="family">👨‍👩‍👧‍👦 Family</option><option value="luxury">✨ Luxury</option>
            </select>
            <input type="number" placeholder="Duration (days)" style={prefStyles.input} value={preferences.duration} onChange={(e) => setPreferences({...preferences, duration: e.target.value})} />
            <input type="number" placeholder="Number of travelers" style={prefStyles.input} value={preferences.travelers} onChange={(e) => setPreferences({...preferences, travelers: e.target.value})} />
            <div style={prefStyles.buttons}>
              <button style={prefStyles.submitBtn} onClick={getRecommendation}>Get Recommendation</button>
              <button style={prefStyles.cancelBtn} onClick={() => setShowPreferences(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {aiRecommendation && !showPreferences && (
        <div style={prefStyles.overlay}>
          <div style={{...prefStyles.modal, maxWidth: '500px'}}>
            <h3 style={prefStyles.title}>✨ Your Personalized Recommendation</h3>
            <div style={{...chatStyles.messageContent, background: '#f0f2f5', marginBottom: '1rem'}} dangerouslySetInnerHTML={{ __html: formatBotMessage(aiRecommendation) }} />
            <div style={prefStyles.buttons}>
              <button style={{...prefStyles.submitBtn, background: '#10b981'}} onClick={saveRecommendation}>💾 Save</button>
              <button style={{...prefStyles.submitBtn, background: '#667eea'}} onClick={bookFromRecommendation}>📅 Book Consultation</button>
              <button style={prefStyles.cancelBtn} onClick={() => setAiRecommendation(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const chatStyles = {
  container: { maxWidth: '900px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '2rem' },
  title: { fontSize: '2rem', color: '#2d3748', marginBottom: '0.5rem' },
  subtitle: { color: '#718096' },
  chatContainer: { background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden' },
  messagesArea: { height: '500px', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  message: { display: 'flex', maxWidth: '80%' },
  userMessage: { justifyContent: 'flex-end', alignSelf: 'flex-end' },
  botMessage: { justifyContent: 'flex-start', alignSelf: 'flex-start' },
  messageContent: { padding: '0.8rem 1.2rem', borderRadius: '18px', fontSize: '0.95rem', lineHeight: '1.5', background: '#f0f2f5' },
  typing: { padding: '0.8rem 1.2rem', background: '#f0f2f5', borderRadius: '18px', color: '#718096' },
  inputArea: { display: 'flex', padding: '1rem', borderTop: '1px solid #e2e8f0', gap: '0.5rem' },
  input: { flex: 1, padding: '0.8rem', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '0.95rem' },
  sendBtn: { padding: '0.8rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '500' },
};

const prefStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
  modal: { background: 'white', borderRadius: '20px', padding: '2rem', width: '90%', maxWidth: '450px' },
  title: { fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748', textAlign: 'center' },
  input: { width: '100%', padding: '0.8rem', margin: '0.5rem 0', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' },
  buttons: { display: 'flex', gap: '1rem', marginTop: '1rem' },
  submitBtn: { flex: 1, padding: '0.8rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '500' },
  cancelBtn: { flex: 1, padding: '0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '500' },
};

// ===== GENERAL BOOKING PAGE WITH NORMALIZED DATES =====
function GeneralBookingPage({ token, setCurrentPage, API_BASE, showToast }) {
  const [bookingData, setBookingData] = useState({
    travelerName: '',
    email: '',
    phone: '',
    meetingDate: '',
    meetingTime: '',
    specialRequests: '',
    travelers: 1,
    destination: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setBookingData(prev => ({
          ...prev,
          travelerName: data.user.name,
          email: data.user.email
        }));
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (bookingData.meetingDate) { fetchAvailableSlots(); }
  }, [bookingData.meetingDate]);

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(`${API_BASE}/bookings/available-slots?date=${bookingData.meetingDate}`);
      const data = await response.json();
      setAvailableSlots(data.availableSlots || []);
    } catch (err) { console.error('Error fetching slots:', err); }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startDayOfWeek; i++) { days.push(null); }
    for (let i = 1; i <= lastDay.getDate(); i++) { days.push(new Date(year, month, i)); }
    return days;
  };

  const isDateAvailable = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    if (date.getDay() === 0 || date.getDay() === 6) return false;
    return true;
  };

  // ✅ FIXED: Normalize date without timezone issues
  const handleDateSelect = (date) => {
    if (date && isDateAvailable(date)) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      setBookingData({ ...bookingData, meetingDate: dateStr, meetingTime: '' });
      setSelectedDate(date);
    }
  };

  const handleChange = (e) => { setBookingData({ ...bookingData, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { setCurrentPage('login'); showToast('Please login to book', 'warning'); return; }
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/bookings/direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          message: `Travel consultation request for ${bookingData.destination || 'unspecified destination'}. Notes: ${bookingData.notes}`,
          meetingDate: bookingData.meetingDate,
          meetingTime: bookingData.meetingTime,
          packageName: `Custom Trip to ${bookingData.destination || 'Various Destinations'}`,
          travelers: bookingData.travelers,
          phone: bookingData.phone
        })
      });
      const data = await response.json();
      if (response.ok) {
        showToast('✅ Consultation booked successfully! We will contact you within 24 hours.', 'success');
        setCurrentPage('appointments');
      } else { 
        setError(data.error || 'Booking failed. Please try again.');
        showToast(data.error || 'Booking failed', 'error');
      }
    } catch (err) { 
      setError('Cannot connect to server. Please try again later.');
      showToast('Cannot connect to server', 'error');
    } finally { 
      setLoading(false);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = getDaysInMonth(currentMonth);

  return (
    <div style={consultStyles.container}>
      <div style={consultStyles.header}>
        <h1 style={consultStyles.title}>📅 Book a Travel Consultation</h1>
        <p style={consultStyles.subtitle}>Schedule a meeting with our travel experts</p>
      </div>
      
      <form onSubmit={handleSubmit} style={consultStyles.form}>
        {error && <div style={authStyles.error}>{error}</div>}
        
        <input type="text" name="travelerName" placeholder="Full Name *" style={consultStyles.input} value={bookingData.travelerName} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email Address *" style={consultStyles.input} value={bookingData.email} onChange={handleChange} required />
        <input type="tel" name="phone" placeholder="Phone Number *" style={consultStyles.input} value={bookingData.phone} onChange={handleChange} required />
        
        <input type="text" name="destination" placeholder="✈️ Desired Destination (optional)" style={consultStyles.input} value={bookingData.destination} onChange={handleChange} />
        
        <input type="number" name="travelers" placeholder="👥 Number of Travelers *" style={consultStyles.input} value={bookingData.travelers} onChange={handleChange} min="1" max="20" required />
        
        <textarea name="notes" placeholder="📝 Additional notes or special requests" style={{...consultStyles.input, minHeight: '80px'}} value={bookingData.notes} onChange={handleChange} />
        
        <div style={calendarStyles.container}>
          <div style={calendarStyles.header}>
            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>←</button>
            <span>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>→</button>
          </div>
          <div style={calendarStyles.weekdays}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (<div key={day} style={calendarStyles.weekday}>{day}</div>))}
          </div>
          <div style={calendarStyles.days}>
            {days.map((date, idx) => (
              <div key={idx} style={calendarStyles.dayCell}>
                {date && (
                  <button type="button" onClick={() => handleDateSelect(date)} style={{
                    ...calendarStyles.dayButton,
                    ...(selectedDate && date.toDateString() === selectedDate.toDateString() && calendarStyles.selectedDay),
                    ...(!isDateAvailable(date) && calendarStyles.disabledDay)
                  }} disabled={!isDateAvailable(date)}>
                    {date.getDate()}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {bookingData.meetingDate && (
          <div style={timeSlotStyles.container}>
            <h4>Select Time Slot</h4>
            <div style={timeSlotStyles.grid}>
              {availableSlots.map(slot => (
                <button type="button" key={slot} onClick={() => setBookingData({...bookingData, meetingTime: slot})} style={{
                  ...timeSlotStyles.slot,
                  ...(bookingData.meetingTime === slot && timeSlotStyles.selectedSlot)
                }}>{slot}</button>
              ))}
            </div>
            {availableSlots.length === 0 && <p style={{color: '#ef4444'}}>No available slots for this date</p>}
          </div>
        )}

        <button type="submit" disabled={loading || !bookingData.meetingDate || !bookingData.meetingTime} style={consultStyles.submitBtn}>
          {loading ? 'Processing...' : '✅ Confirm Consultation Meeting'}
        </button>
      </form>
    </div>
  );
}

// ===== MY APPOINTMENTS PAGE =====
function MyAppointmentsPage({ token, API_BASE, setCurrentPage, showToast }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { 
    fetchAppointments(); 
  }, [token]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE}/user/appointments`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err) { 
      console.error('Error:', err);
      setError('Failed to load appointments');
      showToast('Failed to load appointments', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const response = await fetch(`${API_BASE}/appointments/${id}`, { 
          method: 'DELETE', 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (response.ok) { 
          showToast('Appointment cancelled successfully', 'success');
          fetchAppointments();
        } else { 
          const error = await response.json();
          showToast(error.error || 'Failed to cancel appointment', 'error');
        }
      } catch (err) { 
        showToast('Error cancelling appointment', 'error');
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6c757d';
    }
  };

  if (loading) return <div style={packagesStyles.loading}>Loading your appointments...</div>;

  return (
    <div>
      <div style={packagesStyles.header}>
        <h1 style={packagesStyles.title}>My Appointments</h1>
        <p style={packagesStyles.subtitle}>Manage your travel consultations</p>
      </div>
      
      {error && <div style={authStyles.error}>{error}</div>}
      
      {appointments.length === 0 ? (
        <div style={packagesStyles.empty}>
          <p>No appointments yet. Book a consultation to get started!</p>
          <button 
            style={{...packagesStyles.bookBtn, width: 'auto', marginTop: '1rem', padding: '0.8rem 2rem'}} 
            onClick={() => setCurrentPage('consultation')}
          >
            📅 Book a Consultation
          </button>
        </div>
      ) : (
        <div style={appointmentsStyles.grid}>
          {appointments.map(apt => (
            <div key={apt.id} style={appointmentsStyles.card}>
              <div style={appointmentsStyles.cardHeader}>
                <h3>{apt.packageName || 'Custom Package'}</h3>
                <span style={{...appointmentsStyles.status, backgroundColor: getStatusColor(apt.status)}}>
                  {apt.status}
                </span>
              </div>
              
              <div style={appointmentsStyles.details}>
                <p><strong>📅 Date:</strong> {apt.meetingDate ? new Date(apt.meetingDate).toLocaleDateString() : 'To be scheduled'}</p>
                <p><strong>⏰ Time:</strong> {apt.meetingTime || 'To be determined'}</p>
                <p><strong>👥 Travelers:</strong> {apt.travelers || 1}</p>
                <p><strong>📞 Phone:</strong> {apt.phone || 'Not provided'}</p>
              </div>
              
              {apt.userRequest && (
                <div style={appointmentsStyles.request}>
                  <strong>Your request:</strong>
                  <p>{apt.userRequest}</p>
                </div>
              )}
              
              {apt.specialRequests && (
                <div style={appointmentsStyles.request}>
                  <strong>Special Requests:</strong>
                  <p>{apt.specialRequests}</p>
                </div>
              )}
              
              {apt.status !== 'cancelled' && (
                <div style={appointmentsStyles.actions}>
                  <button 
                    style={appointmentsStyles.editBtn} 
                    onClick={() => { 
                      setEditingAppointment(apt); 
                      setShowEditModal(true); 
                    }}
                  >
                    ✏️ Edit Date/Time
                  </button>
                  <button 
                    style={appointmentsStyles.cancelBtn} 
                    onClick={() => handleCancel(apt.id)}
                  >
                    ❌ Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {showEditModal && editingAppointment && (
        <EditAppointmentModal 
          appointment={editingAppointment} 
          onClose={() => { 
            setShowEditModal(false); 
            setEditingAppointment(null); 
          }} 
          onUpdate={async (id, date, time) => {
            try {
              const response = await fetch(`${API_BASE}/appointments/${id}`, { 
                method: 'PUT', 
                headers: { 
                  'Content-Type': 'application/json', 
                  'Authorization': `Bearer ${token}` 
                }, 
                body: JSON.stringify({ meetingDate: date, meetingTime: time }) 
              });
              
              if (response.ok) { 
                const data = await response.json();
                showToast('Appointment updated successfully', 'success');
                if (data.releasedSlot) {
                  console.log(`Slot ${data.releasedSlot.time} on ${data.releasedSlot.date} is now available`);
                }
                setShowEditModal(false); 
                fetchAppointments();
              } else { 
                const error = await response.json();
                showToast(error.error || 'Failed to update appointment', 'error');
              }
            } catch (err) { 
              showToast('Error updating appointment', 'error');
            }
          }} 
          API_BASE={API_BASE}
          showToast={showToast}
        />
      )}
    </div>
  );
}

// ===== EDIT APPOINTMENT MODAL =====
function EditAppointmentModal({ appointment, onClose, onUpdate, API_BASE, showToast }) {
  const [meetingDate, setMeetingDate] = useState(appointment.meetingDate || '');
  const [meetingTime, setMeetingTime] = useState(appointment.meetingTime || '');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(meetingDate ? new Date(meetingDate) : null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (meetingDate) { fetchAvailableSlots(); }
  }, [meetingDate]);

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(`${API_BASE}/bookings/available-slots?date=${meetingDate}`);
      const data = await response.json();
      setAvailableSlots(data.availableSlots || []);
    } catch (err) { console.error('Error fetching slots:', err); }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startDayOfWeek; i++) { days.push(null); }
    for (let i = 1; i <= lastDay.getDate(); i++) { days.push(new Date(year, month, i)); }
    return days;
  };

  const isDateAvailable = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    if (date.getDay() === 0 || date.getDay() === 6) return false;
    return true;
  };

  // ✅ FIXED: Normalize date without timezone
  const handleDateSelect = (date) => {
    if (date && isDateAvailable(date)) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      setMeetingDate(dateStr);
      setSelectedDate(date);
      setMeetingTime('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (meetingDate && meetingTime) {
      setLoading(true);
      await onUpdate(appointment.id, meetingDate, meetingTime);
      setLoading(false);
      onClose();
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = getDaysInMonth(currentMonth);

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={{...modalStyles.modal, maxWidth: '600px'}} onClick={(e) => e.stopPropagation()}>
        <button style={modalStyles.closeBtn} onClick={onClose}>✕</button>
        <h2 style={modalStyles.title}>Edit Appointment</h2>
        <p style={modalStyles.packageInfo}>{appointment.packageName || 'Custom Package'}</p>
        
        <form onSubmit={handleSubmit}>
          <div style={calendarStyles.container}>
            <div style={calendarStyles.header}>
              <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>←</button>
              <span>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
              <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>→</button>
            </div>
            <div style={calendarStyles.weekdays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (<div key={day} style={calendarStyles.weekday}>{day}</div>))}
            </div>
            <div style={calendarStyles.days}>
              {days.map((date, idx) => (
                <div key={idx} style={calendarStyles.dayCell}>
                  {date && (
                    <button type="button" onClick={() => handleDateSelect(date)} style={{
                      ...calendarStyles.dayButton,
                      ...(selectedDate && date.toDateString() === selectedDate.toDateString() && calendarStyles.selectedDay),
                      ...(!isDateAvailable(date) && calendarStyles.disabledDay)
                    }} disabled={!isDateAvailable(date)}>
                      {date.getDate()}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {meetingDate && (
            <div style={timeSlotStyles.container}>
              <h4>Select Time Slot</h4>
              <div style={timeSlotStyles.grid}>
                {availableSlots.map(slot => (
                  <button type="button" key={slot} onClick={() => setMeetingTime(slot)} style={{
                    ...timeSlotStyles.slot,
                    ...(meetingTime === slot && timeSlotStyles.selectedSlot)
                  }}>{slot}</button>
                ))}
              </div>
              {availableSlots.length === 0 && <p style={{color: '#ef4444'}}>No available slots for this date</p>}
            </div>
          )}
          
          <button type="submit" disabled={!meetingDate || !meetingTime || loading} style={{...modalStyles.submitBtn, marginTop: '1rem'}}>
            {loading ? 'Updating...' : 'Update Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ===== ADMIN SCHEDULE PAGE =====
function AdminSchedulePage({ token, API_BASE, setCurrentPage, showToast }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailySchedule, setDailySchedule] = useState([]);

  useEffect(() => {
    fetchAllAppointments();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchScheduleForDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchAllAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE}/appointments/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleForDate = async (date) => {
    try {
      const response = await fetch(`${API_BASE}/schedule/${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDailySchedule(data.appointments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const getGroupedAppointments = () => {
    const grouped = {};
    appointments.forEach(apt => {
      const date = apt.meetingDate;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(apt);
    });
    return grouped;
  };

  if (loading) return <div style={packagesStyles.loading}>Loading schedule...</div>;

  return (
    <div>
      <div style={packagesStyles.header}>
        <h1 style={packagesStyles.title}>📊 Admin Schedule</h1>
        <p style={packagesStyles.subtitle}>View and manage all travel consultations</p>
      </div>

      <div style={adminScheduleStyles.container}>
        <div style={adminScheduleStyles.dateSelector}>
          <label>Select Date:</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={adminScheduleStyles.dateInput}
          />
        </div>

        <div style={adminScheduleStyles.scheduleCard}>
          <h2>Schedule for {new Date(selectedDate).toLocaleDateString()}</h2>
          {dailySchedule.length === 0 ? (
            <p style={adminScheduleStyles.noAppointments}>No appointments scheduled for this date</p>
          ) : (
            <div style={adminScheduleStyles.scheduleList}>
              {dailySchedule.map(apt => (
                <div key={apt.id} style={adminScheduleStyles.scheduleItem}>
                  <div style={adminScheduleStyles.scheduleTime}>{apt.time}</div>
                  <div style={adminScheduleStyles.scheduleDetails}>
                    <div><strong>Client:</strong> {apt.userName}</div>
                    <div><strong>Email:</strong> {apt.userEmail}</div>
                    <div><strong>Package:</strong> {apt.packageName}</div>
                    {apt.specialRequests && <div><strong>Requests:</strong> {apt.specialRequests}</div>}
                    <div><strong>Status:</strong> <span style={{color: apt.status === 'pending' ? '#f59e0b' : '#10b981'}}>{apt.status}</span></div>
                    {apt.source && <div><strong>Source:</strong> {apt.source === 'packages_page' ? 'Package Booking' : 'Direct Consultation'}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={adminScheduleStyles.summaryCard}>
          <h2>Summary</h2>
          <div style={adminScheduleStyles.summaryStats}>
            <div style={adminScheduleStyles.stat}>
              <div style={adminScheduleStyles.statNumber}>{appointments.length}</div>
              <div style={adminScheduleStyles.statLabel}>Total Appointments</div>
            </div>
            <div style={adminScheduleStyles.stat}>
              <div style={adminScheduleStyles.statNumber}>{Object.keys(getGroupedAppointments()).length}</div>
              <div style={adminScheduleStyles.statLabel}>Days with Bookings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const adminScheduleStyles = {
  container: { maxWidth: '900px', margin: '0 auto' },
  dateSelector: { background: 'white', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' },
  dateInput: { padding: '0.5rem', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem' },
  scheduleCard: { background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' },
  scheduleList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  scheduleItem: { display: 'flex', padding: '1rem', borderBottom: '1px solid #e2e8f0', gap: '1rem' },
  scheduleTime: { minWidth: '80px', fontWeight: 'bold', color: '#667eea', fontSize: '1.1rem' },
  scheduleDetails: { flex: 1 },
  noAppointments: { textAlign: 'center', color: '#718096', padding: '2rem' },
  summaryCard: { background: 'white', borderRadius: '16px', padding: '1.5rem' },
  summaryStats: { display: 'flex', gap: '2rem', justifyContent: 'space-around' },
  stat: { textAlign: 'center' },
  statNumber: { fontSize: '2rem', fontWeight: 'bold', color: '#667eea' },
  statLabel: { color: '#718096', fontSize: '0.9rem' },
};

const calendarStyles = {
  container: { background: 'white', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  weekdays: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '0.5rem' },
  weekday: { fontWeight: 'bold', color: '#4a5568', padding: '0.5rem' },
  days: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' },
  dayCell: { aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dayButton: { width: '100%', height: '100%', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem' },
  selectedDay: { background: '#667eea', color: 'white' },
  disabledDay: { background: '#e2e8f0', color: '#a0aec0', cursor: 'not-allowed', opacity: 0.5 },
};

const timeSlotStyles = {
  container: { marginTop: '1rem', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' },
  slot: { padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer' },
  selectedSlot: { background: '#667eea', color: 'white', borderColor: '#667eea' },
};

const appointmentsStyles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' },
  card: { background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' },
  status: { padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', color: 'white' },
  details: { margin: '1rem 0' },
  request: { background: '#f0f2f5', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  actions: { display: 'flex', gap: '0.8rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' },
  editBtn: { flex: 1, padding: '0.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
};

// ===== BOOKING MODAL =====
function BookingModal({ package: pkg, onClose, token, API_BASE, setCurrentPage, showToast }) {
  const [bookingData, setBookingData] = useState({
    travelerName: '',
    email: '',
    phone: '',
    meetingDate: '',
    meetingTime: '',
    specialRequests: '',
    travelers: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setBookingData(prev => ({
          ...prev,
          travelerName: data.user.name,
          email: data.user.email
        }));
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (bookingData.meetingDate) { fetchAvailableSlots(); }
  }, [bookingData.meetingDate]);

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(`${API_BASE}/bookings/available-slots?date=${bookingData.meetingDate}`);
      const data = await response.json();
      setAvailableSlots(data.availableSlots || []);
    } catch (err) { console.error('Error fetching slots:', err); }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startDayOfWeek; i++) { days.push(null); }
    for (let i = 1; i <= lastDay.getDate(); i++) { days.push(new Date(year, month, i)); }
    return days;
  };

  const isDateAvailable = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    if (date.getDay() === 0 || date.getDay() === 6) return false;
    return true;
  };

  // ✅ FIXED: Normalize date without timezone issues
  const handleDateSelect = (date) => {
    if (date && isDateAvailable(date)) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      setBookingData({ ...bookingData, meetingDate: dateStr, meetingTime: '' });
      setSelectedDate(date);
    }
  };

  const handleChange = (e) => { setBookingData({ ...bookingData, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/bookings/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          packageId: pkg.id, 
          ...bookingData, 
          packageName: pkg.name, 
          packagePrice: pkg.price, 
          bookingDate: new Date().toISOString() 
        })
      });
      const data = await response.json();
      if (response.ok) {
        showToast('✅ Booking request sent successfully! We will contact you within 24 hours.', 'success');
        onClose();
        if (token) { setCurrentPage('appointments'); }
      } else { 
        setError(data.error || 'Booking failed. Please try again.');
        showToast(data.error || 'Booking failed', 'error');
      }
    } catch (err) { 
      setError('Cannot connect to server. Please try again later.');
      showToast('Cannot connect to server', 'error');
    } finally { 
      setLoading(false);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = getDaysInMonth(currentMonth);

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={{...modalStyles.modal, maxWidth: '650px'}} onClick={(e) => e.stopPropagation()}>
        <button style={modalStyles.closeBtn} onClick={onClose}>✕</button>
        <h2 style={modalStyles.title}>Book Your Adventure</h2>
        <p style={modalStyles.packageInfo}>{pkg.name} - ${pkg.price} | {pkg.duration} days</p>
        {error && <div style={modalStyles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input type="text" name="travelerName" placeholder="Full Name *" style={modalStyles.input} value={bookingData.travelerName} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email Address *" style={modalStyles.input} value={bookingData.email} onChange={handleChange} required />
          <input type="tel" name="phone" placeholder="Phone Number *" style={modalStyles.input} value={bookingData.phone} onChange={handleChange} required />
          <input type="number" name="travelers" placeholder="Number of Travelers *" style={modalStyles.input} value={bookingData.travelers} onChange={handleChange} min="1" max="20" required />
          
          <div style={calendarStyles.container}>
            <div style={calendarStyles.header}>
              <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>←</button>
              <span>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
              <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>→</button>
            </div>
            <div style={calendarStyles.weekdays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (<div key={day} style={calendarStyles.weekday}>{day}</div>))}
            </div>
            <div style={calendarStyles.days}>
              {days.map((date, idx) => (
                <div key={idx} style={calendarStyles.dayCell}>
                  {date && (
                    <button type="button" onClick={() => handleDateSelect(date)} style={{
                      ...calendarStyles.dayButton,
                      ...(selectedDate && date.toLocaleDateString() === selectedDate.toLocaleDateString() && calendarStyles.selectedDay),
                      ...(!isDateAvailable(date) && calendarStyles.disabledDay)
                    }} disabled={!isDateAvailable(date)}>
                      {date.getDate()}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {bookingData.meetingDate && (
            <div style={timeSlotStyles.container}>
              <h4>Select Time Slot</h4>
              <div style={timeSlotStyles.grid}>
                {availableSlots.map(slot => (
                  <button type="button" key={slot} onClick={() => setBookingData({...bookingData, meetingTime: slot})} style={{
                    ...timeSlotStyles.slot,
                    ...(bookingData.meetingTime === slot && timeSlotStyles.selectedSlot)
                  }}>{slot}</button>
                ))}
              </div>
              {availableSlots.length === 0 && <p style={{color: '#ef4444'}}>No available slots for this date</p>}
            </div>
          )}

          <textarea name="specialRequests" placeholder="Special Requests (dietary, accessibility, etc.)" style={modalStyles.textarea} value={bookingData.specialRequests} onChange={handleChange} rows="3" />
          <button type="submit" disabled={loading || !bookingData.meetingDate || !bookingData.meetingTime} style={modalStyles.submitBtn}>
            {loading ? 'Processing...' : 'Confirm Booking & Schedule Meeting ✨'}
          </button>
        </form>
        <p style={modalStyles.note}>📞 Our travel expert will contact you to confirm the meeting and discuss all details</p>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
  modal: { background: 'white', borderRadius: '24px', padding: '2rem', maxWidth: '550px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' },
  closeBtn: { position: 'absolute', top: '1rem', right: '1rem', background: '#f0f2f5', border: 'none', fontSize: '1.3rem', cursor: 'pointer', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: '1.8rem', color: '#2d3748', marginBottom: '0.5rem', textAlign: 'center' },
  packageInfo: { textAlign: 'center', color: '#667eea', fontWeight: '500', marginBottom: '1.5rem', padding: '0.5rem', background: '#f0f2f5', borderRadius: '10px' },
  input: { padding: '0.8rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '0.95rem', width: '100%', marginBottom: '0.5rem' },
  textarea: { padding: '0.8rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', width: '100%', marginBottom: '0.5rem' },
  submitBtn: { padding: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', width: '100%' },
  error: { background: '#fed7d7', color: '#c53030', padding: '0.8rem', borderRadius: '10px', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1rem' },
  note: { fontSize: '0.8rem', color: '#718096', textAlign: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' },
};

export default App;