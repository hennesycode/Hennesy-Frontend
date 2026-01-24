import { useState, useEffect } from 'react';

interface SpaceLoaderProps {
    onComplete?: () => void;
    duration?: number; // in ms
}

const SpaceLoader = ({ onComplete, duration = 2000 }: SpaceLoaderProps) => {

    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('Inicializando...');


    useEffect(() => {
        const interval = 50; // Update every 50ms
        const increment = (100 / (duration / interval));

        const timer = setInterval(() => {
            setProgress(prev => {
                const next = prev + increment;

                // Update status text based on progress
                if (next > 20 && next <= 40) setStatusText('Autenticando...');
                else if (next > 40 && next <= 60) setStatusText('Cargando Perfil...');
                else if (next > 60 && next <= 80) setStatusText('Sincronizando Datos...');
                else if (next > 80) setStatusText('Despegando...');


                if (next >= 100) {
                    clearInterval(timer);
                    setTimeout(() => onComplete?.(), 500);
                    return 100;
                }
                return next;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [duration, onComplete]);

    const countdown = Math.max(0, Math.ceil(((100 - progress) / 100) * (duration / 1000)));

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
            style={{ background: 'radial-gradient(circle at center, #102217 0%, #0a120e 100%)' }}>

            {/* Starfield Layer */}
            <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
                {/* Animated Star Streaks */}
                <div className="absolute top-1/2 left-1/2 w-1 h-24 bg-gradient-to-t from-transparent to-primary -translate-x-1/2 -translate-y-[200%] rotate-45 opacity-20 animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 w-1 h-32 bg-gradient-to-t from-transparent to-white -translate-x-[300%] -translate-y-[150%] rotate-[120deg] opacity-10 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-1 h-16 bg-gradient-to-t from-transparent to-primary translate-x-[250%] translate-y-[100%] rotate-[210deg] opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-1 h-40 bg-gradient-to-t from-transparent to-white translate-x-[150%] -translate-y-[300%] rotate-[300deg] opacity-10 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-1 h-20 bg-gradient-to-t from-transparent to-primary -translate-x-[400%] translate-y-[200%] rotate-[15deg] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-1 h-32 bg-gradient-to-t from-transparent to-white translate-x-[400%] translate-y-[50%] rotate-[80deg] opacity-10 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            </div>

            {/* Main Content */}
            <div className="z-10 flex flex-col items-center gap-8 sm:gap-12 w-full max-w-xl px-4 sm:px-8">

                {/* Rocket Core */}
                <div className="relative">
                    {/* Engine Glow Pulse */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary/40 rounded-full blur-xl animate-pulse"
                        style={{ filter: 'drop-shadow(0 0 15px rgba(37, 244, 123, 0.6))' }}></div>

                    {/* Rocket Icon */}
                    <div className="flex items-center justify-center animate-bounce" style={{ transform: 'rotate(-45deg)' }}>
                        <svg className="w-20 h-20 sm:w-28 sm:h-28 text-white" style={{ filter: 'drop-shadow(0 0 15px rgba(37, 244, 123, 0.6))' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        </svg>
                    </div>
                </div>

                {/* Loading Progress Section */}
                <div className="w-full flex flex-col gap-4 sm:gap-6">
                    {/* Headline */}
                    <div className="flex flex-col items-center gap-2">
                        <h2 className="text-white tracking-[0.15em] sm:tracking-[0.2em] text-xs sm:text-sm font-bold uppercase text-center">
                            {statusText}
                        </h2>
                        <p className="text-primary/70 text-[9px] sm:text-[10px] tracking-widest font-medium uppercase text-center">
                            Hennesy Agency • Acceso Seguro
                        </p>

                    </div>

                    {/* Progress Bar */}
                    <div className="flex flex-col gap-2 sm:gap-3 w-full">
                        <div className="flex justify-between items-end px-1">
                            <p className="text-primary/60 text-[9px] sm:text-[10px] font-bold tracking-tighter">TELEMETRÍA ACTIVA</p>

                            <p className="text-white text-base sm:text-lg font-bold leading-none">{Math.round(progress)}%</p>
                        </div>

                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-100 ease-out"
                                style={{
                                    width: `${progress}%`,
                                    filter: 'drop-shadow(0 0 10px rgba(37, 244, 123, 0.6))'
                                }}
                            ></div>
                        </div>

                        <div className="flex justify-between items-start px-1">
                            <p className="text-white/30 text-[8px] sm:text-[9px] font-normal leading-normal">
                                L-0:00:{countdown.toString().padStart(2, '0')} PARA DESPLIEGUE
                            </p>
                            <p className="text-primary text-[8px] sm:text-[9px] font-bold tracking-widest animate-pulse uppercase">
                                Sincronizando...
                            </p>

                        </div>
                    </div>
                </div>
            </div>

            {/* Corner Decorations */}
            <div className="absolute top-4 sm:top-8 left-4 sm:left-8 flex gap-2 sm:gap-4 opacity-30">
                <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg border border-white/20">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg border border-white/20">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>

            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 flex flex-col items-end opacity-40">
                <div className="text-white text-[9px] sm:text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.3em]">HNS-2026</div>
                <div className="text-primary text-[7px] sm:text-[8px] font-medium tracking-[0.15em] sm:tracking-[0.2em] mt-1">STATUS: OPTIMAL</div>
            </div>
        </div>
    );
};

export default SpaceLoader;
