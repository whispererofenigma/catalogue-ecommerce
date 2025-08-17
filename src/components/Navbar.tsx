'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

import Search from './Search';
import { useOnClickOutside } from '@/app/hooks/useOnClickOutside';// <-- 1. Import the custom hook

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 2. Create a ref for the navbar element
  const navRef = useRef<HTMLElement>(null);

  // 3. Define the handler to close both menus
  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  };

  // 4. Use the custom hook to close menus on click outside
  useOnClickOutside(navRef, closeAllMenus);

  const navLinks = [
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },    
  ];

  const handleMobileSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    setIsMenuOpen(false); // Ensure menu closes when search opens
  };

  const handleMobileMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsSearchOpen(false); // Ensure search closes when menu opens
  };
  
  // 5. This function will be passed to the Search component
  const handleSearchComplete = () => {
    setIsSearchOpen(false);
  };

  return (
    // Attach the ref to the main nav element
    <nav ref={navRef} className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Xponent
            </Link>
          </div>

          {/* Desktop Search Bar (centered) */}
          <div className="hidden md:flex flex-grow justify-center px-10">
            {/* The desktop search doesn't need to collapse, so no prop is passed */}
            <Search />
          </div>

          {/* Right side: Desktop Links & Admin Button */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                {link.name}
              </Link>
            ))}
            <Link href="/admin" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300">
              Admin
            </Link>
          </div>

          {/* Mobile Menu Buttons */}
          <div className="flex gap-2 md:hidden">
            {/* Search Button */}
            <button
              onClick={handleMobileSearchToggle}
              type="button"
              className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-white hover:bg-blue-500 focus:outline-none"
            >
              <span className="sr-only">Open search</span>
              {/* Cleaned up Search SVG */}
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
            
            {/* Hamburger Button */}
            <button
              onClick={handleMobileMenuToggle}
              type="button"
              className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-white hover:bg-blue-500 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* --- Mobile Menus --- */}
      {/* We can combine them or keep them separate; a transition effect could make this smoother */}

      {/* Mobile Search Dropdown */}
      <div className={`${isSearchOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-search">
        <div className="px-4 pt-2 pb-4">
          <Search onSearchComplete={handleSearchComplete} />
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-gray-700 hover:bg-blue-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={closeAllMenus} // <-- Close menu on link click
            >
              {link.name}
            </Link>
          ))}
          <Link 
            href="/admin" 
            className="bg-blue-600 text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
            onClick={closeAllMenus} // <-- Close menu on link click
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </nav>
  );
}