export function VersusBackground() {
    return (
        <>
            <div className="fixed inset-0 bg-gradient-to-b from-sky-300 via-blue-100 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black transition-colors duration-1000 -z-30" />

            <div className="fixed bottom-0 left-0 right-0 -z-20 pointer-events-none opacity-40">
                <svg viewBox="0 0 1200 400" className="w-full h-auto text-slate-400 dark:text-slate-800 fill-current">
                    <path d="M0,400 L0,200 L200,100 L400,180 L600,80 L800,160 L1000,120 L1200,200 L1200,400 Z" />
                </svg>
            </div>

            <div className="fixed bottom-0 left-0 right-0 -z-10 pointer-events-none opacity-60">
                <svg viewBox="0 0 1200 300" className="w-full h-auto text-slate-300 dark:text-slate-700 fill-current">
                    <path d="M0,300 L150,150 L300,220 L450,100 L600,180 L750,120 L900,200 L1050,140 L1200,250 L1200,300 Z" />
                </svg>
            </div>
        </>
    );
}
