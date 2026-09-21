'use client';

import { NavGroup } from '@payloadcms/ui';

export function OrderDashboardNavLink() {
  return (
    <NavGroup label='Store management'>
      <a className='nav__link' href='/admin/orders'>
        <span className='nav__link-label'>Orders dashboard</span>
      </a>
    </NavGroup>
  );
}
