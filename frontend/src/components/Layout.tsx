import { NavLink, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div>
      <nav>
        <NavLink to="/videos">Videos</NavLink>
        <NavLink to="/ads">Ads</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
