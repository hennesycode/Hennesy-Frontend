import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import SpaceLoader from '../../components/SpaceLoader';

/**
 * Country codes data
 */
const COUNTRY_CODES = [
    { code: 'CO', name: 'Colombia', dial_code: '+57', flag: '🇨🇴' },
    { code: 'US', name: 'USA', dial_code: '+1', flag: '🇺🇸' },
    { code: 'MX', name: 'México', dial_code: '+52', flag: '🇲🇽' },
    { code: 'ES', name: 'España', dial_code: '+34', flag: '🇪🇸' },
    { code: 'AR', name: 'Argentina', dial_code: '+54', flag: '🇦🇷' },
    { code: 'CL', name: 'Chile', dial_code: '+56', flag: '🇨🇱' },
    { code: 'PE', name: 'Perú', dial_code: '+51', flag: '🇵🇪' },
];

/**
 * LoginPage - Authentication portal for Hennesy
 */
const LoginPage = () => {
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [stars, setStars] = useState<{ id: number; left: string; delay: string; duration: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        userId: '',       // Identifier
        linkCode: '',     // Password
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        countryCode: '+57',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });

    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [passwordTouched, setPasswordTouched] = useState(false);

    // Initialize stars on mount
    useEffect(() => {
        const newStars = [
            { id: 1, left: '10%', delay: '0s', duration: '7s' },
            { id: 2, left: '30%', delay: '2s', duration: '5s' },
            { id: 3, left: '70%', delay: '1.5s', duration: '8s' },
            { id: 4, left: '85%', delay: '4s', duration: '6s' },
        ];
        setStars(newStars);
    }, []);

    // Password Validation Logic
    useEffect(() => {
        if (!passwordTouched && !formData.password) return;
        const errors: string[] = [];
        const pwd = formData.password;
        if (pwd.length < 6) errors.push('Mínimo 6 caracteres.');
        if (!/[A-Z]/.test(pwd)) errors.push('Al menos una mayúscula.');
        if (!/[0-9]/.test(pwd)) errors.push('Al menos un número.');
        if (!/[^A-Za-z0-9]/.test(pwd)) errors.push('Al menos un símbolo.');
        setPasswordErrors(errors);
    }, [formData.password, passwordTouched]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'password') setPasswordTouched(true);
        // Clear errors on change
        if (apiError) setApiError(null);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(null);
        setIsLoading(true);

        try {
            const response = await api.post('/login', {
                identifier: formData.userId,
                password: formData.linkCode
            });

            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // Show the space loader instead of navigating immediately
            setIsLoading(false);
            setShowLoader(true);
        } catch (err: any) {
            console.error('Login error:', err);
            const msg = err.response?.data?.error || 'Error al iniciar sesión. Verifique credenciales.';
            setApiError(msg);
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordErrors.length > 0) return;
        setApiError(null);
        setSuccessMsg(null);
        setIsLoading(true);

        try {
            await api.post('/register', {
                first_name: formData.firstName,
                last_name: formData.lastName,
                username: formData.username,
                email: formData.email,
                country_code: formData.countryCode,
                phone_number: formData.phoneNumber,
                password: formData.password,
                confirm_password: formData.confirmPassword
            });

            // On success, switch to login and show message
            setSuccessMsg("Registro exitoso. Identifícate para entrar.");
            setAuthMode('login');
            // Clear register form? Optional
        } catch (err: any) {
            console.error('Register error:', err);
            // DRF Validation errors come as object { field: [errors] } or generic { error: msg }
            let msg = 'Error en el registro.';
            if (err.response?.data) {
                if (err.response.data.error) {
                    msg = err.response.data.error; // Generic logic error
                } else {
                    // Field errors logic
                    const firstKey = Object.keys(err.response.data)[0];
                    if (firstKey) {
                        const firstErr = err.response.data[firstKey];
                        msg = `${firstKey}: ${Array.isArray(firstErr) ? firstErr[0] : firstErr}`;
                    }
                }
            }
            setApiError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {showLoader && (
                <SpaceLoader
                    duration={2000}
                    onComplete={() => navigate('/dashboard')}
                />
            )}
            <div className={`font-display bg-background-dark text-white min-h-screen w-full overflow-hidden relative selection:bg-primary selection:text-background-dark flex items-center justify-center ${showLoader ? 'hidden' : ''}`}>
                {/* Background Layer */}
                <div className="absolute inset-0 z-0 bg-nebula bg-cover bg-center opacity-60 mix-blend-screen" data-alt="Deep space nebula with dark teal and blue clouds"></div>
                <div className="absolute inset-0 z-0 bg-[#0a131f] opacity-80"></div>
                <div className="absolute inset-0 z-0 bg-grid-pattern bg-[length:40px_40px] opacity-20 perspective-[500px] rotate-x-20 scale-150 transform origin-bottom"></div>
                {stars.map((star) => (
                    <div key={star.id} className="absolute top-0 w-1 h-1 bg-white rounded-full animate-star-fall opacity-0" style={{ left: star.left, animationDelay: star.delay, animationDuration: star.duration }}></div>
                ))}
                <div className="absolute inset-0 pointer-events-none z-10 opacity-15 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px]"></div>

                <Link to="/" className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-black/20 backdrop-blur-md border border-white/10 text-xs font-mono text-gray-400 hover:text-white hover:border-primary/50 transition-all duration-300 group">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    <span>VOLVER A LA BASE</span>
                </Link>

                <div className="relative z-20 w-full max-w-[520px] p-4 sm:p-8 my-8 sm:my-12">
                    <div className="glass-panel w-full rounded-2xl flex flex-col p-6 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-pulse-border relative overflow-hidden backdrop-blur-xl bg-[#0d1621]/70 border border-[#3cff14]/20">
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/50 rounded-tl-2xl"></div>
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/50 rounded-br-2xl"></div>

                        <div className="flex flex-col items-center mb-8 text-center relative z-10 animate-slide-up">
                            <div className="mb-4 text-primary flex items-center justify-center gap-2">
                                <svg className="w-8 h-8 animate-pulse text-[#00FFB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="text-xs tracking-[0.2em] font-bold uppercase opacity-80 text-[#00FFB0]">Sistema Hennesy v4.2</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Identificación</h1>
                            <p className="text-gray-400 text-sm tracking-wide">Acceso restringido a personal autorizado.</p>
                        </div>

                        {/* API Messages */}
                        {apiError && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-xs font-mono text-center animate-fade-in">
                                FAILED: {apiError}
                            </div>
                        )}
                        {successMsg && (
                            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-xs font-mono text-center animate-fade-in">
                                SUCCESS: {successMsg}
                            </div>
                        )}

                        <div className="relative w-full bg-[#121810] rounded-xl p-1.5 mb-8 border border-white/10 shadow-inner animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primary rounded-lg shadow-[0_0_15px_rgba(60,255,20,0.4)] transition-transform duration-300 ease-out z-0 ${authMode === 'register' ? 'translate-x-[100%]' : 'translate-x-0'}`}></div>
                            <div className="relative z-10 flex w-full h-10">
                                <button onClick={() => setAuthMode('login')} className={`flex-1 flex items-center justify-center cursor-pointer font-bold text-sm tracking-wide transition-colors duration-300 outline-none ${authMode === 'login' ? 'text-[#0a131f]' : 'text-gray-400 hover:text-white'}`}>PORTAL DE ACCESO</button>
                                <button onClick={() => setAuthMode('register')} className={`flex-1 flex items-center justify-center cursor-pointer font-bold text-sm tracking-wide transition-colors duration-300 outline-none ${authMode === 'register' ? 'text-[#0a131f]' : 'text-gray-400 hover:text-white'}`}>NUEVO RECLUTA</button>
                            </div>
                        </div>

                        <div className="relative">
                            {/* === LOGIN FORM === */}
                            <form onSubmit={handleLogin} className={`flex flex-col gap-5 w-full transition-all duration-300 ${authMode === 'login' ? 'opacity-100 translate-x-0 relative z-10' : 'opacity-0 -translate-x-10 absolute top-0 left-0 pointer-events-none z-0'}`}>
                                <div className="group relative">
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 transition-colors duration-300 group-focus-within:text-[#3cff14] group-focus-within:drop-shadow-[0_0_8px_rgba(60,255,20,0.6)]">ID de Usuario / Correo</label>
                                    <div className="relative flex items-center">
                                        <input type="text" name="userId" placeholder="Ej: AGENTE-007" className="w-full bg-[#1a2634]/50 border-b-2 border-gray-600 focus:border-primary text-white placeholder-gray-600 px-4 py-3 pl-11 outline-none transition-all duration-300 focus:bg-[#1a2634]/80 rounded-t-lg font-mono text-sm" value={formData.userId} onChange={handleInputChange} disabled={isLoading} />
                                        <span className="material-symbols-outlined absolute left-3 text-gray-500 transition-colors duration-300 group-focus-within:text-[#3cff14]">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .883-.393 1.627-1.006 2.122C9.408 8.441 9.695 9 10 9h4c.305 0 .592-.559.994-1.878C14.393 6.627 14 5.883 14 5h-4z" /></svg>
                                        </span>
                                    </div>
                                </div>
                                <div className="group relative">
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 transition-colors duration-300 group-focus-within:text-[#3cff14] group-focus-within:drop-shadow-[0_0_8px_rgba(60,255,20,0.6)]">Código de Enlace</label>
                                    <div className="relative flex items-center">
                                        <input type="password" name="linkCode" placeholder="••••••••" className="w-full bg-[#1a2634]/50 border-b-2 border-gray-600 focus:border-primary text-white placeholder-gray-600 px-4 py-3 pl-11 outline-none transition-all duration-300 focus:bg-[#1a2634]/80 rounded-t-lg font-mono text-sm" value={formData.linkCode} onChange={handleInputChange} disabled={isLoading} />
                                        <span className="material-symbols-outlined absolute left-3 text-gray-500 transition-colors duration-300 group-focus-within:text-[#3cff14]">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </span>
                                    </div>
                                </div>
                                <button type="submit" disabled={isLoading} className="group relative mt-4 w-full h-12 flex items-center justify-center bg-primary hover:bg-[#32d911] text-[#0a131f] disabled:bg-gray-600 font-bold text-lg tracking-widest uppercase rounded-lg overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(60,255,20,0.3)] hover:shadow-[0_0_30px_rgba(60,255,20,0.5)] active:scale-[0.98]">
                                    <span className="relative z-10 flex items-center gap-2">
                                        {isLoading ? 'Conectando...' : 'Iniciar Secuencia'}
                                        {!isLoading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>}
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
                                </button>
                                <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                                    <a className="hover:text-primary transition-colors cursor-pointer" href="#">¿Código perdido?</a>
                                    <span className="opacity-50 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        SISTEMA SEGURO
                                    </span>
                                </div>
                            </form>

                            {/* === REGISTER FORM === */}
                            <form onSubmit={handleRegister} className={`flex flex-col gap-4 w-full transition-all duration-300 ${authMode === 'register' ? 'opacity-100 translate-x-0 relative z-10' : 'opacity-0 translate-x-10 absolute top-0 left-0 pointer-events-none z-0'}`}>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="group relative flex-1">
                                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 group-focus-within:text-[#3cff14]">Nombres</label>
                                        <input type="text" name="firstName" placeholder="Tus Nombres" className="w-full bg-[#1a2634]/50 border-b-2 border-gray-600 focus:border-primary text-white placeholder-gray-600 px-4 py-3 outline-none transition-all duration-300 focus:bg-[#1a2634]/80 rounded-t-lg font-mono text-sm" value={formData.firstName} onChange={handleInputChange} disabled={isLoading} />
                                    </div>
                                    <div className="group relative flex-1">
                                        <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 group-focus-within:text-[#3cff14]">Apellidos</label>
                                        <input type="text" name="lastName" placeholder="Tus Apellidos" className="w-full bg-[#1a2634]/50 border-b-2 border-gray-600 focus:border-primary text-white placeholder-gray-600 px-4 py-3 outline-none transition-all duration-300 focus:bg-[#1a2634]/80 rounded-t-lg font-mono text-sm" value={formData.lastName} onChange={handleInputChange} disabled={isLoading} />
                                    </div>
                                </div>
                                <div className="group relative">
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 group-focus-within:text-[#3cff14]">Nombre de Usuario</label>
                                    <div className="relative flex items-center">
                                        <input type="text" name="username" placeholder="Ej: falcon_99" className="w-full bg-[#1a2634]/50 border-b-2 border-gray-600 focus:border-primary text-white placeholder-gray-600 px-4 py-3 pl-11 outline-none transition-all duration-300 focus:bg-[#1a2634]/80 rounded-t-lg font-mono text-sm" value={formData.username} onChange={handleInputChange} disabled={isLoading} />
                                        <span className="material-symbols-outlined absolute left-3 text-gray-500 transition-colors duration-300 group-focus-within:text-[#3cff14]">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </span>
                                    </div>
                                </div>
                                <div className="group relative">
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 group-focus-within:text-[#3cff14]">Correo</label>
                                    <div className="relative flex items-center">
                                        <input type="email" name="email" placeholder="agente@hennesy.com" className="w-full bg-[#1a2634]/50 border-b-2 border-gray-600 focus:border-primary text-white placeholder-gray-600 px-4 py-3 pl-11 outline-none transition-all duration-300 focus:bg-[#1a2634]/80 rounded-t-lg font-mono text-sm" value={formData.email} onChange={handleInputChange} disabled={isLoading} />
                                        <span className="material-symbols-outlined absolute left-3 text-gray-500 transition-colors duration-300 group-focus-within:text-[#3cff14]">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </span>
                                    </div>
                                </div>
                                <div className="group relative">
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 group-focus-within:text-[#3cff14]">Móvil Seguro</label>
                                    <div className="flex gap-2">
                                        <div className="relative w-1/3 min-w-[120px]">
                                            <select name="countryCode" className="w-full h-full bg-[#1a2634]/50 border-b-2 border-gray-600 focus:border-primary text-white px-3 py-3 outline-none transition-all duration-300 focus:bg-[#1a2634]/80 rounded-t-lg font-mono text-sm appearance-none cursor-pointer" value={formData.countryCode} onChange={handleInputChange} disabled={isLoading}>
                                                {COUNTRY_CODES.map((country) => (
                                                    <option key={country.code} value={country.dial_code} className="bg-[#0a131f]">{country.flag} {country.dial_code}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="relative flex-1">
                                            <input type="tel" name="phoneNumber" placeholder="300 000 0000" className="w-full bg-[#1a2634]/50 border-b-2 border-gray-600 focus:border-primary text-white placeholder-gray-600 px-4 py-3 outline-none transition-all duration-300 focus:bg-[#1a2634]/80 rounded-t-lg font-mono text-sm" value={formData.phoneNumber} onChange={handleInputChange} disabled={isLoading} />
                                        </div>
                                    </div>
                                </div>
                                <div className="group relative">
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 group-focus-within:text-[#3cff14]">Contraseña</label>
                                    <div className="relative flex items-center">
                                        <input type="password" name="password" placeholder="Mínimo 8 caracteres" className="w-full bg-[#1a2634]/50 border-b-2 border-gray-600 focus:border-primary text-white placeholder-gray-600 px-4 py-3 pl-11 outline-none transition-all duration-300 focus:bg-[#1a2634]/80 rounded-t-lg font-mono text-sm" value={formData.password} onChange={handleInputChange} disabled={isLoading} />
                                        <span className="material-symbols-outlined absolute left-3 text-gray-500 transition-colors duration-300 group-focus-within:text-[#3cff14]">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                        </span>
                                    </div>
                                    {passwordErrors.length > 0 && (
                                        <div className="mt-2 text-[10px] text-red-500 font-mono tracking-wide animate-fade-in space-y-1">
                                            {passwordErrors.map((err, idx) => <div key={idx} className="flex items-center gap-1"><span>•</span> {err}</div>)}
                                        </div>
                                    )}
                                </div>
                                <div className="group relative">
                                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 group-focus-within:text-[#3cff14]">Configurar Contraseña</label>
                                    <div className="relative flex items-center">
                                        <input type="password" name="confirmPassword" placeholder="Repetir contraseña" className="w-full bg-[#1a2634]/50 border-b-2 border-gray-600 focus:border-primary text-white placeholder-gray-600 px-4 py-3 pl-11 outline-none transition-all duration-300 focus:bg-[#1a2634]/80 rounded-t-lg font-mono text-sm" value={formData.confirmPassword} onChange={handleInputChange} disabled={isLoading} />
                                        <span className="material-symbols-outlined absolute left-3 text-gray-500 transition-colors duration-300 group-focus-within:text-[#3cff14]">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </span>
                                    </div>
                                </div>
                                <button type="submit" disabled={isLoading} className="group relative mt-4 w-full h-12 flex items-center justify-center bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-[#0a131f] disabled:opacity-50 font-bold text-lg tracking-widest uppercase rounded-lg overflow-hidden transition-all duration-300 shadow-[0_0_10px_rgba(60,255,20,0.1)] hover:shadow-[0_0_30px_rgba(60,255,20,0.5)] active:scale-[0.98]">
                                    <span className="relative z-10 flex items-center gap-2">
                                        {isLoading ? 'Registrando...' : 'Confirmar Registro'}
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </span>
                                </button>
                            </form>
                        </div>

                        <div className="mt-8 pt-4 border-t border-white/5 flex justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-[0.2em]">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                Servidor en Línea
                            </div>
                        </div>
                    </div>
                </div>
                <div className="fixed bottom-4 right-4 text-white/20 font-mono text-xs pointer-events-none select-none hidden sm:block">COORDS: 48.8566^ N, 2.3522^ E</div>
                <div className="fixed top-4 left-4 text-white/20 font-mono text-xs pointer-events-none select-none hidden sm:block">SYS.DIAGNOSTIC: OK</div>
            </div>
        </>
    );
};

export default LoginPage;
