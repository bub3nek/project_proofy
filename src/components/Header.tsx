'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <header className="primary-header">
            <div className="primary-header__inner">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <Image src="/brand-orbit.svg" alt="Proofy orbit" width={42} height={42} priority />
                    <div className="hidden sm:block">
                        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--color-text-muted)]">Project Proofy</p>
                        <p className="font-semibold text-[var(--color-text)] text-sm tracking-wide">by Dmytro Usoltsev</p>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="nav-links hidden md:flex">
                    <Link href="/">Home</Link>
                    <Link href="/gallery">Gallery</Link>
                    <Link href="/map">Map</Link>
                    <Link href="/admin">Admin</Link>
                    <Link href="/admin/upload">Upload</Link>
                </nav>

                {/* Desktop CTA */}
                <Link href="/gallery" className="pixel-btn pixel-btn-cyan text-[0.6rem] hidden md:inline-block">
                    VIEW ARCHIVE
                </Link>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden p-2 text-[var(--neon-cyan)] hover:text-[var(--neon-magenta)] transition-colors"
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="mobile-menu md:hidden">
                    <nav className="mobile-menu__nav">
                        <Link href="/" onClick={closeMenu}>Home</Link>
                        <Link href="/gallery" onClick={closeMenu}>Gallery</Link>
                        <Link href="/map" onClick={closeMenu}>Map</Link>
                        <Link href="/admin" onClick={closeMenu}>Admin</Link>
                        <Link href="/admin/upload" onClick={closeMenu}>Upload</Link>
                    </nav>
                    <Link
                        href="/gallery"
                        onClick={closeMenu}
                        className="pixel-btn pixel-btn-cyan text-[0.6rem] w-full text-center"
                    >
                        VIEW ARCHIVE
                    </Link>
                </div>
            )}
        </header>
    );
}
