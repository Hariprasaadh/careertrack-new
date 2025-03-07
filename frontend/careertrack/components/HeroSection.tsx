"use client"
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { 
  CheckCircle2, 
  ArrowRight,  
  BookOpen, 
  Lightbulb,
  MessageSquare,
  Send,
  X,
  Loader2
} from 'lucide-react';

// TypeScript Interfaces
interface HeroProps {
  title?: string;
  subtitle?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
}

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

// ChatBot Component
const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', content: 'Hi there! I\'m Mentor Guard, your education and career assistant. How can I help you today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://chatbot-im5p.onrender.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await response.json();

      const botMessage: ChatMessage = {
        role: 'bot',
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'bot',
        content: `Sorry, I encountered an error. Please try again later. ${error}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageSquare size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 h-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-blue-100"
          >
            <div className="bg-gradient-to-r from-blue-600 to-cyan-400 p-4 flex justify-between items-center">
              <h3 className="text-white font-semibold">Mentor Guard</h3>
              <button 
                onClick={toggleChat}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 ${
                    msg.role === 'user' ? 'ml-8 text-right' : 'mr-8'
                  }`}
                >
                  <div
                    className={`inline-block rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-blue-900 border border-blue-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white flex">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-500 transition-colors flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Hero Section Component
const HeroSection: React.FC<HeroProps> = ({
  title = "Empower Your Career with Career Track",
  subtitle = "Your ultimate destination for education & interview success!",
  secondaryCtaText = "Explore Services"
}) => {
  // Reference for Three.js container
  const threeContainerRef = useRef<HTMLDivElement>(null);
  
  // For floating elements animation
  const [floatingElements, setFloatingElements] = useState<Array<{
    id: number;
    size: number;
    x: number;
    y: number;
    duration: number;
    delay: number;
    opacity: number;
  }>>([]);
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!threeContainerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    
    // Set up canvas dimensions
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
    camera.position.z = 5;
    scene.add(camera);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Clear any existing canvas
    if (threeContainerRef.current.firstChild) {
      threeContainerRef.current.removeChild(threeContainerRef.current.firstChild);
    }
    
    threeContainerRef.current.appendChild(renderer.domElement);
    
    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    
    // Color palette
    const colors = [
      new THREE.Color(0xF8F9FA),  // Light gray
      new THREE.Color(0xECF4FF),  // Very light blue
      new THREE.Color(0xCFE3FF),  // Light blue
      new THREE.Color(0xA4C8FF),  // Mild blue
      new THREE.Color(0x7AAFFF)   // Medium blue
    ];
    
    // Distribute particles
    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Position
      posArray[i] = (Math.random() - 0.5) * 15;
      posArray[i + 1] = (Math.random() - 0.5) * 15;
      posArray[i + 2] = (Math.random() - 0.3) * 5;
      
      // Color - pick from palette
      const colorIndex = Math.floor(Math.random() * colors.length);
      const color = colors[colorIndex];
      colorArray[i] = color.r;
      colorArray[i + 1] = color.g;
      colorArray[i + 2] = color.b;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    // Material for particles
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });
    
    // Create the particle system
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Add geometric shapes
    // Torus
    const torusGeometry = new THREE.TorusGeometry(1.5, 0.2, 16, 100);
    const torusMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x42A5F5,
      transparent: true,
      opacity: 0.2
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-3, 2, -2);
    torus.rotation.x = Math.PI / 4;
    scene.add(torus);
    
    // Icosahedron
    const icoGeometry = new THREE.IcosahedronGeometry(1, 0);
    const icoMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x007BFF,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    const ico = new THREE.Mesh(icoGeometry, icoMaterial);
    ico.position.set(3, -2, -3);
    scene.add(ico);
    
    // Octahedron
    const octGeometry = new THREE.OctahedronGeometry(0.8, 0);
    const octMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00C3FF,
      transparent: true,
      opacity: 0.25
    });
    const oct = new THREE.Mesh(octGeometry, octMaterial);
    oct.position.set(2, 2, -4);
    scene.add(oct);
    
    // Handle resize
    const handleResize = () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      
      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      
      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    
    window.addEventListener('resize', handleResize);
    
    // Mouse interaction
    const mouse = {
      x: 0,
      y: 0
    };
    
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / sizes.width) * 2 - 1;
      mouse.y = -((event.clientY / sizes.height) * 2 - 1);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation loop
    const clock = new THREE.Clock();
    
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      // Animate particles
      particlesMesh.rotation.y = elapsedTime * 0.05;
      
      // Mouse interaction with particles
      particlesMesh.rotation.x = mouse.y * 0.1;
      particlesMesh.rotation.z = mouse.x * 0.1;
      
      // Animate shapes
      torus.rotation.x = elapsedTime * 0.3;
      torus.rotation.y = elapsedTime * 0.2;
      
      ico.rotation.x = elapsedTime * 0.4;
      ico.rotation.y = elapsedTime * 0.3;
      
      oct.rotation.x = -elapsedTime * 0.2;
      oct.rotation.z = elapsedTime * 0.3;
      
      // Render
      renderer.render(scene, camera);
      
      // Call animate again on the next frame
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      scene.clear();
      renderer.dispose();
    };
  }, []);
  
  // Initialize floating elements
  useEffect(() => {
    // Add random floating elements
    const elements = [];
    for (let i = 0; i < 12; i++) {
      elements.push({
        id: i,
        size: Math.random() * 30 + 10,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 15 + 20,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.4 + 0.2
      });
    }
    
    setFloatingElements(elements);
  }, []);
  
  return (
    <div className="relative min-h-screen flex items-center justify-center text-blue-900 overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Three.js Animated Background */}
      <div ref={threeContainerRef} className="absolute inset-0 z-0" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((el) => (
          <motion.div
            key={el.id}
            className="absolute bg-blue-200 rounded-full blur-md"
            style={{
              width: el.size,
              height: el.size,
              left: `${el.x}%`,
              top: `${el.y}%`,
              opacity: el.opacity
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              opacity: [el.opacity, el.opacity * 2, el.opacity]
            }}
            transition={{
              duration: el.duration,
              ease: "easeInOut",
              repeat: Infinity,
              delay: el.delay
            }}
          />
        ))}
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-5 gap-12 items-center">
        {/* Text Content */}
        <div className="space-y-8 md:col-span-3">
          {/* Main Heading with staggered animation */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500"
            >
              {title}
            </motion.h1>
          </div>

          {/* Subheading */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-lg md:text-xl text-blue-800 text-opacity-80 max-w-xl"
          >
            {subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >

<motion.button
  whileHover={{ 
    scale: 1.05,
    boxShadow: "0 0 20px rgba(0,195,255,0.3)"
  }}
  whileTap={{ scale: 0.95 }}
  onClick={() => document.getElementById("Features")?.scrollIntoView({ behavior: "smooth" })}
  className="group relative flex items-center justify-center space-x-2 px-8 py-4 rounded-xl border-2 border-cyan-400 text-cyan-500 font-semibold transition-all duration-300 overflow-hidden"
>
  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 origin-left"></div>
  <ArrowRight size={24} className="relative z-10" />
  <span className="relative z-10">{secondaryCtaText}</span>
</motion.button>

          </motion.div>

          {/* Feature Highlights */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="pt-8 space-y-4"
          >
            <p className="text-sm text-blue-800 text-opacity-70">Trusted by professionals across industries</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: BookOpen, text: "Comprehensive Courses", detail: "Learn from industry experts" },
                { icon: Lightbulb, text: "Career Guidance", detail: "Personalized mentorship" },
                { icon: CheckCircle2, text: "Interview Prep", detail: "Ace your dream job" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.2 + 0.9, 
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    y: -10, 
                    boxShadow: "0 20px 25px -5px rgba(66, 165, 245, 0.1), 0 8px 10px -6px rgba(66, 165, 245, 0.1)"
                  }}
                  className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-blue-100"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <feature.icon size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">{feature.text}</h3>
                      <p className="text-sm text-blue-700 text-opacity-70">{feature.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Visual Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut",
            delay: 0.3
          }}
          className="hidden md:block md:col-span-2"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-xl opacity-10"></div>
            
            {/* Device frame */}
            <div className="relative bg-white rounded-2xl shadow-xl p-6 border border-blue-100 backdrop-blur-sm bg-opacity-80">
              {/* Interface elements */}
              <div className="rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-slate-50 to-blue-50">
                {/* Header */}
                <div className="h-12 bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 bg-white rounded-full opacity-20"></div>
                    <div className="h-3 w-3 bg-white rounded-full opacity-20"></div>
                    <div className="h-3 w-3 bg-white rounded-full opacity-20"></div>
                  </div>
                  <div className="h-4 w-24 bg-white rounded mx-auto opacity-20"></div>
                </div>
                
                {/* Content area */}
                <div className="relative z-10 p-6">
                  {/* Progress indicator */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-sm text-blue-800 font-medium">Your Progress</div>
                    <div className="text-sm text-blue-600 font-medium">72%</div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-2 w-full bg-blue-100 rounded-full mb-6">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "72%" }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    ></motion.div>
                  </div>
                  
                  {/* Course items */}
                  <div className="space-y-4">
                    {[
                      { title: "Python Fundamentals", progress: 100, icon: "🐍" },
                      { title: "Data Structures", progress: 85, icon: "🧩" },
                      { title: "Web Development", progress: 42, icon: "🌐" },
                      { title: "Machine Learning Basics", progress: 12, icon: "🤖" }
                    ].map((course, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.2 }}
                        className="bg-white rounded-lg p-4 shadow-sm border border-blue-50 flex items-center space-x-3"
                      >
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                          {course.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-blue-900">{course.title}</h3>
                          <div className="h-1.5 w-full bg-blue-50 rounded-full mt-2">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                              initial={{ width: "0%" }}
                              animate={{ width: `${course.progress}%` }}
                              transition={{ duration: 1, delay: 1 + index * 0.1 }}
                            ></motion.div>
                          </div>
                        </div>
                        <div className="text-xs font-medium text-blue-800">{course.progress}%</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <motion.div 
              className="absolute -bottom-6 -right-6 h-24 w-24 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full blur-xl opacity-30"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            ></motion.div>
            <motion.div 
              className="absolute -top-6 -left-6 h-16 w-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-20"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            ></motion.div>
          </div>
        </motion.div>
      </div>

      {/* Chatbot component */}
      <ChatBot />
    </div>
  );
};

export default HeroSection;