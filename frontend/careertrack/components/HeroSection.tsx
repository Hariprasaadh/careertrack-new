"use client"
import React, { useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  ArrowRight, 
  PlayCircle, 
  BookOpen, 
  Lightbulb 
} from 'lucide-react';

// TypeScript Interfaces
interface HeroProps {
  title?: string;
  subtitle?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
}

// Animated Background Component
const AnimatedBackground = () => {
  const gradientRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={gradientRef}
      className="absolute inset-0 z-0 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #F8F9FA 0%, #DEE2E6 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientAnimation 15s ease infinite'
      }}
    >
      <style jsx>{`
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

// Tech Illustration Component
const TechIllustration = () => {
  return (
    <div className="absolute top-1/2 right-0 transform -translate-y-1/2 opacity-10 md:opacity-20 lg:opacity-30">
      <svg 
        width="600" 
        height="400" 
        viewBox="0 0 800 600" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-blue-500"
      >
        <defs>
          <linearGradient id="techGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0A2342" stopOpacity="0.3"/>
            <stop offset="25%" stopColor="#00528C" stopOpacity="0.5"/>
            <stop offset="50%" stopColor="#007BFF" stopOpacity="0.6"/>
            <stop offset="75%" stopColor="#42A5F5" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#00C3FF" stopOpacity="0.2"/>
          </linearGradient>

          <linearGradient id="elementGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00528C"/>
            <stop offset="100%" stopColor="#0A2342"/>
          </linearGradient>
        </defs>
        
        {/* Complex Abstract tech elements */}
        <path 
          d="M100 300 Q400 100 700 300" 
          fill="none" 
          stroke="url(#techGradient)" 
          strokeWidth="6" 
          strokeDasharray="15 15"
        />
        
        <circle 
          cx="200" 
          cy="200" 
          r="60" 
          fill="url(#elementGradient)" 
          opacity="0.6"
        />
        
        <rect 
          x="500" 
          y="250" 
          width="120" 
          height="120" 
          fill="url(#elementGradient)" 
          opacity="0.4"
          transform="rotate(45 560 310)"
        />

        {/* Additional abstract elements */}
        <path 
          d="M300 400 Q450 250 600 400" 
          fill="none" 
          stroke="url(#techGradient)" 
          strokeWidth="4" 
          strokeDasharray="10 10"
          opacity="0.5"
        />

        <ellipse 
          cx="650" 
          cy="180" 
          rx="40" 
          ry="25" 
          fill="url(#elementGradient)"
          opacity="0.4"
          transform="rotate(-30 650 180)"
        />
      </svg>
    </div>
  );
};

// Hero Section Component
const HeroSection: React.FC<HeroProps> = ({
  title = "Empower Your Career with Career Track",
  subtitle = "Your ultimate destination for education & interview success!",
  primaryCtaText = "Start Learning",
  secondaryCtaText = "Explore Services"
}) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center text-[#003366] overflow-hidden bg-[#F8F9FA]">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Tech Illustration */}
      <TechIllustration />

      {/* Hero Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut"
          }}
          className="space-y-6"
        >
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#003366] leading-tight">
            {title}
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-[#003366] max-w-xl">
            {subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex space-x-4 pt-6">
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 15px rgba(0,123,255,0.5)"
              }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-8 py-4 rounded-lg bg-[#007BFF] text-white font-semibold hover:bg-[#42A5F5] transition-all"
            >
              <PlayCircle size={24} />
              <span>{primaryCtaText}</span>
            </motion.button>

            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 15px rgba(0,195,255,0.5)"
              }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-8 py-4 rounded-lg border border-[#00C3FF] text-[#00C3FF] hover:bg-[#00C3FF] hover:text-white transition-all"
            >
              <ArrowRight size={24} />
              <span>{secondaryCtaText}</span>
            </motion.button>
          </div>

          {/* Feature Highlights */}
          <div className="pt-8 space-y-3">
            <p className="text-sm text-[#003366] opacity-70">Trusted by professionals across industries</p>
            <div className="flex space-x-4">
              {[
                { icon: BookOpen, text: "Comprehensive Courses" },
                { icon: Lightbulb, text: "Career Guidance" },
                { icon: CheckCircle2, text: "Interview Prep" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex items-center space-x-2 text-sm text-[#003366]"
                >
                  <feature.icon size={20} className="text-[#00C3FF]" />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Visual Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut"
          }}
          className="hidden md:block"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-[#DEE2E6]">
            <div className="bg-[#F8F9FA] rounded-lg overflow-hidden shadow-lg">
              <div className="h-64 bg-gradient-to-r from-[#007BFF] to-[#00C3FF] opacity-20 blur-2xl absolute inset-0"></div>
              <div className="relative z-10 p-6">
                <div className="flex justify-between mb-4">
                  <div className="h-4 w-24 bg-[#DEE2E6] rounded"></div>
                  <div className="h-4 w-16 bg-[#DEE2E6] rounded"></div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((_, index) => (
                    <div 
                      key={index} 
                      className="h-12 bg-white rounded-lg flex items-center px-4 border border-[#DEE2E6]"
                    >
                      <div className="h-4 w-4 bg-[#DEE2E6] rounded-full mr-3"></div>
                      <div className="h-3 w-full bg-[#DEE2E6] rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
