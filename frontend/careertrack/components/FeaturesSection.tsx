"use client"
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, MessageSquare, Youtube, ClipboardCheck, Mic2, Code2, Github, Phone} from 'lucide-react';

// Feature Card Component
const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  iconColor: string;
  href: string;
}> = ({ title, description, icon, bgColor, textColor, iconColor, href }) => {
  return (
    <Link href={href}>
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
          h-full
          flex
          flex-col
          space-y-4 
          transition-all 
          duration-300 
          hover:border-blue-500
          group
          cursor-pointer
        `}
      >
        <div className={`${iconColor} mb-4 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <h3 className={`text-xl font-semibold ${textColor} mb-2`}>{title}</h3>
        <p className={`${textColor} opacity-70 mt-auto`}>{description}</p>
      </motion.div>
    </Link>
  );
};

// Features Section Component
const FeaturesSection: React.FC = () => {
  const educationalServices = [
    {
      title: "Quiz Generator",
      description: "Create custom quizzes on any topic instantly",
      icon: <FileText width={48} height={48} />,
      bgColor: "bg-purple-50",
      textColor: "text-purple-900",
      iconColor: "text-purple-600",
      href: "/quiz-generator"
    },
    {
      title: "Chat with PDF",
      description: "Interact with your PDF documents using AI-powered conversation",
      icon: <MessageSquare width={48} height={48} />,
      bgColor: "bg-green-50",
      textColor: "text-green-900",
      iconColor: "text-green-600",
      href: "/chat-pdf"
    },
    {
      title: "YT Summarizer",
      description: "Get concise summaries of YouTube videos with AI",
      icon: <Youtube width={48} height={48} />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-900",
      iconColor: "text-blue-600",
      href: "/yt-summarizer"
    }
  ];

  const interviewServices = [
    {
      title: "ATS Analyzer",
      description: "Create ATS-optimized resumes that pass screening algorithms",
      icon: <ClipboardCheck width={48} height={48} />,
      bgColor: "bg-teal-50",
      textColor: "text-teal-900",
      iconColor: "text-teal-600",
      href: "/ats-analyzer"
    },
    {
      title: "AI Interview",
      description: "AI-powered interview simulation and feedback",
      icon: <Mic2 width={48} height={48} />,
      bgColor: "bg-orange-50",
      textColor: "text-orange-900",
      iconColor: "text-orange-600",
      href: "/ai-interview"
    },
    {
      title: "Coding Portfolio",
      description: "Showcase your coding skills with an AI-curated portfolio",
      icon: <Code2 width={48} height={48} />,
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-900",
      iconColor: "text-indigo-600",
      href: "/coding-portfolio"
    }
  ];

  // Additional card for "Chat with GitHub"
  const additionalCard = [
    {title: "Chat with GitHub",
    description: "Interact with your GitHub repositories using AI-powered conversation",
    icon: <Github width={48} height={48} />,
    bgColor: "bg-gray-50",
    textColor: "text-gray-900",
    iconColor: "text-gray-600",
    href: "/chat-github"},
    {
      title: "AI Resume Builder",
      description: "Create professional resumes with AI-driven content suggestions",
      icon: <ClipboardCheck width={48} height={48} />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-900",
      iconColor: "text-blue-600",
      href: "/resumebuilder",
    },
    {
      title: "Mobile intergration",
      description: "Integrate AI-powered features into your mobile app",
      icon: <Phone width={48} height={48} />,
      bgColor: "bg-red-50",
      textColor: "text-red-900",
      iconColor: "text-red-600",
      href: "/mobile-integration",
    }
  ];

  return (
    <div className="relative min-h-screen bg-white text-gray-900 py-16 px-4 md:px-8 lg:px-16" id='Features'>
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
            Powerful AI-Driven Learning & Interview Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Elevate your learning and career preparation with our comprehensive AI solutions
          </p>
        </motion.div>

        {/* Services Container */}
        <div className="space-y-12">
          {/* Interview Services FIRST */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-semibold mb-8 text-center text-gray-900 bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text">
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
                  className="h-full"
                >
                  <FeatureCard 
                    title={service.title}
                    description={service.description}
                    icon={service.icon}
                    bgColor={service.bgColor}
                    textColor={service.textColor}
                    iconColor={service.iconColor}
                    href={service.href}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Educational Services SECOND */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-semibold mb-8 text-center text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text">
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
                  className="h-full"
                >
                  <FeatureCard 
                    title={service.title}
                    description={service.description}
                    icon={service.icon}
                    bgColor={service.bgColor}
                    textColor={service.textColor}
                    iconColor={service.iconColor}
                    href={service.href}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Additional Card - Chat with GitHub */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-semibold mb-8 text-center text-gray-900 bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text">
              Additional Tools
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
                {additionalCard.map((card, index) => (
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
                  className="h-full"
                >
                  <FeatureCard 
                  title={card.title}
                  description={card.description}
                  icon={card.icon}
                  bgColor={card.bgColor}
                  textColor={card.textColor}
                  iconColor={card.iconColor}
                  href={card.href}
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