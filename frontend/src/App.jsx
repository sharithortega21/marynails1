import React, { useState } from 'react';
import LoginView from './components/LoginView';
import Navbar from './components/Navbar';
import AgendaView from './components/AgendaView';
import MaletinView from './components/MaletinView';
import PanelDiferenciado from './components/PanelDiferenciado';
import NewAppointmentModal from './components/NewAppointmentModal';
import RestockModal from './components/RestockModal';
import ToastNotification from './components/ToastNotification';
import { Calendar, Briefcase, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

const INITIAL_APPOINTMENTS = [
  {
    id: 101,
    clientName: 'Sra. Elena Gómez',
    phone: '315 892 4410',
    address: 'Cra 38 # 48 - 19, Apt 804, Cabecera',
    service: 'Manicura Rusa + Gel Semipermanente Nude',
    time: '09:00 AM',
    duration: '1h 20m',
    price: 55000,
    assignedTo: 'Mary Angélica',
    status: 'Confirmada'
  },
  {
    id: 102,
    clientName: 'Sra. Marcela Silva',
    phone: '300 412 9876',
    address: 'Calle 157 # 24 - 10, Cañaveral',
    service: 'Combo Completo Manicura & Pedicura Spá',
    time: '11:30 AM',
    duration: '2h 00m',
    price: 90000,
    assignedTo: 'Sharith Stefany',
    status: 'En Camino'
  },
  {
    id: 103,
    clientName: 'Dra. Patricia Ruiz',
    phone: '318 765 2234',
    address: 'Transversal 72 # 110 - 45, El Bosque',
    service: 'Decoración Nail Art Premium (Soft Gel)',
    time: '02:00 PM',
    duration: '1h 45m',
    price: 95000,
    assignedTo: 'Mary Angélica',
    status: 'Confirmada'
  },
  {
    id: 104,
    clientName: 'Lic. Sofía Morales',
    phone: '312 554 9012',
    address: 'Calle 36 # 28 - 14, Centro',
    service: 'Retiro Semipermanente + Manicura Clásica',
    time: '04:30 PM',
    duration: '1h 00m',
    price: 40000,
    assignedTo: 'Sharith Stefany',
    status: 'Confirmada'
  }
];

const INITIAL_SUPPLIES = [
  { id: 1, name: 'Esmalte Nude Rose #4 (Semipermanente)', category: 'Esmaltes & Geles', percentage: 15, quantity: '1.5', unit: 'ml', estimatedUses: 2 },
  { id: 2, name: 'Esmalte Rojo Pasión #12', category: 'Esmaltes & Geles', percentage: 85, quantity: '12', unit: 'ml', estimatedUses: 14 },
  { id: 3, name: 'Brillo Top Coat Ultra Gloss', category: 'Esmaltes & Geles', percentage: 40, quantity: '6', unit: 'ml', estimatedUses: 6 },
  { id: 4, name: 'Acetona Pura Desengrasante (500ml)', category: 'Higiene & Desechables', percentage: 20, quantity: '100', unit: 'ml', estimatedUses: 3 },
  { id: 5, name: 'Lámpara UV/LED Portátil Recargable', category: 'Herramientas & Equipos', percentage: 90, quantity: '1', unit: 'unidad', estimatedUses: 25 },
  { id: 6, name: 'Kit Alicates y Empujadores Esterilizados', category: 'Herramientas & Equipos', percentage: 100, quantity: '4', unit: 'kits', estimatedUses: 8 },
  { id: 7, name: 'Limas Profesionales 100/180', category: 'Higiene & Desechables', percentage: 75, quantity: '15', unit: 'unidades', estimatedUses: 15 },
  { id: 8, name: 'Aceite de Cutícula con Almendras', category: 'Esmaltes & Geles', percentage: 60, quantity: '18', unit: 'ml', estimatedUses: 12 }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('agenda');
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [supplies, setSupplies] = useState(INITIAL_SUPPLIES);

  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    showToast(`¡Bienvenida ${userData.fullName} a Mary Nails System!`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    showToast('Sesión cerrada correctamente', 'info');
  };

  const handleUpdateStatus = (appointmentId, newStatus) => {
    setAppointments(prev => prev.map(app => {
      if (app.id === appointmentId) {
        return { ...app, status: newStatus };
      }
      return app;
    }));

    if (newStatus === 'Finalizada') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleAddAppointment = (newApp) => {
    setAppointments(prev => [newApp, ...prev]);
  };

  const handleRestockItem = (itemId, newPercentage) => {
    setSupplies(prev => prev.map(item => {
      if (item.id === Number(itemId) || item.id === itemId) {
        return {
          ...item,
          percentage: newPercentage,
          estimatedUses: Math.round((newPercentage / 100) * 15)
        };
      }
      return item;
    }));
  };

  // If user is not logged in, render the reference Login Screen
  if (!user) {
    return (
      <>
        <LoginView onLogin={handleLogin} />
        <ToastNotification toasts={toasts} onDismiss={(id) => setToasts(t => t.filter(x => x.id !== id))} />
      </>
    );
  }

  return (
    <div className="app-container">
      <div className="bg-ambient">
        <div className="blob-1"></div>
        <div className="blob-2"></div>
      </div>

      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
      />

      {/* Tabs Subheader */}
      <div className="tabs-header">
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'agenda' ? 'active' : ''}`}
            onClick={() => setActiveTab('agenda')}
          >
            <Calendar size={18} />
            <span>Agenda & Citas en Tiempo Real</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'maletin' ? 'active' : ''}`}
            onClick={() => setActiveTab('maletin')}
          >
            <Briefcase size={18} />
            <span>Maletín Inteligente & Alertas Predictivas</span>
            {supplies.some(s => s.percentage <= 20) && (
              <span style={{ background: '#E53935', color: '#FFF', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '99px', fontWeight: '700' }}>
                !
              </span>
            )}
          </button>

          <button
            className={`tab-btn ${activeTab === 'panel' ? 'active' : ''}`}
            onClick={() => setActiveTab('panel')}
          >
            <Users size={18} />
            <span>Paneles Personalizados (Mary / Sharith)</span>
          </button>
        </div>
      </div>

      {/* Main Dashboard Area */}
      <main className="dashboard-body">
        {activeTab === 'agenda' && (
          <AgendaView
            appointments={appointments}
            onUpdateStatus={handleUpdateStatus}
            onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
            showToast={showToast}
          />
        )}

        {activeTab === 'maletin' && (
          <MaletinView
            supplies={supplies}
            onRestockItem={handleRestockItem}
            onOpenRestockModal={() => setIsRestockOpen(true)}
            showToast={showToast}
          />
        )}

        {activeTab === 'panel' && (
          <PanelDiferenciado
            user={user}
            appointments={appointments}
            supplies={supplies}
            showToast={showToast}
          />
        )}
      </main>

      {/* Modals */}
      <NewAppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => setIsNewAppointmentOpen(false)}
        onAddAppointment={handleAddAppointment}
        showToast={showToast}
      />

      <RestockModal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        supplies={supplies}
        onRestockItem={handleRestockItem}
        showToast={showToast}
      />

      <ToastNotification
        toasts={toasts}
        onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
      />
    </div>
  );
}
