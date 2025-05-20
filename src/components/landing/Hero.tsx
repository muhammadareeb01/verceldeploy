import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-24 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-12 w-96 h-96 bg-blue-400 rounded-full opacity-10 animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-12 left-24 w-80 h-80 bg-indigo-500 rounded-full opacity-10 animate-[pulse_12s_ease-in-out_infinite]"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
          Business Services in Saudi Arabia
        </h1>
        <p
          className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          Empowering businesses to thrive in Saudi Arabia with expert,
          efficient, and comprehensive business services.
        </p>
        <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Button
            onClick={() => navigate("/portal?tab=signup")}
            size="lg"
            className="bg-white text-blue-700 hover:bg-gray-100 hover:scale-105 transition-all shadow-lg"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};
