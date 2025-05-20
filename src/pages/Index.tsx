
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  
  // Redirect to landing page
  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);
  
  // This will only render briefly before redirect
  return <div>Redirecting...</div>;
};

export default Index;
