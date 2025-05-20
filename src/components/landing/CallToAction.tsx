import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CallToAction: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-r from-blue-700 to-blue-900 text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-20 bg-white opacity-5"></div>
        <div className="absolute -bottom-10 right-10 w-80 h-80 bg-blue-500 rounded-full opacity-10"></div>
        <div className="absolute top-10 left-10 w-60 h-60 bg-indigo-500 rounded-full opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in">
          Ready to Start Your Business Journey?
        </h2>
        <p
          className="text-xl mb-10 max-w-3xl mx-auto animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          With our expert guidance and comprehensive services, establishing your
          business in Saudi Arabia has never been easier. Join hundreds of
          successful businesses who trusted us with their company formation
          needs.
        </p>
        <div
          className="flex flex-col md:flex-row justify-center gap-4 animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <Button
            onClick={() => navigate("/portal?tab=signup")}
            size="lg"
            className="bg-white text-blue-700 hover:bg-gray-100 hover:scale-105 transition-all"
          >
            Register Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            onClick={() => navigate("/portal")}
            variant="outline"
            size="lg"
            className="border-white bg-transparent text-white hover:text-white hover:bg-white/10"
          >
            Login to Portal
          </Button>
        </div>
      </div>
    </section>
  );
};
