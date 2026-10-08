import React from 'react';
import { Scissors, LogOut, Plus, Sparkles, Bell } from 'lucide-react';

export default function Navbar({ user, onLogout, onOpenNewAppointment, alertCount }) {
  const getRoleLabel = () => {
    if (user.role === 'mary') return 'Manicurista Principal';
    if (user.role === 'sharith') return 'Gestión de Insumos & Maletín';
    return 'Administración General';
  };

  const getAvatarInitials = () => {
    if (user.role === 'mary') return 'M';
    if (user.role === 'sharith') return 'S';
    return 'A';
  };

  return (
    <nav className="app-navbar">
      <div className="navbar-inner">
        <div className="brand-section">
          <div className="brand-icon-sm">
            <Scissors size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="brand-title">Mary Nails</span>
              <span className="brand-badge">Sistema Inteligente</span>
            </div>
          </div>
        </div>

        <div className="nav-actions">
          <button
            className="btn-primary btn-sm-action"
            onClick={onOpenNewAppointment}
          >
            <Plus size={16} />
            <span>Nueva Cita</span>
          </button>

          <div className="user-profile-pill">
            <div className="avatar">{getAvatarInitials()}</div>
            <div className="user-info">
              <span className="user-name">{user.fullName}</span>
              <span className="user-role-text">{getRoleLabel()}</span>
            </div>
          </div>

          <button
            className="btn-secondary btn-sm-action"
            onClick={onLogout}
            title="Cerrar Sesión"
          >
            <LogOut size={16} />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
