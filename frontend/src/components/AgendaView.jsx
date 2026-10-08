import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Phone, User, CheckCircle2, Navigation, Plus, Search, Filter } from 'lucide-react';

export default function AgendaView({ appointments, onUpdateStatus, onOpenNewAppointment, showToast }) {
  const [techFilter, setTechFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAppointments = appointments.filter(app => {
    const matchesTech = techFilter === 'all' || app.assignedTo.toLowerCase() === techFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || app.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = app.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTech && matchesStatus && matchesSearch;
  });

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmada': return 'status-badge confirmada';
      case 'en camino': return 'status-badge encamino';
      case 'en proceso': return 'status-badge enproceso';
      case 'finalizada': return 'status-badge finalizada';
      default: return 'status-badge';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus.toLowerCase()) {
      case 'confirmada': return 'En Camino';
      case 'en camino': return 'En Proceso';
      case 'en proceso': return 'Finalizada';
      default: return 'Finalizada';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Metrics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="card-title">
            <Calendar size={24} color="var(--primary-rose)" />
            <span>Agenda & Citas en Tiempo Real</span>
          </h2>
          <p className="card-subtitle">
            Monitoreo y coordinación de servicio de manicura a domicilio para hoy
          </p>
        </div>

        <button className="btn-primary" onClick={onOpenNewAppointment}>
          <Plus size={18} />
          <span>Agendar Nueva Cita</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid-4">
        <div className="glass-card" style={{ padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#FFF0F3', padding: '0.8rem', borderRadius: '14px', color: 'var(--primary-rose)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.1' }}>
              {appointments.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Citas Programadas</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#E8F5E9', padding: '0.8rem', borderRadius: '14px', color: '#2E7D32' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#2E7D32', lineHeight: '1.1' }}>
              {appointments.filter(a => a.status === 'Confirmada').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confirmadas</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#FFF3E0', padding: '0.8rem', borderRadius: '14px', color: '#E65100' }}>
            <Navigation size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#E65100', lineHeight: '1.1' }}>
              {appointments.filter(a => a.status === 'En Camino' || a.status === 'En Proceso').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>En Ruta / Atención</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#F3E5F5', padding: '0.8rem', borderRadius: '14px', color: '#7B1FA2' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#7B1FA2', lineHeight: '1.1' }}>
              {appointments.filter(a => a.status === 'Finalizada').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Finalizadas Hoy</div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="form-input"
            style={{ padding: '0.6rem 0.9rem', fontSize: '0.88rem' }}
            placeholder="Buscar por cliente, servicio o dirección..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            <Filter size={16} />
            <span>Técnica:</span>
          </div>
          <select
            className="form-input"
            style={{ width: 'auto', padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
            value={techFilter}
            onChange={(e) => setTechFilter(e.target.value)}
          >
            <option value="all">Todas (Mary & Sharith)</option>
            <option value="mary">Mary Angélica</option>
            <option value="sharith">Sharith Stefany</option>
          </select>

          <select
            className="form-input"
            style={{ width: 'auto', padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los Estados</option>
            <option value="confirmada">Confirmadas</option>
            <option value="en camino">En Camino</option>
            <option value="en proceso">En Proceso</option>
            <option value="finalizada">Finalizadas</option>
          </select>
        </div>
      </div>

      {/* Appointment Cards List Grid */}
      <div className="grid-2">
        {filteredAppointments.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
            <Calendar size={48} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p style={{ fontSize: '1rem', fontWeight: '600' }}>No se encontraron citas con los filtros seleccionados</p>
          </div>
        ) : (
          filteredAppointments.map((app) => (
            <div key={app.id} className="appointment-card">
              <div className="appointment-header">
                <div>
                  <div className="client-name">{app.clientName}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--primary-rose)', fontWeight: '600', marginTop: '0.1rem' }}>
                    {app.service}
                  </div>
                </div>
                <span className={getStatusBadgeClass(app.status)}>{app.status}</span>
              </div>

              <div className="appointment-details">
                <div className="detail-row">
                  <Clock size={16} color="var(--primary-rose)" />
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{app.time}</span>
                  <span style={{ fontSize: '0.78rem', background: '#F5F5F5', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    Duración: {app.duration}
                  </span>
                </div>

                <div className="detail-row">
                  <MapPin size={16} color="var(--primary-rose)" />
                  <span>{app.address}</span>
                </div>

                <div className="detail-row">
                  <Phone size={16} color="var(--primary-rose)" />
                  <span>{app.phone}</span>
                </div>
              </div>

              <div className="appointment-footer">
                <div className="technician-pill">
                  <User size={14} />
                  <span>{app.assignedTo}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    ${app.price.toLocaleString('es-CO')}
                  </span>

                  {app.status !== 'Finalizada' && (
                    <button
                      className="btn-secondary btn-sm-action"
                      style={{ background: 'var(--primary-rose-light)', color: 'var(--primary-rose)', border: 'none' }}
                      onClick={() => {
                        const next = getNextStatus(app.status);
                        onUpdateStatus(app.id, next);
                        showToast(`Cita de ${app.clientName} actualizada a: ${next}`, 'success');
                      }}
                    >
                      Avanzar a: {getNextStatus(app.status)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
