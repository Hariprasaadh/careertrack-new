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
        background: 'linear-gradient(135deg, #121212 0%, #1E1E2E 100%)',
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
            <stop offset="0%" stopColor="#00BFFF" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#1E1E2E" stopOpacity="0.6"/>
          </linearGradient>
        </defs>
        
        {/* Abstract tech elements */}
        <path 
          d="M100 300 Q400 100 700 300" 
          fill="none" 
          stroke="url(#techGradient)" 
          strokeWidth="4" 
          strokeDasharray="10 10"
        />
        
        <circle 
          cx="200" 
          cy="200" 
          r="50" 
          fill="url(#techGradient)" 
          opacity="0.5"
        />
        
        <rect 
          x="500" 
          y="250" 
          width="100" 
          height="100" 
          fill="url(#techGradient)" 
          opacity="0.3"
          transform="rotate(45 550 300)"
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
    <div className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#00BFFF] leading-tight">
            {title}
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-300 max-w-xl">
            {subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex space-x-4 pt-6">
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 15px rgba(255,215,0,0.5)"
              }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-8 py-4 rounded-lg bg-[#FFD700] text-[#1E1E2E] font-semibold hover:bg-opacity-90 transition-all"
            >
              <PlayCircle size={24} />
              <span>{primaryCtaText}</span>
            </motion.button>

            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 15px rgba(0,191,255,0.5)"
              }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-8 py-4 rounded-lg border border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-[#1E1E2E] transition-all"
            >
              <ArrowRight size={24} />
              <span>{secondaryCtaText}</span>
            </motion.button>
          </div>

          {/* Feature Highlights */}
          <div className="pt-8 space-y-3">
            <p className="text-sm text-gray-400">Trusted by professionals across industries</p>
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
                  className="flex items-center space-x-2 text-sm text-gray-300"
                >
                  <feature.icon size={20} className="text-[#00BFFF]" />
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
          <div className="bg-gradient-to-br from-[#1E1E2E] to-[#121212] rounded-2xl shadow-2xl p-6 border border-gray-800">
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
              <div className="h-64 bg-gradient-to-r from-[#00BFFF] to-[#FFD700] opacity-20 blur-2xl absolute inset-0"></div>
              <div className="relative z-10 p-6">
                <div className="flex justify-between mb-4">
                  <div className="h-4 w-24 bg-gray-700 rounded"></div>
                  <div className="h-4 w-16 bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((_, index) => (
                    <div 
                      key={index} 
                      className="h-12 bg-gray-800 rounded-lg flex items-center px-4"
                    >
                      <div className="h-4 w-4 bg-gray-700 rounded-full mr-3"></div>
                      <div className="h-3 w-full bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ 
          y: [0, 10, 0],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-[#00BFFF]"
      >
        <ArrowRight className="animate-bounce" size={32} />
      </motion.div>
    </div>
  );
};

export default HeroSection;