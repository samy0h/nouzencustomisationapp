import { useNavigate } from 'react-router-dom';

export function useAdminAuth() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };

  const getUsername = () => localStorage.getItem('adminUsername') || '';

  return { logout, getUsername };
}
