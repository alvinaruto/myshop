'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { FiCoffee, FiClock, FiMapPin, FiHeart, FiArrowRight } from 'react-icons/fi';

export default function HomePage() {

    // Scroll-triggered reveal using IntersectionObserver
    useEffect(() => {
        const revealEls = document.querySelectorAll(
            '.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade'
        );

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        // Once revealed, stop observing
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );

        revealEls.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <Navbar />

            {/* ── Hero Section ── */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-espresso">
                {/* Background Image with animated overlay */}
                <div className="absolute inset-0 z-0 hero-image-overlay">
                    <img
                        src="/images/coffee/hero.png"
                        alt="Coffee Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-espresso via-espresso/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-espresso via-transparent to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="max-w-2xl">
                        {/* Logo / Badge */}
                        <div className="flex items-center gap-4 mb-8 hero-badge">
                            <div className="w-16 h-16 border-2 border-gold rounded-xl flex items-center justify-center">
                                <span className="font-serif text-3xl font-black text-gold">B&B</span>
                            </div>
                            <div className="h-12 w-px bg-gold/30" />
                            <span className="font-serif text-sm tracking-[0.4em] uppercase text-gold/80 pt-1">
                                Brew & Bean
                            </span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl font-black text-white mb-6 leading-[1.1] hero-heading">
                            Experience the<br />
                            <span className="shimmer-gold">Art of Coffee</span>
                        </h1>

                        <p className="font-sans text-xl text-cream/80 max-w-lg mb-10 leading-relaxed italic hero-sub">
                            Crafting exceptional coffee with passion and precision. Discover your next favorite blend.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 hero-cta">
                            <Link
                                href="/menu"
                                className="inline-flex items-center justify-center px-10 py-4 bg-gold hover:bg-gold-light text-espresso font-serif text-lg font-bold rounded-full transition-all duration-300 shadow-2xl shadow-gold/20 btn-pulse"
                            >
                                VIEW MENU
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Vertical Text Decoration */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block hero-decoration">
                    <div className="flex flex-col items-center gap-8">
                        <div className="w-px h-24 bg-gold/30" />
                        <span
                            className="font-serif text-xs tracking-[1em] uppercase text-gold/40 rotate-180 mb-4 whitespace-nowrap"
                            style={{ writingMode: 'vertical-rl' }}
                        >
                            SINCE 2024
                        </span>
                        <div className="w-px h-24 bg-gold/30" />
                    </div>
                </div>
            </section>

            {/* ── Features Bar ── */}
            <section className="bg-espresso-light border-y border-gold/10 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
                        <div className="flex flex-col items-center text-center reveal-up delay-100">
                            <FiCoffee className="w-8 h-8 text-gold mb-4 feature-icon" />
                            <h4 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-gold/90">Artisan Brews</h4>
                            <p className="text-xs text-cream/40 mt-1 uppercase tracking-widest leading-relaxed">
                                Exceptional coffee<br />made with care
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center reveal-up delay-300">
                            <FiClock className="w-8 h-8 text-gold mb-4 feature-icon" />
                            <h4 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-gold/90">Relaxing Atmosphere</h4>
                            <p className="text-xs text-cream/40 mt-1 uppercase tracking-widest leading-relaxed">
                                A cozy space to<br />unwind and savor
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center reveal-up delay-500">
                            <div className="w-8 h-8 border-2 border-gold rounded-full flex items-center justify-center mb-4 feature-icon">
                                <span className="text-[10px] font-black text-gold">HK</span>
                            </div>
                            <h4 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-gold/90">Fresh Ground Beans</h4>
                            <p className="text-xs text-cream/40 mt-1 uppercase tracking-widest leading-relaxed">
                                Quality coffee from<br />freshly ground beans
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Coffee Section Promo ── */}
            <section id="coffee" className="py-32 bg-espresso relative overflow-hidden">
                {/* Decorative gradient top */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-cream/5 to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section header */}
                    <div className="flex flex-col items-center text-center mb-16">
                        <div className="w-20 h-px bg-gold/50 mb-8 reveal-scale" />
                        <h2 className="font-serif text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight reveal-up delay-100">
                            Sample Our{' '}
                            <span className="shimmer-gold italic">Artisan Brews</span>
                        </h2>
                        <p className="font-sans text-cream/60 max-w-2xl text-lg leading-relaxed mb-12 reveal-up delay-200">
                            Each cup is a journey of flavor, meticulously prepared by our expert baristas to give you the perfect morning or afternoon pick-me-up.
                        </p>
                    </div>

                    {/* Coffee Cards — staggered reveal */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="coffee-card flex flex-col bg-cream rounded-2xl overflow-hidden shadow-2xl group reveal-up delay-100">
                            <div className="relative aspect-square overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=800&q=80"
                                    alt="Flat White"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="font-serif text-xl font-bold text-espresso">Flat White</h3>
                                <p className="font-serif text-gold font-black mt-2">$2.99</p>
                            </div>
                        </div>

                        <div className="coffee-card flex flex-col bg-cream rounded-2xl overflow-hidden shadow-2xl group lg:mt-8 reveal-up delay-200">
                            <div className="relative aspect-square overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1553909489-eb2175ad3f3f?w=800&q=80"
                                    alt="Caramel Latte"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="font-serif text-xl font-bold text-espresso">Caramel Latte</h3>
                                <p className="font-serif text-gold font-black mt-2">$2.99</p>
                            </div>
                        </div>

                        <div className="coffee-card flex flex-col bg-cream rounded-2xl overflow-hidden shadow-2xl group reveal-up delay-300">
                            <div className="relative aspect-square overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80"
                                    alt="Cappuccino"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="font-serif text-xl font-bold text-espresso">Cappuccino</h3>
                                <p className="font-serif text-gold font-black mt-2">$2.99</p>
                            </div>
                        </div>

                        <div className="coffee-card flex flex-col bg-cream rounded-2xl overflow-hidden shadow-2xl group lg:mt-8 reveal-up delay-400">
                            <div className="relative aspect-square overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=800&q=80"
                                    alt="Espresso"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="font-serif text-xl font-bold text-espresso">Espresso</h3>
                                <p className="font-serif text-gold font-black mt-2">$1.99</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 text-center reveal-up delay-500">
                        <Link
                            href="/menu"
                            className="inline-flex items-center gap-2 font-serif text-lg font-bold text-gold hover:text-gold-light transition-colors group"
                        >
                            EXPLORE ENTIRE MENU
                            <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── About Section ── */}
            <section id="about" className="py-32 bg-white dark:bg-espresso-light transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        {/* Text side */}
                        <div>
                            <div className="w-20 h-px bg-gold mb-8 reveal-scale" />
                            <h2 className="font-serif text-4xl lg:text-6xl font-black text-espresso dark:text-white mb-8 transition-colors duration-500 reveal-left">
                                Our Story
                            </h2>
                            <div className="space-y-6">
                                <p className="text-xl text-stone-500 dark:text-cream/60 leading-relaxed transition-colors duration-500 reveal-up delay-100">
                                    Founded in the heart of Phnom Penh, Brew & Bean was born from a simple passion: to serve the city's finest artisan coffee in a space that celebrates craft and community.
                                </p>
                                <p className="text-xl text-stone-500 dark:text-cream/60 leading-relaxed transition-colors duration-500 reveal-up delay-200">
                                    We believe every cup tells a story. From the careful selection of beans to the precision of the roast, we are dedicated to excellence in every drop.
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-10 mt-16">
                                <div className="reveal-up delay-300">
                                    <p className="font-serif text-5xl font-black text-gold mb-2">5k+</p>
                                    <p className="text-xs font-bold text-stone-400 dark:text-cream/30 uppercase tracking-[0.3em]">Cups Served</p>
                                </div>
                                <div className="reveal-up delay-400">
                                    <p className="font-serif text-5xl font-black text-gold mb-2">4.9</p>
                                    <p className="text-xs font-bold text-stone-400 dark:text-cream/30 uppercase tracking-[0.3em]">Customer Rating</p>
                                </div>
                            </div>
                        </div>

                        {/* Image side */}
                        <div className="relative about-image-wrap reveal-right">
                            <div className="absolute -inset-4 border-2 border-gold/20 rounded-[2rem] -rotate-3 transition-transform duration-500" />
                            <img
                                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80"
                                alt="Cafe Interior"
                                className="relative rounded-[2rem] shadow-2xl grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="bg-espresso text-white py-24 border-t border-gold/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
                        {/* Brand */}
                        <div className="md:col-span-5 reveal-up delay-100">
                            <Link href="/" className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 border-2 border-gold rounded-xl flex items-center justify-center">
                                    <span className="font-serif text-2xl font-black text-gold">B&B</span>
                                </div>
                                <span className="text-2xl font-serif font-black tracking-[0.2em]">BREW & BEAN</span>
                            </Link>
                            <p className="text-cream/40 max-w-sm mb-10 leading-relaxed text-lg">
                                Your destination for artisan coffee and a moment of peace in Phnom Penh, Cambodia. 🇰🇭
                            </p>
                            <div className="flex items-center gap-2 text-gold/60">
                                <FiMapPin className="w-5 h-5" />
                                <span className="font-bold tracking-widest text-xs uppercase">64B street, Phnom Penh</span>
                            </div>
                        </div>

                        {/* Experience Links */}
                        <div className="md:col-span-3 reveal-up delay-200">
                            <h4 className="font-serif text-sm font-black uppercase tracking-[0.4em] mb-8 text-gold">Experience</h4>
                            <ul className="space-y-4">
                                <li>
                                    <Link href="/menu" className="footer-link text-cream/60 hover:text-white transition font-bold tracking-widest text-xs uppercase">
                                        Coffee Menu
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/order-status" className="footer-link text-cream/60 hover:text-white transition font-bold tracking-widest text-xs uppercase">
                                        Order Tracking
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#about" className="footer-link text-cream/60 hover:text-white transition font-bold tracking-widest text-xs uppercase">
                                        Our Story
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Visit Us */}
                        <div className="md:col-span-4 reveal-up delay-300">
                            <h4 className="font-serif text-sm font-black uppercase tracking-[0.4em] mb-8 text-gold">Visit Us</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pr-8">
                                    <span className="text-cream/60 font-bold tracking-widest text-xs uppercase">Mon - Sun</span>
                                    <span className="text-cream font-black tracking-widest text-xs uppercase">6AM - 10PM</span>
                                </div>
                                <p className="text-cream/40 text-sm italic mt-8">
                                    Made with <FiHeart className="inline w-4 h-4 text-red-500 mx-1" /> for coffee lovers.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-24 pt-12 border-t border-white/5 text-center text-cream/20 text-[10px] font-bold tracking-[0.5em] uppercase reveal-fade">
                        © 2024 BREW & BEAN. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
