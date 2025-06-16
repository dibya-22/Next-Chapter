"use client";
import React, { useState } from 'react';
import Image from 'next/image';

const Warning = () => {
    const [isVisible, setIsVisible] = useState(false); // change this in the time of production to true

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    }

    if (isVisible) {
        return (
            <div className='fixed inset-0 flex items-center justify-center z-50'>
                {/* Backdrop */}
                <div className='absolute inset-0 bg-black/50 dark:bg-black/70' />

                {/* Warning Container */}
                <div className='relative w-fit bg-white dark:bg-gray-800 
                    border-2 border-red-600 dark:border-red-500 
                    rounded-[0.5rem] p-10 shadow-lg
                    flex flex-col items-center justify-center'>

                    {/* Warning Message */}
                    <h2 className='text-4xl font-bold text-red-600 dark:text-red-500 text-center'>
                        Warning!
                    </h2>
                    <p className='mt-4 text-lg text-gray-700 dark:text-gray-300 text-center'>
                        ⚠️ This is a demo project. All payments are test transactions and no physical or digital products will be delivered.
                    </p>
                    <p className='mt-2 text-lg text-gray-700 dark:text-gray-300 text-center'>
                        Click the <span onClick={toggleVisibility}>close</span> button to continue.
                    </p>

                    {/* Close Button */}
                    <button
                        className='absolute top-3 right-3 p-2 rounded-full
                            text-gray-600 hover:text-gray-900 hover:bg-gray-100
                            dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700
                            transition-colors duration-200'
                        onClick={toggleVisibility}
                        aria-label="Close warning"
                    >
                        <Image
                            width={16}
                            height={16}
                            src="/icons/close.png"
                            alt="Close"
                            className='dark:invert'
                        />
                    </button>
                </div>
            </div>
        )
    }

    return null; // Return null when not visible
}

export default Warning
