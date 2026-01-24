import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import hennesyLogo from '../assets/hennesy-logo.png';

/**
 * HomePage - Main landing page for Hennesy
 * Futuristic space-themed marketing agency landing page
 */
const HomePage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Toggle scroll lock when menu is modified
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Also close menu when screen is resized to larger breakpoint
            const handleResize = () => {
                if (window.innerWidth >= 768) setIsMenuOpen(false);
            }
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [isMenuOpen]);

    const scrollToSection = (id: string) => {
        setIsMenuOpen(false);
        const element = document.querySelector(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col nebula-bg overflow-hidden font-display selection:bg-primary selection:text-white">
            {/* Shooting stars animation */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="star star-1"></div>
                <div className="star star-2"></div>
                <div className="star star-3"></div>
                <div className="star star-4"></div>
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] pointer-events-none z-0 opacity-40"></div>

            {/* Scan overlay animation */}
            <div className="absolute inset-0 scan-overlay pointer-events-none z-0"></div>

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 py-4 lg:px-12 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}>
                <div className={`max-w-7xl mx-auto rounded-xl px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-300 ${scrolled ? 'glass-panel bg-opacity-90 shadow-lg shadow-primary/10' : 'glass-panel'}`}>
                    {/* Logo */}
                    <div className="flex items-center gap-3 z-50 relative">
                        <Link to="/" className="w-10 h-10 flex items-center justify-center group">
                            <img
                                src={hennesyLogo}
                                alt="Hennesy Logo"
                                className="w-full h-full object-contain group-hover:drop-shadow-[0_0_8px_rgba(0,255,176,0.8)] transition-all"
                            />
                        </Link>
                        <Link to="/" className="text-lg sm:text-xl font-bold tracking-tight text-white uppercase hover:text-primary-light transition-colors">
                            Hennesy
                        </Link>
                    </div>

                    {/* Desktop navigation links */}
                    <div className="hidden md:flex items-center gap-8">
                        <a onClick={(e) => { e.preventDefault(); scrollToSection('#servicios'); }} className="cursor-pointer text-sm font-medium text-gray-300 hover:text-primary-light transition-colors hover:scale-105 transform" href="#servicios">Servicios</a>
                        <a onClick={(e) => { e.preventDefault(); scrollToSection('#portafolio'); }} className="cursor-pointer text-sm font-medium text-gray-300 hover:text-primary-light transition-colors hover:scale-105 transform" href="#portafolio">Portafolio</a>
                        <a onClick={(e) => { e.preventDefault(); scrollToSection('#contacto'); }} className="cursor-pointer text-sm font-medium text-gray-300 hover:text-primary-light transition-colors hover:scale-105 transform" href="#contacto">Contacto</a>
                    </div>

                    {/* CTAs */}
                    <div className="flex items-center gap-2 sm:gap-4 z-50">
                        <Link
                            to="/login"
                            className="hidden sm:block text-xs font-medium text-gray-400 hover:text-white uppercase tracking-wider transition-colors"
                        >
                            Portal
                        </Link>
                        <Link
                            to="/login"
                            className="relative group overflow-hidden rounded-lg bg-primary/20 border border-primary/50 px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white transition-all hover:bg-primary/30 hover:shadow-[0_0_15px_rgba(0,138,117,0.5)] active:scale-95"
                        >
                            <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                                Inicializar
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </span>
                        </Link>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
                                <span className={`block w-6 h-0.5 bg-current transform transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                                <span className={`block w-6 h-0.5 bg-current transform transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                                <span className={`block w-6 h-0.5 bg-current transform transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-40 bg-background-dark/95 backdrop-blur-xl md:hidden transition-all duration-500 flex flex-col items-center justify-center ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-100%] pointer-events-none'}`}>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 p-8 opacity-20">
                    <div className="w-64 h-64 bg-primary rounded-full blur-[100px]"></div>
                </div>
                <div className="absolute bottom-0 left-0 p-8 opacity-20">
                    <div className="w-64 h-64 bg-blue-500 rounded-full blur-[100px]"></div>
                </div>

                <div className="flex flex-col items-center justify-center gap-8 p-4 w-full relative z-10">
                    <a onClick={() => scrollToSection('#servicios')} href="#servicios" className="text-2xl font-bold text-white hover:text-primary-light transition-colors tracking-widest hover:scale-110 transform duration-300">SERVICIOS</a>
                    <a onClick={() => scrollToSection('#portafolio')} href="#portafolio" className="text-2xl font-bold text-white hover:text-primary-light transition-colors tracking-widest hover:scale-110 transform duration-300">PORTAFOLIO</a>
                    <a onClick={() => scrollToSection('#contacto')} href="#contacto" className="text-2xl font-bold text-white hover:text-primary-light transition-colors tracking-widest hover:scale-110 transform duration-300">CONTACTO</a>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-xl font-medium text-gray-400 hover:text-white uppercase tracking-widest mt-8">
                        Portal
                    </Link>
                </div>
            </div>

            {/* Main content */}
            <main className="relative z-10 flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-12 pt-32 pb-24 sm:pt-40 sm:pb-32 lg:pt-36 lg:pb-20 min-h-screen">
                <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    {/* Text content - left side */}
                    <div className="lg:col-span-7 flex flex-col gap-6 sm:gap-8 text-center lg:text-left order-2 lg:order-1">
                        {/* Status indicator */}
                        <div className="flex items-center justify-center lg:justify-start gap-3 animate-fade-in">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-light opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-light shadow-[0_0_8px_#00FFB0]"></span>
                            </div>
                            <span className="text-xs font-mono text-primary-light tracking-[0.2em] uppercase">
                                Sistema en Línea // Red Activa
                            </span>
                        </div>

                        {/* Main heading */}
                        <div className="space-y-6 animate-slide-up">
                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-metallic drop-shadow-lg">
                                ELEVANDO<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">FRONTERAS DIGITALES</span>
                            </h1>
                            <p className="text-gray-400 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light border-l-2 border-primary/30 pl-0 lg:pl-6">
                                Diseñamos estrategias de marketing y soluciones de software que impulsan su marca años luz adelante.{' '}
                                <span className="text-gray-200 block mt-2">Centro de control para su evolución digital.</span>
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <button className="group relative flex items-center justify-center h-14 px-8 rounded-lg bg-primary text-white text-base font-bold tracking-wide transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,176,0.4)] hover:-translate-y-1 border border-primary-light/50 w-full sm:w-auto overflow-hidden">
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                                <span className="mr-2 relative z-10">INICIAR LANZAMIENTO</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11l4-4m0 0l-4-4m4 4H3m10 4v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6a2 2 0 012 2v2" />
                                </svg>
                            </button>
                            <div className="flex items-center gap-4 text-gray-400">
                                <div className="h-px w-8 bg-gray-700"></div>
                                <span className="text-xs uppercase tracking-widest font-mono">Est. 2042</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="pt-8 grid grid-cols-3 gap-6 border-t border-white/5 mt-6 max-w-lg mx-auto lg:mx-0 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                            <div className="group cursor-default">
                                <div className="text-2xl sm:text-3xl font-bold text-white group-hover:text-primary-light transition-colors">+30</div>
                                <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-1">CLIENTES</div>
                            </div>
                            <div className="group cursor-default">
                                <div className="text-2xl sm:text-3xl font-bold text-white group-hover:text-primary-light transition-colors">2.5s</div>
                                <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-1">Tiempo Carga</div>
                            </div>
                            <div className="group cursor-default">
                                <div className="text-2xl sm:text-3xl font-bold text-white group-hover:text-primary-light transition-colors">+10</div>
                                <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-1">SISTEMAS</div>
                            </div>
                        </div>
                    </div>

                    {/* Visual - right side */}
                    <div className="lg:col-span-5 relative flex items-center justify-center perspective-1000 mt-0 lg:mt-0 order-1 lg:order-2 animate-float">
                        {/* Glow background */}
                        <div className="absolute w-[140%] h-[140%] bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>

                        {/* Main visual container */}
                        <div className="relative w-full aspect-square max-w-[320px] sm:max-w-[400px] lg:max-w-[500px] group transform transition-transform duration-500 hover:rotate-1">
                            {/* Corner decorations */}
                            <div className="absolute -top-4 -right-4 p-2 border-r-2 border-t-2 border-primary-light/50 w-16 h-16 z-20 rounded-tr-lg"></div>
                            <div className="absolute -bottom-4 -left-4 p-2 border-l-2 border-b-2 border-primary-light/50 w-16 h-16 z-20 rounded-bl-lg"></div>

                            {/* Main image container */}
                            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 glass-panel z-10">
                                <img
                                    className="w-full h-full object-cover opacity-90 mix-blend-lighten hover:scale-110 transition-transform duration-1000"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkAogz38Bt-G19Ufsnh-FYDFu7i7GB0Jmt2jZxr9lF-RnPwpMXYvyuzkw3MZETL55Jv-UD7kk0pd-KxbcIyCmxKvX4n8ivJj85mJlkCX3IoJzCW4ebnIyiSCBkYw_ew27b-5TUeGOiefO2OWWdyn7iF97zOTBFCQaZ6sjdoPFIGEWsvg2QFZ6Hj7T_VAcIxd6KoatuCGpKcbxdGYkDy9-PpcJDKwQqxnJCjtakPPOCPgCRMWpnq9PqUgwwdSTKBQauJWrRbBQ0ur2K"
                                    alt="Futuristic spaceship"
                                />
                                {/* Grid overlay on image */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,176,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,176,0.1)_1px,transparent_1px)] bg-[length:24px_24px] pointer-events-none"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent"></div>
                            </div>

                            {/* Orbiting social icons */}
                            <div className="absolute inset-[-15%] pointer-events-none z-20">
                                <div className="orbit-ring w-full h-full rounded-full relative border border-white/5">
                                    {/* Facebook - top */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center animate-bounce-slow">
                                        <div className="orbit-item-content w-full h-full flex items-center justify-center rounded-full icon-3d bg-slate-900/60 pointer-events-auto cursor-pointer border border-primary/30 hover:border-primary">
                                            <svg className="w-5 sm:w-7 h-5 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Instagram - right */}
                                    <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center animate-bounce-slow" style={{ animationDelay: '1s' }}>
                                        <div className="orbit-item-content w-full h-full flex items-center justify-center rounded-full icon-3d bg-slate-900/60 pointer-events-auto cursor-pointer border border-primary/30 hover:border-primary">
                                            <svg className="w-5 sm:w-7 h-5 sm:h-7 text-white" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                                                <rect height="20" rx="5" ry="5" width="20" x="2" y="2" />
                                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* WhatsApp - bottom */}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center animate-bounce-slow" style={{ animationDelay: '2s' }}>
                                        <div className="orbit-item-content w-full h-full flex items-center justify-center rounded-full icon-3d bg-slate-900/60 pointer-events-auto cursor-pointer border border-primary/30 hover:border-primary">
                                            <svg className="w-5 sm:w-7 h-5 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.231-.298.347-.496.116-.198.058-.372-.03-.545-.089-.174-.793-1.912-1.087-2.618-.288-.692-.577-.598-.792-.609-.197-.009-.421-.009-.645-.009-.222 0-.584.083-.89.412-.306.33-1.169 1.141-1.169 2.784 0 1.642 1.198 3.227 1.365 3.45.167.224 2.361 3.606 5.72 5.06 2.373 1.026 2.854.819 3.368.765.515-.054 1.652-.676 1.886-1.328.234-.652.234-1.21.164-1.329-.07-.119-.248-.19-.545-.34z" />
                                                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.07-1.33A9.95 9.95 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.74 0-3.36-.56-4.68-1.5l-.33-.2-3.42.89.91-3.33-.22-.35A7.95 7.95 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* TikTok - left */}
                                    <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center animate-bounce-slow" style={{ animationDelay: '1.5s' }}>
                                        <div className="orbit-item-content w-full h-full flex items-center justify-center rounded-full icon-3d bg-slate-900/60 pointer-events-auto cursor-pointer border border-primary/30 hover:border-primary">
                                            <svg className="w-5 sm:w-7 h-5 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom gradient overlay to blend with potential footer */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background-dark to-transparent pointer-events-none z-0"></div>

            {/* Custom styles for animations that might not be in tailwind.config yet - inline here for safety or ensuring they work */}
            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 0.5; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }
                 @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default HomePage;
