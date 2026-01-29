import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Pulse Error Boundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center p-8 z-[9999]">
                    <div className="max-w-md w-full glass-silver p-12 rounded-3xl text-center border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v10M12 16v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-light text-white mb-4 tracking-tighter">
                            Oops, the <span className="font-bold">Pulse</span> skipped a beat!
                        </h1>
                        <p className="text-slate-500 mb-10 leading-relaxed font-light">
                            Something went wrong with the interface. Don't worry, your focus data is safe.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full btn-silver py-4 text-black hover:bg-white"
                            >
                                Restart System
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm("This will clear all local settings and data. Are you sure?")) {
                                        localStorage.clear();
                                        window.location.reload();
                                    }
                                }}
                                className="w-full py-2 text-[10px] text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors"
                            >
                                Emergency Clear Cache
                            </button>
                        </div>
                        <p className="mt-6 text-[10px] text-slate-700 uppercase tracking-[0.2em] font-bold">
                            Error Boundary Active // v2.21
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
