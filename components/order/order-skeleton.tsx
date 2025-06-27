import React from 'react';

const OrderSkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 sm:p-5 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="text-right">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-12 mb-2"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                </div>
                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>
        </div>
    </div>
);

export const OrderSkeleton = () => {
    return (
        <div className="font-[family-name:var(--font-poppins)] w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6 sm:mb-8 animate-pulse"></div>
            <div className="space-y-4 sm:space-y-6">
                <OrderSkeletonCard />
                <OrderSkeletonCard />
                <OrderSkeletonCard />
            </div>
        </div>
    );
}; 