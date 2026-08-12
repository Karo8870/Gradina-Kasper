import React from 'react';
import './index.scss';

const baseClass = 'before-dashboard';

export const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <a className={`${baseClass}__orders-link`} href='/admin/orders'>
        Gestionează comenzile
      </a>
    </div>
  );
};
