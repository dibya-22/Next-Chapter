 "use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Github } from 'lucide-react';
import Link from 'next/link';

const Warning = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Check if user has seen the warning before
        const warningSeen = localStorage.getItem('warningSeen');
        if (warningSeen) {
            setIsVisible(false);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Store in localStorage that user has seen the warning
        localStorage.setItem('warningSeen', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='fixed inset-0 flex items-center justify-center z-50 p-4'
                >
                    {/* Backdrop with blur effect */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm'
                        onClick={handleClose}
                    />

                    {/* Warning Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className='relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl 
                            bg-white dark:bg-gray-800 
                            border-2 border-red-600 dark:border-red-500 
                            rounded-xl p-4 sm:p-6 md:p-8 shadow-2xl
                            flex flex-col items-center justify-center
                            max-h-[90vh] overflow-y-auto'
                    >
                        {/* Warning Icon */}
                        <div className='mb-3 sm:mb-4'>
                            <AlertTriangle className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-red-600 dark:text-red-500' />
                        </div>

                        {/* Warning Message */}
                        <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-red-600 dark:text-red-500 text-center mb-3 sm:mb-4'>
                            Demo Project Notice
                        </h2>
                        
                        <div className='space-y-3 sm:space-y-4 text-center w-full'>
                            <p className='text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 px-2'>
                                ⚠️ This is a demonstration project for educational purposes.
                            </p>
                            <ul className='text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 space-y-1 sm:space-y-2 px-4'>
                                <li>• All payments are test transactions</li>
                                <li>• No physical or digital products will be delivered</li>
                                <li>• Book data is for demonstration only</li>
                                <li>• No real money will be charged</li>
                            </ul>
                            <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3 sm:mt-4 px-2'>
                                By continuing, you acknowledge that this is a demo project.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className='mt-6 sm:mt-8 flex gap-3 sm:gap-4 w-full justify-center'>
                            <button
                                onClick={handleClose}
                                className='px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 
                                    text-white rounded-lg transition-colors duration-200
                                    font-medium text-sm sm:text-base w-full sm:w-auto'
                            >
                                I Understand
                            </button>
                        </div>

                        {/* Footer with GitHub Link */}
                        <div className='mt-4 sm:mt-6 text-center w-full'>
                            <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2'>
                                Created by <Link href="https://x.com/dibya22_" target="_blank" className='cursor-pointer hover:underline'>Dibya</Link>
                            </p>
                            <Link 
                                href="https://github.com/dibya-22/Next-Chapter"
                                target="_blank"
                                rel="noopener noreferrer"
                                className='inline-flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400 
                                    hover:text-gray-900 dark:hover:text-gray-100 
                                    transition-colors duration-200 text-xs sm:text-sm'
                            >
                                <Github className='w-4 h-4 sm:w-5 sm:h-5' />
                                <span>View on GitHub</span>
                            </Link>
                        </div>

                        {/* Close Button */}
                        <button
                            className='absolute top-2 right-2 sm:top-4 sm:right-4 p-1 sm:p-2 rounded-full
                                text-gray-600 hover:text-gray-900 hover:bg-gray-100
                                dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700
                                transition-colors duration-200'
                            onClick={handleClose}
                            aria-label="Close warning"
                        >
                            <X className='w-4 h-4 sm:w-5 sm:h-5' />
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Warning;
