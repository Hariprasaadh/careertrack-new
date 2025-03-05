"use client"
import React from 'react';
import { motion } from 'framer-motion';

// Feature Card Component
const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  iconColor: string;
}> = ({ title, description, icon, bgColor, textColor, iconColor }) => {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 15px 25px rgba(0,0,0,0.1)"
      }}
      className={`
        relative 
        overflow-hidden 
        ${bgColor} 
        border 
        border-gray-200 
        rounded-2xl 
        p-6 
        space-y-4 
        transition-all 
        duration-300 
        hover:border-blue-500
        group
      `}
    >
      <div className={`${iconColor} mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className={`text-xl font-semibold ${textColor} mb-2`}>{title}</h3>
      <p className={`${textColor} opacity-70`}>{description}</p>
    </motion.div>
  );
};

// Features Section Component
const FeaturesSection: React.FC = () => {
  const educationalServices = [
    {
      title: "Chat with PDF",
      description: "Interact with your PDF documents using AI-powered conversation",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="10" y1="13" x2="14" y2="13"/>
          <line x1="10" y1="17" x2="14" y2="17"/>
          <line x1="6" y1="13" x2="8" y2="13"/>
          <line x1="6" y1="17" x2="8" y2="17"/>
        </svg>
      ),
      bgColor: "bg-green-50",
      textColor: "text-green-900",
      iconColor: "text-green-600"
    },
    {
      title: "YouTube Video Summarizer",
      description: "Get concise summaries of YouTube videos with AI",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.34z"/>
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
        </svg>
      ),
      bgColor: "bg-blue-50",
      textColor: "text-blue-900",
      iconColor: "text-blue-600"
    },
    {
      title: "Quiz Generator",
      description: "Create custom quizzes on any topic instantly",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="7" y1="8" x2="17" y2="8"/>
          <line x1="7" y1="12" x2="17" y2="12"/>
          <line x1="7" y1="16" x2="13" y2="16"/>
          <path d="M15 16l2 2 4-4"/>
        </svg>
      ),
      bgColor: "bg-purple-50",
      textColor: "text-purple-900",
      iconColor: "text-purple-600"
    }
  ];

  const interviewServices = [
    {
      title: "ATS Resume Generator",
      description: "Create ATS-optimized resumes that pass screening algorithms",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="7" y1="8" x2="17" y2="8"/>
          <line x1="7" y1="12" x2="17" y2="12"/>
          <line x1="7" y1="16" x2="17" y2="16"/>
          <path d="M3 10h18"/>
          <path d="M10 14h4"/>
        </svg>
      ),
      bgColor: "bg-teal-50",
      textColor: "text-teal-900",
      iconColor: "text-teal-600"
    },
    {
      title: "Code Portfolio",
      description: "Showcase your coding skills with an AI-curated portfolio",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      ),
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-900",
      iconColor: "text-indigo-600"
    },
    {
      title: "Mock Interview Prep",
      description: "AI-powered interview simulation and feedback",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      ),
      bgColor: "bg-orange-50",
      textColor: "text-orange-900",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <div className="relative min-h-screen bg-white text-gray-900 py-16 px-4 md:px-8 lg:px-16">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-pattern opacity-5 pointer-events-none"></div>
      
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-fill-transparent">
            Powerful AI-Driven Learning & Interview Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Elevate your learning and career preparation with our comprehensive AI solutions
          </p>
        </motion.div>

        {/* Services Container */}
        <div className="space-y-12">
          {/* Educational Services */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-semibold mb-8 text-center text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-fill-transparent">
              Educational Services
            </h3>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    delayChildren: 0.2,
                    staggerChildren: 0.1
                  }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {educationalServices.map((service, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { 
                        duration: 0.6,
                        ease: "easeOut" 
                      }
                    }
                  }}
                >
                  <FeatureCard 
                    title={service.title}
                    description={service.description}
                    icon={service.icon}
                    bgColor={service.bgColor}
                    textColor={service.textColor}
                    iconColor={service.iconColor}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Interview Services */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-semibold mb-8 text-center text-gray-900 bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-fill-transparent">
              Interview Services
            </h3>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    delayChildren: 0.2,
                    staggerChildren: 0.1
                  }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {interviewServices.map((service, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { 
                        duration: 0.6,
                        ease: "easeOut" 
                      }
                    }
                  }}
                >
                  <FeatureCard 
                    title={service.title}
                    description={service.description}
                    icon={service.icon}
                    bgColor={service.bgColor}
                    textColor={service.textColor}
                    iconColor={service.iconColor}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;