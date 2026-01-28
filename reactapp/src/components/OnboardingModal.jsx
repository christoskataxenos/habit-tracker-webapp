import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Database, Lock, CheckCircle, ArrowRight, X } from 'lucide-react';

export default function OnboardingModal({ isOpen, onComplete }) {
    const [step, setStep] = useState(1);
    const totalSteps = 2; // Δύο βασικά βήματα: Καλωσόρισμα και Privacy/Terms

    // Έλεγχος αν είμαστε σε Light Mode για το styling
    const isLightMode = document.documentElement.classList.contains('light');

    if (!isOpen) return null;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop / Φόντο */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className={`w-full max-w-2xl relative z-10 overflow-hidden rounded-[2.5rem] border shadow-2xl ${isLightMode
                        ? 'bg-white border-slate-200 shadow-slate-200/50'
                        : 'bg-slate-950 border-white/10 shadow-black'
                        }`}
                >
                    {/* Header Image/Icon Section */}
                    <div className={`h-32 flex items-center justify-center relative ${isLightMode ? 'bg-slate-50' : 'bg-white/5'}`}>
                        <div className={`absolute inset-0 opacity-20 ${isLightMode ? 'bg-indigo-500' : 'bg-indigo-400'} blur-[80px]`} />
                        <div className={`p-4 rounded-2xl border relative z-10 ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
                            {step === 1 ? (
                                <Database className={`w-10 h-10 ${isLightMode ? 'text-indigo-600' : 'text-indigo-400'}`} />
                            ) : (
                                <Shield className={`w-10 h-10 ${isLightMode ? 'text-emerald-500' : 'text-emerald-400'}`} />
                            )}
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        {step === 1 ? (
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="space-y-6 text-center"
                            >
                                <h2 className={`text-3xl font-black tracking-tight ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                                    Welcome to <span className="text-indigo-500">Pulse Protocol</span>
                                </h2>
                                <p className={`text-lg leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                    Ευχαριστούμε που επιλέξατε το Pulse. Ένα επαγγελματικό εργαλείο για την παρακολούθηση της μελέτης και της παραγωγικότητάς σας.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                    <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                                        <Lock className="w-5 h-5 text-indigo-400 mb-2 mx-auto" />
                                        <h4 className={`font-bold text-sm ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>Security First</h4>
                                        <p className="text-[10px] text-slate-500">No cloud accounts required.</p>
                                    </div>
                                    <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                                        <CheckCircle className="w-5 h-5 text-emerald-400 mb-2 mx-auto" />
                                        <h4 className={`font-bold text-sm ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>Full Control</h4>
                                        <p className="text-[10px] text-slate-500">Your data, your rules.</p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h2 className={`text-3xl font-black tracking-tight ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                                        Privacy & Terms
                                    </h2>
                                    <p className={`text-sm mt-2 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Η ιδιωτικότητά σας είναι η προτεραιότητά μας.
                                    </p>
                                </div>

                                <div className={`p-6 rounded-3xl border h-64 overflow-y-auto custom-scrollbar ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'}`}>
                                    <div className={`space-y-4 text-sm ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                                        <section>
                                            <h4 className="font-bold text-indigo-500 uppercase text-[10px] tracking-widest mb-1">100% Local Logic</h4>
                                            <p>Το Pulse αποθηκεύει <b>όλα</b> τα δεδομένα σας τοπικά στον υπολογιστή σας μέσω LocalStorage και τοπικών αρχείων. Δεν υπάρχει κεντρικός server, δεν συλλέγουμε analytics και δεν έχουμε πρόσβαση στα δεδομένα σας.</p>
                                        </section>
                                        <section>
                                            <h4 className="font-bold text-indigo-500 uppercase text-[10px] tracking-widest mb-1">Zero Tracking</h4>
                                            <p>Δεν χρησιμοποιούμε cookies τρίτων, trackers ή telemetry. Η εφαρμογή λειτουργεί πλήρως offline.</p>
                                        </section>
                                        <section>
                                            <h4 className="font-bold text-indigo-500 uppercase text-[10px] tracking-widest mb-1">Sync Policy</h4>
                                            <p>Ο συγχρονισμός (Cloud Bridge) γίνεται χειροκίνητα από εσάς. Εσείς επιλέγετε αν και πότε θα σώσετε ένα αντίγραφο στο δικό σας Cloud Drive (Dropbox/Google Drive).</p>
                                        </section>
                                        <section>
                                            <h4 className="font-bold text-indigo-500 uppercase text-[10px] tracking-widest mb-1">Disclaimer</h4>
                                            <p>Η εφαρμογή παρέχεται "ως έχει" (as-is). Είστε υπεύθυνοι για τη διατήρηση αντιγράφων ασφαλείας των δεδομένων σας μέσω του Analytics Vault.</p>
                                        </section>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                    <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                                    <p className={`text-[10px] md:text-xs font-medium ${isLightMode ? 'text-slate-600' : 'text-indigo-200'}`}>
                                        Συνεχίζοντας, αποδέχεστε ότι το Pulse είναι μια τοπική εφαρμογή και τα δεδομένα σας παραμένουν στη δική σας κατοχή.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Pagination & Action Button */}
                        <div className="mt-12 flex flex-col items-center gap-6">
                            <div className="flex gap-2">
                                {[1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${step === i
                                            ? 'w-8 bg-indigo-500'
                                            : 'w-2 bg-slate-700'
                                            }`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleNext}
                                className={`w-full py-4 rounded-2xl font-black text-sm tracking-[0.2em] transition-all flex items-center justify-center gap-2 group ${isLightMode
                                    ? 'bg-slate-900 text-white hover:bg-black shadow-xl'
                                    : 'bg-white text-slate-900 hover:bg-slate-200 shadow-xl shadow-indigo-500/10'
                                    }`}
                            >
                                {step === totalSteps ? 'GET STARTED' : 'CONTINUE'}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
