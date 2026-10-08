import React, { useState } from 'react';
import { Calendar, Briefcase, Users, Eye, EyeOff, Scissors, ArrowRight } from 'lucide-react';

export default function LoginView({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Por favor ingresa un usuario (ej. mary, sharith o admin)');
      return;
    }
    
    let role = 'admin';
    let fullName = 'Administrador';
    const lowerUser = username.trim().toLowerCase();
    
    if (lowerUser.includes('mary')) {
      role = 'mary';
      fullName = 'Mary Angélica';
    } else if (lowerUser.includes('sharith')) {
      role = 'sharith';
      fullName = 'Sharith Stefany';
    }

    onLogin({ username: lowerUser, role, fullName });
  };

  const handleQuickLogin = (userRole, name) => {
    onLogin({ username: userRole, role: userRole, fullName: name });
  };

  return (
    <div className="login-screen">
      <div className="bg-ambient">
        <div className="blob-1"></div>
        <div className="blob-2"></div>
      </div>

      <div className="login-grid">
        {/* Left Branding Hero Section */}
        <div className="login-hero">
          <div className="logo-badge">
            <Scissors size={38} strokeWidth={1.8} />
          </div>

          <h1 className="hero-title">Mary Nails System</h1>
          <p className="hero-subtitle">
            Gestión inteligente para tu negocio de manicura a domicilio
          </p>

          <div className="features-list">
            <div className="feature-pill">
              <div className="feature-pill-icon">
                <Calendar size={17} />
              </div>
              <span>Agenda y citas en tiempo real</span>
            </div>

            <div className="feature-pill">
              <div className="feature-pill-icon">
                <Briefcase size={17} />
              </div>
              <span>Maletín inteligente con alertas predictivas</span>
            </div>

            <div className="feature-pill">
              <div className="feature-pill-icon">
                <Users size={17} />
              </div>
              <span>Panel diferenciado para Mary y Sharith</span>
            </div>
          </div>
        </div>

        {/* Right Login Form Section */}
        <div className="login-form-side">
          <div className="form-header">
            <h2 className="form-title">Bienvenida</h2>
            <p className="form-subtitle">Ingresa tus credenciales para continuar</p>
          </div>

          {error && (
            <div style={{
              background: '#FFEBEE',
              color: '#C62828',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              border: '1px solid #FFCDD2'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username-input">Usuario</label>
              <div className="form-input-wrapper">
                <input
                  id="username-input"
                  type="text"
                  className="form-input"
                  placeholder="Escribe: mary · sharith · admin"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password-input">Contraseña</label>
              <div className="form-input-wrapper">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Recordarme</span>
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Para recuperar tu contraseña contacta a soporte técnico de Mary Nails System.'); }} className="forgot-link">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" className="btn-primary">
              <span>Iniciar Sesión</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick Demo Login Chips */}
          <div className="quick-roles">
            <div className="quick-roles-title">Acceso Rápido Demo</div>
            <div className="role-chips">
              <button
                className="chip-btn"
                onClick={() => handleQuickLogin('mary', 'Mary Angélica')}
              >
                💖 Mary (Manicurista)
              </button>
              <button
                className="chip-btn"
                onClick={() => handleQuickLogin('sharith', 'Sharith Stefany')}
              >
                💅 Sharith (Maletín & Insumos)
              </button>
              <button
                className="chip-btn"
                onClick={() => handleQuickLogin('admin', 'Administrador')}
              >
                👑 Admin (Control Total)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
