import React, { useState } from 'react';
import { Users, Sparkles, TrendingUp, Heart, CheckCircle2, Clock, MapPin, Award, ShieldAlert, ShoppingBag, Star, RefreshCw } from 'lucide-react';

export default function PanelDiferenciado({ user, appointments, supplies, showToast }) {
  const [selectedRoleTab, setSelectedRoleTab] = useState(user.role);

  const maryAppointments = appointments.filter(a => a.assignedTo.includes('Mary'));
  const sharithAppointments = appointments.filter(a => a.assignedTo.includes('Sharith'));

  const maryEarnings = maryAppointments.reduce((sum, a) => sum + a.price, 0);
  const sharithEarnings = sharithAppointments.reduce((sum, a) => sum + a.price, 0);
  const totalEarnings = appointments.reduce((sum, a) => sum + a.price, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="card-title">
            <Users size={24} color="var(--primary-rose)" />
            <span>Panel Diferenciado de Trabajo</span>
          </h2>
          <p className="card-subtitle">
            Vistas especializadas adaptadas a las funciones de Mary, Sharith y Administración
          </p>
        </div>

        {/* Dynamic Role Switcher */}
        <div style={{ background: '#FFFFFF', padding: '0.4rem', borderRadius: '999px', border: '1px solid var(--card-border)', display: 'flex', gap: '0.4rem' }}>
          <button
            className={`chip-btn ${selectedRoleTab === 'mary' ? 'active' : ''}`}
            style={{ background: selectedRoleTab === 'mary' ? 'var(--primary-rose)' : 'transparent', color: selectedRoleTab === 'mary' ? '#FFF' : 'var(--text-main)', border: 'none' }}
            onClick={() => setSelectedRoleTab('mary')}
          >
            💖 Panel Mary
          </button>
          <button
            className={`chip-btn ${selectedRoleTab === 'sharith' ? 'active' : ''}`}
            style={{ background: selectedRoleTab === 'sharith' ? 'var(--primary-rose)' : 'transparent', color: selectedRoleTab === 'sharith' ? '#FFF' : 'var(--text-main)', border: 'none' }}
            onClick={() => setSelectedRoleTab('sharith')}
          >
            💅 Panel Sharith
          </button>
          <button
            className={`chip-btn ${selectedRoleTab === 'admin' ? 'active' : ''}`}
            style={{ background: selectedRoleTab === 'admin' ? 'var(--primary-rose)' : 'transparent', color: selectedRoleTab === 'admin' ? '#FFF' : 'var(--text-main)', border: 'none' }}
            onClick={() => setSelectedRoleTab('admin')}
          >
            👑 Visión Admin
          </button>
        </div>
      </div>

      {/* VIEW 1: MARY'S PANEL */}
      {selectedRoleTab === 'mary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="alert-banner" style={{ background: 'linear-gradient(135deg, #FFF0F3 0%, #FDE8EC 100%)', borderColor: '#F8C2CB' }}>
            <div className="alert-icon-box" style={{ background: 'var(--primary-rose)', color: '#FFF' }}>
              <Heart size={24} />
            </div>
            <div className="alert-content">
              <div className="alert-title" style={{ color: 'var(--primary-rose)' }}>
                ¡Bienvenida Mary! Tienes {maryAppointments.length} citas asignadas para hoy
              </div>
              <div className="alert-desc" style={{ color: 'var(--text-main)' }}>
                Tu primera atención inicia a las <strong>09:00 AM</strong> con Sra. Elena Gómez. Tu kit de esmaltes signature se encuentra empacado y verificado.
              </div>
            </div>
          </div>

          <div className="grid-3">
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Citas Asignadas</span>
                <Clock size={20} color="var(--primary-rose)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{maryAppointments.length}</div>
              <div style={{ fontSize: '0.8rem', color: '#2E7D32', marginTop: '0.25rem' }}>
                3 Confirmadas · 1 Finalizada
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Recaudo Estimado Hoy</span>
                <TrendingUp size={20} color="var(--primary-rose)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-rose)' }}>
                ${maryEarnings.toLocaleString('es-CO')}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Promedio $48.500 por atención
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Calificación Clientes</span>
                <Star size={20} color="#FFB300" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>4.98 ★</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                48 Reseñas de 5 estrellas
              </div>
            </div>
          </div>

          {/* Today's Route for Mary */}
          <div className="glass-card">
            <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
              <MapPin size={20} color="var(--primary-rose)" />
              <span>Mi Ruta de Atención a Domicilio Hoy</span>
            </h3>
            <p className="card-subtitle">Secuencia recomendada de traslados para optimizar el tiempo</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {maryAppointments.map((app, index) => (
                <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#FFF9FA', borderRadius: '14px', border: '1px solid var(--card-border)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-rose)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem' }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{app.clientName}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{app.address} · {app.time}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-rose)' }}>{app.service}</div>
                    <div style={{ fontSize: '0.78rem', color: '#2E7D32', fontWeight: '600' }}>{app.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SHARITH'S PANEL */}
      {selectedRoleTab === 'sharith' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="alert-banner" style={{ background: 'linear-gradient(135deg, #FFF8E1 0%, #FFF3E0 100%)', borderColor: '#FFE082' }}>
            <div className="alert-icon-box" style={{ background: '#FB8C00', color: '#FFF' }}>
              <ShoppingBag size={24} />
            </div>
            <div className="alert-content">
              <div className="alert-title" style={{ color: '#E65100' }}>
                ¡Bienvenida Sharith! Control de Insumos & Maletín Portátil
              </div>
              <div className="alert-desc" style={{ color: '#4E342E' }}>
                Tienes a cargo la verificación de stock y recarga de insumos antes del despacho de rutas de manicura.
              </div>
            </div>
          </div>

          <div className="grid-3">
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Citas Asignadas</span>
                <Clock size={20} color="var(--primary-rose)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{sharithAppointments.length}</div>
              <div style={{ fontSize: '0.8rem', color: '#E65100', marginTop: '0.25rem' }}>
                2 En preparación de maletín
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Insumos Verificados</span>
                <CheckCircle2 size={20} color="#2E7D32" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2E7D32' }}>
                {supplies.filter(s => s.percentage > 25).length} / {supplies.length}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                85% en estado óptimo
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Recaudo Estimado</span>
                <TrendingUp size={20} color="var(--primary-rose)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-rose)' }}>
                ${sharithEarnings.toLocaleString('es-CO')}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Servicios programados hoy
              </div>
            </div>
          </div>

          {/* Checklist de Maletín Portátil */}
          <div className="glass-card">
            <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
              <CheckCircle2 size={20} color="var(--primary-rose)" />
              <span>Checklist de Preparación de Maletín Antes de Salir</span>
            </h3>
            <p className="card-subtitle">Puntos clave de control para garantizar atenciones de alta calidad</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#F8F9FA', borderRadius: '12px', border: '1px solid #E9ECEF' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>🔋 Lámpara LED/UV Recargable</div>
                <div style={{ fontSize: '0.82rem', color: '#2E7D32', fontWeight: '600' }}>✔ Batería al 90% (Suficiente para 8 citas)</div>
              </div>

              <div style={{ padding: '1rem', background: '#F8F9FA', borderRadius: '12px', border: '1px solid #E9ECEF' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>✨ Esterilización de Instrumental</div>
                <div style={{ fontSize: '0.82rem', color: '#2E7D32', fontWeight: '600' }}>✔ 4 Kits de alicates y empujadores sellados</div>
              </div>

              <div style={{ padding: '1rem', background: '#F8F9FA', borderRadius: '12px', border: '1px solid #E9ECEF' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>🎨 Paleta de Esmaltes de Tendencia</div>
                <div style={{ fontSize: '0.82rem', color: '#E65100', fontWeight: '600' }}>⚠️ Esmalte Nude al 15% - requiere recarga</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: ADMIN PANEL */}
      {selectedRoleTab === 'admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="grid-3">
            <div className="glass-card">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Citas del Día</span>
              <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {appointments.length} Citas
              </div>
              <div style={{ fontSize: '0.8rem', color: '#2E7D32', marginTop: '0.25rem' }}>100% Cobertura agendada</div>
            </div>

            <div className="glass-card">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Ingreso Proyectado Hoy</span>
              <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--primary-rose)', marginTop: '0.2rem' }}>
                ${totalEarnings.toLocaleString('es-CO')}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Mary: ${maryEarnings.toLocaleString('es-CO')} · Sharith: ${sharithEarnings.toLocaleString('es-CO')}</div>
            </div>

            <div className="glass-card">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Satisfacción General</span>
              <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#FFB300', marginTop: '0.2rem' }}>
                4.9 / 5.0 ★
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>96% Retención de clientes</div>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
              <TrendingUp size={20} color="var(--primary-rose)" />
              <span>Servicios Más Solicitados este Mes</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                  <span>Manicura Rusa + Gel Semipermanente</span>
                  <span>65% (42 Citas)</span>
                </div>
                <div className="progress-bar-bg"><div className="progress-bar-fill normal" style={{ width: '65%' }}></div></div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                  <span>Pedicura Spá + Reflexología</span>
                  <span>22% (14 Citas)</span>
                </div>
                <div className="progress-bar-bg"><div className="progress-bar-fill normal" style={{ width: '22%' }}></div></div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                  <span>Decoración Nail Art Premium</span>
                  <span>13% (8 Citas)</span>
                </div>
                <div className="progress-bar-bg"><div className="progress-bar-fill warning" style={{ width: '13%' }}></div></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
