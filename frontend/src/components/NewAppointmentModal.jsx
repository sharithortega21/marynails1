import React, { useState } from 'react';
import { X, Calendar, User, MapPin, Phone, Clock, DollarSign, Sparkles } from 'lucide-react';

export default function NewAppointmentModal({ isOpen, onClose, onAddAppointment, showToast }) {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [service, setService] = useState('Manicura Rusa + Gel Semipermanente');
  const [time, setTime] = useState('10:00 AM');
  const [duration, setDuration] = useState('1h 15m');
  const [price, setPrice] = useState(50000);
  const [assignedTo, setAssignedTo] = useState('Mary Angélica');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !address || !phone) {
      showToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    const newApp = {
      id: Date.now(),
      clientName,
      phone,
      address,
      service,
      time,
      duration,
      price: Number(price),
      assignedTo,
      status: 'Confirmada'
    };

    onAddAppointment(newApp);
    showToast(`Cita para ${clientName} agendada con éxito`, 'success');
    onClose();

    // Reset Form
    setClientName('');
    setPhone('');
    setAddress('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Calendar size={22} color="var(--primary-rose)" />
            <h3 className="modal-title">Agendar Nueva Cita</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre del Cliente *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. Sra. Camila Rodríguez"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Teléfono / WhatsApp *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. 315 456 7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hora *</label>
              <select
                className="form-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                <option value="08:00 AM">08:00 AM</option>
                <option value="09:30 AM">09:30 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="01:30 PM">01:30 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="04:30 PM">04:30 PM</option>
                <option value="06:00 PM">06:00 PM</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Dirección de Atencion (Domicilio) *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. Cra 45 # 128 - 32, Apt 502, Cañaveral"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Servicio Solicitado</label>
            <select
              className="form-input"
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              <option value="Manicura Rusa + Gel Semipermanente">Manicura Rusa + Gel Semipermanente ($50.000)</option>
              <option value="Pedicura Spá + Exfoliación">Pedicura Spá + Exfoliación ($45.000)</option>
              <option value="Combo Completo Manicura & Pedicura">Combo Completo Manicura & Pedicura ($85.000)</option>
              <option value="Decoración Nail Art Premium (Extensión Soft Gel)">Decoración Nail Art Premium ($95.000)</option>
              <option value="Retiro Semipermanente + Hidratación">Retiro Semipermanente + Hidratación ($25.000)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Precio ($ COP)</label>
              <input
                type="number"
                className="form-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Técnica Asignada</label>
              <select
                className="form-input"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="Mary Angélica">Mary Angélica</option>
                <option value="Sharith Stefany">Sharith Stefany</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              Confirmar Cita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
