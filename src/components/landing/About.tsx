
import React from 'react';
import { CheckCircle } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2 animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-blue-800">About Tabadl Alkon</h2>
            <p className="text-lg mb-6 text-gray-700">
              Embarking on a new business venture is an exciting journey, and at Tabadl Alkon, 
              we are here to ensure your path to success is smooth and rewarding. As you enter the Saudi Arabian market, 
              our comprehensive business registration services are designed to empower your business from the very start.
            </p>
            <p className="text-lg mb-8 text-gray-700">
              We understand the challenges and excitement of starting a new business. Our goal is to inspire 
              and empower you to achieve your business dreams in Saudi Arabia. We are committed to providing 
              personalized, expert guidance to help you navigate the complexities of business registration 
              with confidence and ease.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <p className="text-gray-800">Highly Trained & Professional Team with years of local experience</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <p className="text-gray-800">Competitive Pricing with transparent cost structure</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <p className="text-gray-800">Time-Efficiency & All-Inclusive Services for a seamless experience</p>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 animate-fade-in" style={{animationDelay: "0.2s"}}>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8Y29ycG9yYXRlJTIwb2ZmaWNlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60" 
                alt="Business Services" 
                className="rounded-lg shadow-xl w-full object-cover"
                style={{ height: "500px" }}
              />
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-lg shadow-lg">
                <p className="font-bold text-xl">15+ Years</p>
                <p>Of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
