import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const AuthenticatedLayout = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080C1D] text-[#0F172A] dark:text-[#F5F7FF] transition-colors flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
