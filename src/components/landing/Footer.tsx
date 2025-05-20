
import React from 'react';
import { Building2, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Information */}
          <div>
            <div className="flex items-center mb-4">
              <Building2 className="h-8 w-8 text-blue-400 mr-2" />
              <h3 className="text-xl font-bold text-white">Tabadl Alkon</h3>
            </div>
            <p className="mb-4 text-gray-400">
              Professional business registration and consultancy services in Saudi Arabia.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">Business Registration</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">Company Formation</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">Licensing & Permits</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">Legal Consultancy</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">Document Processing</a>
              </li>
            </ul>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" onClick={() => navigate('/portal')} className="hover:text-blue-400 transition-colors">Client Portal</a>
              </li>
              <li>
                <a href="#" onClick={() => navigate('/staff-login')} className="hover:text-blue-400 transition-colors">Staff Login</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              </li>
            </ul>
          </div>
          
          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-1 text-blue-400" />
                <span>1234 Business Avenue, Riyadh, Saudi Arabia</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-blue-400" />
                <span>+966 12 345 6789</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-400" />
                <span>info@tabadlalkon.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm">
          <p>&copy; {currentYear} Tabadl Alkon. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
