import React from 'react';
import { SectionHeader } from '@/components/section-header';

const CartSkeletonCard = () => (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-16 h-24 sm:w-20 sm:h-28 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
            <div>
                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-32 sm:w-48 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 sm:w-32"></div>
            </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
    </div>
);

export const CartSkeleton = () => {
    return (
        <div className='font-[family-name:var(--font-poppins)] w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 pt-20 sm:pt-24 lg:pt-28'>
            <div className="cart-container space-y-4 sm:space-y-6 lg:space-y-8 mb-6 sm:mb-10">
                <SectionHeader title="Your Cart" />
                <div className="cart-items space-y-3 sm:space-y-4">
                    <CartSkeletonCard />
                    <CartSkeletonCard />
                    <CartSkeletonCard />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mt-6 sm:mt-8 animate-pulse">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/5"></div>
                        </div>
                        <div className="flex justify-between">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/5"></div>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-600 my-3"></div>
                        <div className="flex justify-between">
                            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                        </div>
                    </div>
                    <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-md mt-6"></div>
                </div>
            </div>
        </div>
    );
}; 