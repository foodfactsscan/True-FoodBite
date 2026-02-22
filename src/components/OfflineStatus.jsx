import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineStatus = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [showOnlineMsg, setShowOnlineMsg] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            setShowOnlineMsg(true);
            setTimeout(() => setShowOnlineMsg(false), 5000);
        };
        const handleOffline = () => {
            setIsOffline(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-[9999] flex justify-center p-4 pointer-events-none"
                >
                    <div className="bg-red-600/95 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto border border-red-500/50">
                        <div className="bg-white/20 p-2 rounded-full">
                            <WifiOff size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">You're Offline</p>
                            <p className="text-xs text-red-100">Showing cached products only</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {showOnlineMsg && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-[9999] flex justify-center p-4 pointer-events-none"
                >
                    <div className="bg-emerald-600/95 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto border border-emerald-500/50">
                        <div className="bg-white/20 p-2 rounded-full">
                            <Wifi size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Back Online!</p>
                            <p className="text-xs text-emerald-100">Connection restored</p>
                        </div>
                        <button
                            onClick={() => setShowOnlineMsg(false)}
                            className="ml-2 hover:bg-white/10 p-1 rounded-full transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OfflineStatus;
