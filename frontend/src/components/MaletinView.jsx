import React, { useState } from 'react';
import { Briefcase, AlertTriangle, RefreshCw, Zap, CheckCircle, Package, Battery, Sparkles } from 'lucide-react';

export default function MaletinView({ supplies, onRestockItem, onOpenRestockModal, showToast }) {
  const [activeTab, setActiveTab] = useState('all');

  const lowStockCount = supplies.filter(s => s.percentage <= 25).length;
  const mediumStockCount = supplies.filter(s => s.percentage > 25 && s.percentage <= 50).length;

  const filteredSupplies = supplies.filter(s => {
    if (activeTab === 'low') return s.percentage <= 25;
    if (activeTab === 'esmaltes') return s.category === 'Esmaltes & Geles';
    if (activeTab === 'herramientas') return s.category === 'Herramientas & Equipos';
    if (activeTab === 'higiene') return s.category === 'Higiene & Desechables';
    return true;
  });

  const getProgressColor = (percentage) => {
    if (percentage <= 20) return 'critical';
    if (percentage <= 45) return 'warning';
    return 'normal';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="card-title">
            <Briefcase size={24} color="var(--primary-rose)" />
            <span>Maletín Inteligente & Alertas Predictivas</span>
          </h2>
          <p className="card-subtitle">
            Monitoreo en tiempo real del inventario del maletín portátil para citas a domicilio
          </p>
        </div>

        <button className="btn-primary" onClick={onOpenRestockModal}>
          <RefreshCw size={18} />
          <span>Reponer Insumos</span>
        </button>
      </div>

      {/* AI Predictive Alert Widget */}
      {lowStockCount > 0 && (
        <div className="alert-banner">
          <div className="alert-icon-box">
            <AlertTriangle size={24} />
          </div>
          <div className="alert-content">
            <div className="alert-title">
              ⚠️ Alerta Predictiva de Maletín ({lowStockCount} insumos en nivel crítico)
            </div>
            <div className="alert-desc">
              Basado en las citas agendadas para hoy, el insumo <strong>Esmalte Nude Rose #4</strong> y <strong>Acetona Pura 500ml</strong> se agotarán en las próximas 2 atenciones. Se recomienda recargarlos antes de la ruta de la tarde.
            </div>
          </div>
          <button
            className="btn-primary"
            style={{ padding: '0.55rem 1.1rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
            onClick={() => {
              supplies.filter(s => s.percentage <= 20).forEach(s => onRestockItem(s.id, 100));
              showToast('¡Insumos en estado crítico repuestos al 100%!', 'success');
            }}
          >
            Auto-Reponer Todo
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid-3">
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#FFF0F3', padding: '0.85rem', borderRadius: '14px', color: 'var(--primary-rose)' }}>
            <Package size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.1' }}>
              {supplies.length}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Insumos en Maletín</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#FFEBEE', padding: '0.85rem', borderRadius: '14px', color: '#D32F2F' }}>
            <AlertTriangle size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#D32F2F', lineHeight: '1.1' }}>
              {lowStockCount}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>En Estado Crítico (≤20%)</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#E8F5E9', padding: '0.85rem', borderRadius: '14px', color: '#2E7D32' }}>
            <Zap size={26} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#2E7D32', lineHeight: '1.1' }}>
              98%
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Eficiencia de Ruta Hoy</div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="glass-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
        <button
          className={`chip-btn ${activeTab === 'all' ? 'active' : ''}`}
          style={{ background: activeTab === 'all' ? 'var(--primary-rose)' : '#FFF0F3', color: activeTab === 'all' ? '#FFF' : 'var(--primary-rose)' }}
          onClick={() => setActiveTab('all')}
        >
          Todos ({supplies.length})
        </button>

        <button
          className={`chip-btn ${activeTab === 'low' ? 'active' : ''}`}
          style={{ background: activeTab === 'low' ? '#D32F2F' : '#FFEBEE', color: activeTab === 'low' ? '#FFF' : '#D32F2F' }}
          onClick={() => setActiveTab('low')}
        >
          ⚠️ Críticos ({lowStockCount})
        </button>

        <button
          className={`chip-btn ${activeTab === 'esmaltes' ? 'active' : ''}`}
          style={{ background: activeTab === 'esmaltes' ? 'var(--primary-rose)' : '#FFF0F3', color: activeTab === 'esmaltes' ? '#FFF' : 'var(--primary-rose)' }}
          onClick={() => setActiveTab('esmaltes')}
        >
          💅 Esmaltes & Geles
        </button>

        <button
          className={`chip-btn ${activeTab === 'herramientas' ? 'active' : ''}`}
          style={{ background: activeTab === 'herramientas' ? 'var(--primary-rose)' : '#FFF0F3', color: activeTab === 'herramientas' ? '#FFF' : 'var(--primary-rose)' }}
          onClick={() => setActiveTab('herramientas')}
        >
          🔌 Herramientas & Equipos
        </button>

        <button
          className={`chip-btn ${activeTab === 'higiene' ? 'active' : ''}`}
          style={{ background: activeTab === 'higiene' ? 'var(--primary-rose)' : '#FFF0F3', color: activeTab === 'higiene' ? '#FFF' : 'var(--primary-rose)' }}
          onClick={() => setActiveTab('higiene')}
        >
          ✨ Higiene & Desechables
        </button>
      </div>

      {/* Supply Cards Grid */}
      <div className="grid-3">
        {filteredSupplies.map((item) => {
          const statusClass = getProgressColor(item.percentage);
          return (
            <div key={item.id} className="supply-card">
              <div className="supply-header">
                <div>
                  <div className="supply-name">{item.name}</div>
                  <div className="supply-type">{item.category}</div>
                </div>
                <div style={{
                  fontWeight: '800',
                  fontSize: '1rem',
                  color: statusClass === 'critical' ? '#D32F2F' : statusClass === 'warning' ? '#E65100' : '#2E7D32'
                }}>
                  {item.percentage}%
                </div>
              </div>

              {/* Progress Level Bar */}
              <div className="progress-bar-bg">
                <div className={`progress-bar-fill ${statusClass}`} style={{ width: `${item.percentage}%` }}></div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Estimado: {item.estimatedUses} usos restantes</span>
                <span>{item.quantity} {item.unit}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  className="btn-secondary btn-sm-action"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    onRestockItem(item.id, 100);
                    showToast(`Insumo "${item.name}" recargado al 100%`, 'success');
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Recargar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
