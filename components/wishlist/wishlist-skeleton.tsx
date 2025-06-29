import React from 'react';
import { SectionHeader } from '@/components/section-header';

const WishlistSkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 animate-pulse">
        <div className="flex flex-col items-center">
            <div className="w-[120px] sm:w-[140px] md:w-[180px] h-[160px] sm:h-[180px] md:h-[240px] bg-gray-300 dark:bg-gray-700 rounded-xl mb-3"></div>
            <div className="w-full text-center space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mx-auto"></div>
            </div>
        </div>
    </div>
);

export const WishlistSkeleton = () => {
    return (
        <div className='font-[family-name:var(--font-poppins)] w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-20 sm:pt-24 lg:pt-28'>
            <div className="wishlist-container space-y-4 sm:space-y-6 lg:space-y-8 mb-6 sm:mb-10">
                <SectionHeader title="My Wishlist" />
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                    <WishlistSkeletonCard />
                    <WishlistSkeletonCard />
                    <WishlistSkeletonCard />
                    <WishlistSkeletonCard />
                    <WishlistSkeletonCard />
                </div>
            </div>
        </div>
    );
}; 