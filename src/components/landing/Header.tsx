
import React from 'react';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleClientLogin = () => {
    navigate('/portal');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <Building2 className="h-8 w-8 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold">Tabadl Alkon</h1>
        </div>
        <div>
          <Button onClick={handleClientLogin} variant="outline" className="mr-2">Client Login</Button>
          <Button onClick={() => navigate('/portal?tab=signup')} variant="default">Get Started</Button>
        </div>
      </div>
    </header>
  );
};
