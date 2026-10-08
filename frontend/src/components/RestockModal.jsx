import React, { useState } from 'react';
import { X, RefreshCw, Briefcase, Check } from 'lucide-react';

export default function RestockModal({ isOpen, onClose, supplies, onRestockItem, showToast }) {
  const [selectedItem, setSelectedItem] = useState(supplies[0]?.id || '');
  const [newPercentage, setNewPercentage] = useState(100);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const itemObj = supplies.find(s => s.id === Number(selectedItem) || s.id === selectedItem);
    onRestockItem(selectedItem, Number(newPercentage));
    showToast(`Insumo "${itemObj ? itemObj.name : 'Insumo'}" actualizado al ${newPercentage}%`, 'success');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <RefreshCw size={22} color="var(--primary-rose)" />
            <h3 className="modal-title">Reponer Insumo de Maletín</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Seleccionar Insumo del Maletín</label>
            <select
              className="form-input"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              {supplies.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} (Actual: {s.percentage}%)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nuevo Nivel de Carga (%)</label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              className="form-input"
              style={{ cursor: 'pointer', accentColor: 'var(--primary-rose)' }}
              value={newPercentage}
              onChange={(e) => setNewPercentage(e.target.value)}
            />
            <div style={{ textAlign: 'center', fontWeight: '800', fontSize: '1.2rem', color: 'var(--primary-rose)', marginTop: '0.5rem' }}>
              {newPercentage}%
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              Guardar Recarga
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
