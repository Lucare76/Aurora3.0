import { useState } from 'react';
import { 
  Home, 
  TrendingUp, 
  BarChart3, 
  Tag, 
  CreditCard, 
  Zap 
} from 'lucide-react';

const Navigation = ({ currentPage, onPageChange }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      badge: '●',
      badgeColor: 'text-green-500'
    },
    {
      id: 'movements',
      label: 'Movimenti',
      icon: TrendingUp
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3
    },
    {
      id: 'categories',
      label: 'Categorie',
      icon: Tag,
      badge: '8',
      badgeColor: 'bg-red-100 text-red-600'
    },
    {
      id: 'payment-methods',
      label: 'Metodi Pagamento',
      icon: CreditCard
    }
  ];

  return (
    <nav className="aurora-sidebar-menu">
      <div className="aurora-menu-section">
        <h3 className="aurora-menu-title">Menu Principale</h3>
        <div className="aurora-menu-items">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <div
                key={item.id}
                className={`aurora-menu-item ${isActive ? 'active' : ''}`}
                onClick={() => onPageChange(item.id)}
              >
                <Icon className="aurora-menu-icon" />
                <span className="aurora-menu-text">{item.label}</span>
                {item.badge && (
                  <span className={`aurora-menu-badge ${item.badgeColor || ''}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="aurora-menu-section">
        <div className="aurora-menu-items">
          <div
            className={`aurora-menu-item ${currentPage === 'quick-status' ? 'active' : ''}`}
            onClick={() => onPageChange('quick-status')}
          >
            <Zap className="aurora-menu-icon" />
            <span className="aurora-menu-text">Stato Rapido</span>
          </div>
        </div>
        <div className="mt-4 px-3 text-xs text-gray-500">
          <div className="flex justify-between mb-1">
            <span>Transazioni Oggi</span>
            <span>0</span>
          </div>
          <div className="flex justify-between">
            <span>Categorie Attive</span>
            <span>8</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;