'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    FileText, 
    MessageSquare, 
    Youtube, 
    ClipboardCheck, 
    Mic2, 
    Code2, 
    Menu, 
    X,
    Github,
} from 'lucide-react';
import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton
} from '@clerk/nextjs';

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { name: 'Quiz Generator', href: '/quiz-generator', icon: <FileText className="w-5 h-5" /> },
        { name: 'Chat with PDF', href: '/chat-pdf', icon: <MessageSquare className="w-5 h-5" /> },
        { name: 'YT Summarizer', href: '/yt-summarizer', icon: <Youtube className="w-5 h-5" /> },
        { name: 'ATS Analyzer', href: '/ats-analyzer', icon: <ClipboardCheck className="w-5 h-5" /> },
        { name: 'AI Interview', href: '/ai-interview', icon: <Mic2 className="w-5 h-5" /> },
        { name: 'Coding Portfolio', href: '/coding-portfolio', icon: <Code2 className="w-5 h-5" /> },
        { name: 'Chat with GitHub', href: '/chat-github', icon: <Github className="w-5 h-5" /> },
    ];

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14"> {/* Reduced from h-20 to h-14 */}
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            CareerTrack
                        </Link>
                    </div>

                    {/* Desktop Menu - Icons Only */}
                    <div className="hidden md:flex items-center space-x-1"> {/* Minimal spacing */}
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={item.name} 
                                className={`p-2 rounded-lg transition-colors ${
                                    pathname === item.href
                                        ? 'bg-blue-50 text-blue-600' 
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                }`}
                            >
                                {item.icon}
                            </Link>
                        ))}
                        <div className="ml-2"> {/* Small margin for auth */}
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="p-2 text-gray-600 hover:text-blue-600">
                                        <span className="text-sm">Sign In</span>
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" /> }
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu - Full Text */}
            {isMenuOpen && (
                <div className="md:hidden absolute w-full bg-white border-b shadow-lg z-50">
                    <div className="px-4 py-3 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg w-full ${
                                    pathname === item.href
                                        ? 'bg-blue-50 text-blue-600' 
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {item.icon}
                                <span className="text-sm font-medium">{item.name}</span>
                            </Link>
                        ))}
                        <div className="pt-2 border-t border-gray-100">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                                        Sign In
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <div className="px-3 py-2">
                                    <UserButton />
                                </div>
                            </SignedIn>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}