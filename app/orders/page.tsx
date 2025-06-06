"use client";
import React, { useState } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';


const Order = () => {
    const { user, isLoaded, isSignedIn } = useUser();

    if (!isSignedIn) {
        return (
            <div className='font-[family-name:var(--font-poppins)] w-[70vw] mx-auto mt-[11vh] flex flex-col items-center justify-center gap-4'>
                <h1 className='text-2xl font-bold'>Please Sign In</h1>
                <p className='text-gray-600 dark:text-gray-400'>You need to be signed in to view your cart.</p>
                <SignInButton mode="modal">
                    <Button variant="custom">Sign In</Button>
                </SignInButton>
            </div>
        );
    }

    return (
        <div className='font-[family-name:var(--font-poppins)] w-[70vw] mx-auto mt-[11vh]'>
            <h1 className='text-2xl font-bold'>Your Orders</h1>
            <div className="order-items">
                {/* Add your order items here */}
            </div>
        </div>
    )
}

export default Order
