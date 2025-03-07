"use client";
import { useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Download, Plus, X, Edit2, Briefcase, BookOpen, Code, Award } from "lucide-react";
import jsPDF from "jspdf";

type Section = 'personal' | 'education' | 'experience' | 'skills' | 'projects';

export default function Resume() {
  const [resumeData, setResumeData] = useState({
    personal: {
      firstName: "",
      lastName: "",
      title: "",
      email: "",
      phone: "",
      address: "",
      summary: "",
    },
    education: [
      { id: 1, institution: "", degree: "", graduationYear: "", description: "" },
    ],
    experience: [
      { id: 1, position: "", company: "", startDate: "", endDate: "", description: "" },
    ],
    skills: [{ id: 1, skill: "" }],
    projects: [{ id: 1, title: "", description: "" }],
  });

  const [activeSection, setActiveSection] = useState<Section>("personal");
  const [exportingPDF, setExportingPDF] = useState(false); // Added missing state

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  type PersonalField = 'firstName' | 'lastName' | 'title' | 'email' | 'phone' | 'address' | 'summary';

  const handleInputChange = (section: Section, field: PersonalField, value: string) => {
    setResumeData({
      ...resumeData,
      [section]: {
        ...resumeData[section],
        [field]: value,
      },
    });
  };

  type EducationField = 'institution' | 'degree' | 'graduationYear' | 'description';
  type ExperienceField = 'position' | 'company' | 'startDate' | 'endDate' | 'description';
  type SkillField = 'skill';
  type ProjectField = 'title' | 'description';

  const handleArrayInputChange = (
    section: 'education' | 'experience' | 'skills' | 'projects',
    index: number,
    field: EducationField | ExperienceField | SkillField | ProjectField,
    value: string
  ) => {
    const newArray = [...resumeData[section]];
    newArray[index] = { ...newArray[index], [field]: value };
    setResumeData({
      ...resumeData,
      [section]: newArray,
    });
  };

  const addItem = (section: 'education' | 'experience' | 'skills' | 'projects') => {
    const lastItem = resumeData[section][resumeData[section].length - 1];
    const newId = lastItem ? lastItem.id + 1 : 1;

    let newItem:
      | { id: number; institution: string; degree: string; graduationYear: string; description: string }
      | { id: number; position: string; company: string; startDate: string; endDate: string; description: string }
      | { id: number; skill: string }
      | { id: number; title: string; description: string };

    if (section === "education") {
      newItem = { id: newId, institution: "", degree: "", graduationYear: "", description: "" };
    } else if (section === "experience") {
      newItem = { id: newId, position: "", company: "", startDate: "", endDate: "", description: "" };
    } else if (section === "skills") {
      newItem = { id: newId, skill: "" };
    } else if (section === "projects") {
      newItem = { id: newId, title: "", description: "" };
    } else {
      throw new Error(`Unexpected section type: ${section}`);
    }

    setResumeData({
      ...resumeData,
      [section]: [...resumeData[section], newItem],
    });
  };

  const removeItem = (section: 'education' | 'experience' | 'skills' | 'projects', id: number) => {
    if (resumeData[section].length <= 1) return;
    setResumeData({
      ...resumeData,
      [section]: resumeData[section].filter((item: { id: number }) => item.id !== id),
    });
  };

  const sections = {
    personal: {
      title: "Personal Information",
      icon: <Edit2 className="h-5 w-5" />,
      gradient: "from-violet-500 to-purple-600",
      textGradient: "from-violet-600 to-purple-600",
      ringFocus: "ring-violet-500",
    },
    education: {
      title: "Education",
      icon: <BookOpen className="h-5 w-5" />,
      gradient: "from-blue-500 to-cyan-500",
      textGradient: "from-blue-600 to-cyan-600",
      ringFocus: "ring-blue-500",
    },
    experience: {
      title: "Work Experience",
      icon: <Briefcase className="h-5 w-5" />,
      gradient: "from-emerald-500 to-teal-500",
      textGradient: "from-emerald-600 to-teal-600",
      ringFocus: "ring-emerald-500",
    },
    skills: {
      title: "Skills",
      icon: <Code className="h-5 w-5" />,
      gradient: "from-amber-400 to-orange-500",
      textGradient: "from-amber-500 to-orange-500",
      ringFocus: "ring-amber-500",
    },
    projects: {
      title: "Projects",
      icon: <Award className="h-5 w-5" />,
      gradient: "from-pink-500 to-rose-500",
      textGradient: "from-pink-600 to-rose-600",
      ringFocus: "ring-pink-500",
    },
  };

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      
      const resumeContent = document.getElementById("resume-content");
      if (!resumeContent) {
        throw new Error("Resume content element not found");
      }
  
      // Create a new PDF document directly
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
  
      // Get content as HTML string
      const resumeHTML = resumeContent.innerHTML;
      
      // Create a temporary iframe to render the content with simplified styling
      const iframe = document.createElement('iframe');
      iframe.style.visibility = 'hidden';
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '794px'; // Match A4 width
      document.body.appendChild(iframe);
      
      // Wait for iframe to load
      await new Promise(resolve => {
        iframe.onload = resolve;
        
        // Set iframe content with simplified styles
        const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDocument) {
          iframeDocument.open();
          iframeDocument.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    color: #000;
                    margin: 20px;
                    background: white;
                  }
                  h1 { font-size: 24px; margin-bottom: 8px; color: #000; }
                  h2 { font-size: 18px; margin-bottom: 8px; color: #000; border-bottom: 2px solid #666; display: inline-block; padding-bottom: 4px; }
                  p { margin-bottom: 8px; line-height: 1.4; }
                  .section { margin-bottom: 20px; }
                  .header { margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
                  .position { font-weight: bold; color: #000; }
                  .company { color: #056c4e; }
                  .institution { font-weight: bold; color: #000; }
                  .degree { color: #2563eb; }
                  .dates { color: #666; font-size: 0.9em; }
                  .contact-info { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 10px; color: #666; }
                  .contact-item { display: flex; align-items: center; }
                  .section-content { margin-top: 10px; }
                  .job-entry, .education-entry { margin-bottom: 15px; }
                  .job-header, .education-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
                  .description { font-size: 0.9em; color: #444; white-space: pre-wrap; }
                </style>
              </head>
              <body>
                <div class="resume">
                  ${resumeHTML}
                </div>
              </body>
            </html>
          `);
          iframeDocument.close();
        }
      });
      
      // Get the rendered content
      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow) {
        throw new Error("Could not access iframe content");
      }
      
      // Use the iframe's document to generate PDF directly as text/layout
      // Extract and format each section of the resume
      const name = `${resumeData.personal.firstName} ${resumeData.personal.lastName}`.trim();
      const title = resumeData.personal.title;
      const contact = [];
      if (resumeData.personal.email) contact.push(`Email: ${resumeData.personal.email}`);
      if (resumeData.personal.phone) contact.push(`Phone: ${resumeData.personal.phone}`);
      if (resumeData.personal.address) contact.push(`Address: ${resumeData.personal.address}`);
      
      // Start building the PDF
      pdf.setFontSize(20);
      pdf.text(name || "Resume", 20, 20);
      
      if (title) {
        pdf.setFontSize(14);
        pdf.setTextColor(100, 50, 200);
        pdf.text(title, 20, 30);
      }
      
      // Contact info
      let yPos = 40;
      if (contact.length > 0) {
        pdf.setFontSize(10);
        pdf.setTextColor(80, 80, 80);
        for (let i = 0; i < contact.length; i++) {
          pdf.text(contact[i], 20, yPos);
          yPos += 6;
        }
        yPos += 5;
      }
      
      // Summary
      if (resumeData.personal.summary) {
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Professional Summary", 20, yPos);
        yPos += 7;
        
        const summaryLines = pdf.splitTextToSize(resumeData.personal.summary, 170);
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text(summaryLines, 20, yPos);
        yPos += summaryLines.length * 6 + 10;
      }
      
      // Education
      if (resumeData.education.some(edu => edu.institution || edu.degree)) {
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Education", 20, yPos);
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(37, 99, 235);
        pdf.line(20, yPos + 2, 60, yPos + 2);
        yPos += 10;
        
        for (const edu of resumeData.education) {
          if (!edu.institution && !edu.degree) continue;
          
          pdf.setFontSize(11);
          pdf.setTextColor(0, 0, 0);
          if (edu.institution) {
            pdf.text(edu.institution, 20, yPos);
            yPos += 6;
          }
          
          if (edu.degree) {
            pdf.setTextColor(37, 99, 235);
            pdf.text(edu.degree, 20, yPos);
            yPos += 6;
          }
          
          if (edu.graduationYear) {
            pdf.setFontSize(9);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Graduated: ${edu.graduationYear}`, 20, yPos);
            yPos += 6;
          }
          
          if (edu.description) {
            pdf.setFontSize(9);
            pdf.setTextColor(60, 60, 60);
            const descLines = pdf.splitTextToSize(edu.description, 170);
            pdf.text(descLines, 20, yPos);
            yPos += descLines.length * 5 + 5;
          }
          
          yPos += 5;
        }
      }
      
      // Experience
      if (resumeData.experience.some(exp => exp.position || exp.company)) {
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Professional Experience", 20, yPos);
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(5, 150, 105);
        pdf.line(20, yPos + 2, 100, yPos + 2);
        yPos += 10;
        
        for (const exp of resumeData.experience) {
          if (!exp.position && !exp.company) continue;
          
          pdf.setFontSize(11);
          pdf.setTextColor(0, 0, 0);
          if (exp.position) {
            pdf.text(exp.position, 20, yPos);
            yPos += 6;
          }
          
          if (exp.company) {
            pdf.setTextColor(5, 150, 105);
            pdf.text(exp.company, 20, yPos);
            yPos += 6;
          }
          
          if (exp.startDate || exp.endDate) {
            pdf.setFontSize(9);
            pdf.setTextColor(100, 100, 100);
            const dateText = `${exp.startDate || ""} - ${exp.endDate || "Present"}`;
            pdf.text(dateText, 20, yPos);
            yPos += 6;
          }
          
          if (exp.description) {
            pdf.setFontSize(9);
            pdf.setTextColor(60, 60, 60);
            const descLines = pdf.splitTextToSize(exp.description, 170);
            pdf.text(descLines, 20, yPos);
            yPos += descLines.length * 5 + 5;
          }
          
          yPos += 5;
        }
      }
      
      // Skills
      if (resumeData.skills.some(skill => skill.skill)) {
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Skills", 20, yPos);
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(245, 158, 11);
        pdf.line(20, yPos + 2, 40, yPos + 2);
        yPos += 10;
        
        const skills = resumeData.skills
          .filter(s => s.skill)
          .map(s => s.skill);
        
        if (skills.length > 0) {
          pdf.setFontSize(10);
          pdf.setTextColor(60, 60, 60);
          const skillText = skills.join(" • ");
          const skillLines = pdf.splitTextToSize(skillText, 170);
          pdf.text(skillLines, 20, yPos);
          yPos += skillLines.length * 6 + 5;
        }
      }
      
      // Projects
      if (resumeData.projects.some(proj => proj.title || proj.description)) {
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Projects", 20, yPos);
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(219, 39, 119);
        pdf.line(20, yPos + 2, 55, yPos + 2);
        yPos += 10;
        
        for (const proj of resumeData.projects) {
          if (!proj.title && !proj.description) continue;
          
          if (proj.title) {
            pdf.setFontSize(11);
            pdf.setTextColor(0, 0, 0);
            pdf.text(proj.title, 20, yPos);
            yPos += 6;
          }
          
          if (proj.description) {
            pdf.setFontSize(9);
            pdf.setTextColor(60, 60, 60);
            const descLines = pdf.splitTextToSize(proj.description, 170);
            pdf.text(descLines, 20, yPos);
            yPos += descLines.length * 5 + 5;
          }
          
          yPos += 5;
        }
      }
      
      // Clean up the iframe
      document.body.removeChild(iframe);
      
      // Save the PDF
      const fileName = resumeData.personal.firstName 
        ? `${resumeData.personal.firstName}_Resume.pdf`
        : "My_Resume.pdf";
      
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert(`PDF Export Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Head>
        <title>Modern Resume Builder</title>
        <meta name="description" content="Build your resume with a stunning real-time preview" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-6 px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center mb-10">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600"
            >
              Resume Crafter
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-3 text-gray-600 max-w-xl mx-auto"
            >
              Create a professional, eye-catching resume in minutes with our intuitive builder and real-time preview
            </motion.p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex-1 bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
            >
              <div className="flex overflow-x-auto p-1 bg-gray-50 border-b border-gray-200 scrollbar-hide">
                {(Object.keys(sections) as Section[]).map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`flex items-center px-4 py-3 whitespace-nowrap font-medium rounded-t-lg transition-all ${
                      activeSection === section
                        ? `bg-gradient-to-r ${sections[section].gradient} text-white`
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="mr-2">{sections[section].icon}</span>
                    {sections[section].title}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeSection === "personal" && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div variants={itemVariants} className="mb-8">
                      <h2 className={`text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r ${sections.personal.textGradient}`}>
                        {sections.personal.title}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        {(["firstName", "lastName", "title", "email", "phone", "address"] as PersonalField[]).map((field) => (
                          <motion.div key={field} variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                              {field.replace(/([A-Z])/g, " $1")}
                            </label>
                            <input
                              type="text"
                              className={`w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 ${sections.personal.ringFocus} focus:border-transparent transition-all`}
                              value={resumeData.personal[field]}
                              onChange={(e) => handleInputChange("personal", field, e.target.value)}
                              placeholder={`Enter your ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                            />
                          </motion.div>
                        ))}
                      </div>
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                        <textarea
                          className={`w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 h-32 focus:ring-2 ${sections.personal.ringFocus} focus:border-transparent transition-all`}
                          value={resumeData.personal.summary}
                          onChange={(e) => handleInputChange("personal", "summary", e.target.value)}
                          placeholder="Write a compelling summary of your professional background and career goals..."
                        />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}

                {activeSection === "education" && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div variants={itemVariants} className="mb-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${sections.education.textGradient}`}>
                          {sections.education.title}
                        </h2>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 py-2 bg-gradient-to-r ${sections.education.gradient} text-white rounded-lg flex items-center`}
                          onClick={() => addItem("education")}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Education
                        </motion.button>
                      </div>
                      {resumeData.education.map((edu, index) => (
                        <motion.div
                          key={edu.id}
                          variants={itemVariants}
                          className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200 relative transition-all hover:shadow-md"
                        >
                          {resumeData.education.length > 1 && (
                            <button
                              className="absolute right-2 top-2 text-gray-400 hover:text-red-500 bg-white rounded-full h-8 w-8 flex items-center justify-center shadow-sm transition-colors"
                              onClick={() => removeItem("education", edu.id)}
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {(["institution", "degree", "graduationYear"] as EducationField[]).map((field) => (
                              <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                  {field.replace(/([A-Z])/g, " $1")}
                                </label>
                                <input
                                  type="text"
                                  value={edu[field]}
                                  onChange={(e) => handleArrayInputChange("education", index, field, e.target.value)}
                                  placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                                  className={`w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:ring-2 ${sections.education.ringFocus} focus:border-transparent transition-all`}
                                />
                              </div>
                            ))}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              className={`w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:ring-2 ${sections.education.ringFocus} focus:border-transparent transition-all`}
                              value={edu.description}
                              onChange={(e) => handleArrayInputChange("education", index, "description", e.target.value)}
                              placeholder="Describe your studies, achievements, or relevant coursework..."
                            />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {activeSection === "experience" && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div variants={itemVariants} className="mb-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${sections.experience.textGradient}`}>
                          {sections.experience.title}
                        </h2>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 py-2 bg-gradient-to-r ${sections.experience.gradient} text-white rounded-lg flex items-center`}
                          onClick={() => addItem("experience")}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Experience
                        </motion.button>
                      </div>
                      {resumeData.experience.map((exp, index) => (
                        <motion.div
                          key={exp.id}
                          variants={itemVariants}
                          className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200 relative transition-all hover:shadow-md"
                        >
                          {resumeData.experience.length > 1 && (
                            <button
                              className="absolute right-2 top-2 text-gray-400 hover:text-red-500 bg-white rounded-full h-8 w-8 flex items-center justify-center shadow-sm transition-colors"
                              onClick={() => removeItem("experience", exp.id)}
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {(["position", "company", "startDate", "endDate"] as ExperienceField[]).map((field) => (
                              <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                  {field.replace(/([A-Z])/g, " $1")}
                                </label>
                                <input
                                  type="text"
                                  className={`w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:ring-2 ${sections.experience.ringFocus} focus:border-transparent transition-all`}
                                  onChange={(e) => handleArrayInputChange("experience", index, field, e.target.value)}
                                  placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                                  value={exp[field]}
                                />
                              </div>
                            ))}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              className={`w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:ring-2 ${sections.experience.ringFocus} focus:border-transparent transition-all`}
                              value={exp.description}
                              onChange={(e) => handleArrayInputChange("experience", index, "description", e.target.value)}
                              placeholder="Describe your responsibilities, achievements, and skills used..."
                            />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {activeSection === "skills" && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div variants={itemVariants} className="mb-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${sections.skills.textGradient}`}>
                          {sections.skills.title}
                        </h2>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 py-2 bg-gradient-to-r ${sections.skills.gradient} text-white rounded-lg flex items-center`}
                          onClick={() => addItem("skills")}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Skill
                        </motion.button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resumeData.skills.map((skillItem, index) => (
                          <motion.div
                            key={skillItem.id}
                            variants={itemVariants}
                            className="flex items-center p-2 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-sm transition-all"
                          >
                            <input
                              type="text"
                              className={`w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:ring-2 ${sections.skills.ringFocus} focus:border-transparent transition-all`}
                              value={skillItem.skill}
                              onChange={(e) => handleArrayInputChange("skills", index, "skill", e.target.value)}
                              placeholder="Enter a skill (e.g. JavaScript, Project Management)"
                            />
                            {resumeData.skills.length > 1 && (
                              <button
                                className="ml-2 text-gray-400 hover:text-red-500 bg-white rounded-full h-8 w-8 flex items-center justify-center shadow-sm transition-colors"
                                onClick={() => removeItem("skills", skillItem.id)}
                              >
                                <X className="h-5 w-5" />
                              </button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {activeSection === "projects" && (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div variants={itemVariants} className="mb-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${sections.projects.textGradient}`}>
                          {sections.projects.title}
                        </h2>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 py-2 bg-gradient-to-r ${sections.projects.gradient} text-white rounded-lg flex items-center`}
                          onClick={() => addItem("projects")}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Project
                        </motion.button>
                      </div>
                      {resumeData.projects.map((project, index) => (
                        <motion.div
                          key={project.id}
                          variants={itemVariants}
                          className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200 relative transition-all hover:shadow-md"
                        >
                          {resumeData.projects.length > 1 && (
                            <button
                              className="absolute right-2 top-2 text-gray-400 hover:text-red-500 bg-white rounded-full h-8 w-8 flex items-center justify-center shadow-sm transition-colors"
                              onClick={() => removeItem("projects", project.id)}
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                              type="text"
                              className={`w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:ring-2 ${sections.projects.ringFocus} focus:border-transparent transition-all`}
                              value={project.title}
                              onChange={(e) => handleArrayInputChange("projects", index, "title", e.target.value)}
                              placeholder="Enter project title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              className={`w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:ring-2 ${sections.projects.ringFocus} focus:border-transparent transition-all`}
                              value={project.description}
                              onChange={(e) => handleArrayInputChange("projects", index, "description", e.target.value)}
                              placeholder="Describe your project, technologies used, and outcomes..."
                            />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-all flex items-center"
                  onClick={() => {
                    const sectionKeys = Object.keys(sections) as Section[];
                    const currentIndex = sectionKeys.indexOf(activeSection);
                    if (currentIndex > 0) {
                      setActiveSection(sectionKeys[currentIndex - 1]);
                    }
                  }}
                >
                  <ChevronUp className="h-5 w-5 mr-1" /> Previous
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-all flex items-center"
                  onClick={() => {
                    const sectionKeys = Object.keys(sections) as Section[];
                    const currentIndex = sectionKeys.indexOf(activeSection);
                    if (currentIndex < sectionKeys.length - 1) {
                      setActiveSection(sectionKeys[currentIndex + 1]);
                    }
                  }}
                >
                  Next <ChevronDown className="h-5 w-5 ml-1" />
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex-1 bg-white backdrop-blur-sm bg-opacity-90 p-8 rounded-2xl shadow-xl border border-gray-200 relative"
            >
              <div className="flex justify-between items-center mb-6 pb-2 border-b">
                <h2 className="text-2xl font-bold text-gray-800">Resume Preview</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg flex items-center shadow-md ${exportingPDF ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={handleExportPDF}
                  disabled={exportingPDF}
                >
                  <Download className="h-5 w-5 mr-2" /> {exportingPDF ? "Exporting..." : "Export PDF"}
                </motion.button>
              </div>

              <div id="resume-content" className="resume-preview overflow-y-auto max-h-[800px] pr-4">
                <div className="mb-8 pb-4 border-b border-gray-200">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {resumeData.personal.firstName} {resumeData.personal.lastName}
                  </h1>
                  <p className="text-lg text-purple-600 font-medium mb-3">{resumeData.personal.title}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-600">
                    {resumeData.personal.email && (
                      <a href={`mailto:${resumeData.personal.email}`} className="flex items-center hover:text-purple-600 transition-colors">
                        <span className="mr-2">✉️</span>
                        {resumeData.personal.email}
                      </a>
                    )}
                    {resumeData.personal.phone && (
                      <div className="flex items-center">
                        <span className="mr-2">📱</span>
                        {resumeData.personal.phone}
                      </div>
                    )}
                    {resumeData.personal.address && (
                      <div className="flex items-center">
                        <span className="mr-2">📍</span>
                        {resumeData.personal.address}
                      </div>
                    )}
                  </div>
                </div>

                {resumeData.personal.summary && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3 pb-1 border-b-2 border-purple-500 inline-block">
                      Professional Summary
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {resumeData.personal.summary}
                    </p>
                  </div>
                )}

                {resumeData.education.some((edu) => edu.institution || edu.degree) && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-1 border-b-2 border-blue-500 inline-block">
                      Education
                    </h2>
                    {resumeData.education.map((edu, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            {edu.institution && <div className="font-semibold text-gray-900">{edu.institution}</div>}
                            {edu.degree && <div className="text-blue-600">{edu.degree}</div>}
                          </div>
                          {edu.graduationYear && (
                            <div className="text-gray-500 text-sm mt-1">
                              Graduated: {edu.graduationYear}
                            </div>
                          )}
                        </div>
                        {edu.description && (
                          <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.experience.some((exp) => exp.position || exp.company) && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-1 border-b-2 border-emerald-500 inline-block">
                      Professional Experience
                    </h2>
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            {exp.position && (
                              <div className="font-semibold text-gray-900">{exp.position}</div>
                            )}
                            {exp.company && (
                              <div className="text-emerald-600">{exp.company}</div>
                            )}
                          </div>
                          {(exp.startDate || exp.endDate) && (
                            <div className="text-gray-500 text-sm">
                              {exp.startDate} - {exp.endDate || "Present"}
                            </div>
                          )}
                        </div>
                        {exp.description && (
                          <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}