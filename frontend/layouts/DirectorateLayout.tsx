/* eslint-disable */
// @ts-nocheck
import { Outlet } from 'react-router-dom';
import UnifiedLayout from './UnifiedLayout';
import { ADMIN_NAV } from '../config/navigation';

const DirectorateLayout = () => (
  <UnifiedLayout title="Directorate" navItems={ADMIN_NAV} showSignOut={false}>
    <Outlet />
  </UnifiedLayout>
);

export default DirectorateLayout;
