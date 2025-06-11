"use client"

import type React from "react"
import { useState, useMemo, useCallback } from "react"
import { Country, State } from "country-state-city"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface CheckoutFormProps {
    user?: {
        firstName?: string
        lastName?: string
        email?: string
        address?: {
            street?: string
            city?: string
            state?: string
            zipCode?: string
            country?: string
        }
    }
    totalAmount: number
    onPaymentInit: (amount: number, shippingAddress: string) => Promise<void>
}

export default function CheckoutForm({ user = {}, totalAmount, onPaymentInit }: CheckoutFormProps) {
    const [selectedCountry, setSelectedCountry] = useState(user?.address?.country || "IN")
    const [selectedState, setSelectedState] = useState(user?.address?.state || "")
    const [isProcessing, setIsProcessing] = useState(false)
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        zipCode: user?.address?.zipCode || '',
    })

    // Memoize countries and states to prevent unnecessary recalculations
    const countries = useMemo(() => Country.getAllCountries(), [])
    const states = useMemo(() => 
        selectedCountry ? State.getStatesOfCountry(selectedCountry) : [],
        [selectedCountry]
    )

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCountry || !selectedState) {
            alert('Please select country and state');
            return;
        }
        
        setIsProcessing(true)
        try {
            const shippingAddress = `${formData.street}, ${formData.city}, ${selectedState}, ${selectedCountry}, ${formData.zipCode}`
            await onPaymentInit(totalAmount, shippingAddress)
        } catch (error) {
            console.error("Error initiating payment:", error)
        } finally {
            setIsProcessing(false)
        }
    }, [selectedCountry, selectedState, formData, totalAmount, onPaymentInit])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }, [])

    const handleCountryChange = useCallback((value: string) => {
        setSelectedCountry(value)
        setSelectedState('') // Reset state when country changes
    }, [])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input 
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 focus:border-gray-500 dark:focus:border-gray-400"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input 
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 focus:border-gray-500 dark:focus:border-gray-400"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 focus:border-gray-500 dark:focus:border-gray-400"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input 
                            id="street"
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                            className="rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 focus:border-gray-500 dark:focus:border-gray-400"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Select value={selectedCountry} onValueChange={handleCountryChange}>
                                <SelectTrigger className="rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 focus:border-gray-500 dark:focus:border-gray-400">
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl max-h-[300px]">
                                    {countries.map((country) => (
                                        <SelectItem key={country.isoCode} value={country.isoCode}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State/Province</Label>
                            <Select value={selectedState} onValueChange={setSelectedState}>
                                <SelectTrigger className="rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 focus:border-gray-500 dark:focus:border-gray-400">
                                    <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl max-h-[300px]">
                                    {states.map((state) => (
                                        <SelectItem key={state.isoCode} value={state.isoCode}>
                                            {state.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 focus:border-gray-500 dark:focus:border-gray-400"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="zipCode">{selectedCountry === "IN" ? "PIN Code" : "ZIP/Postal Code"}</Label>
                            <Input
                                id="zipCode"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                                className="rounded-xl focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 focus:border-gray-500 dark:focus:border-gray-400"
                                required
                            />
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full h-12 text-lg font-medium bg-black/90 hover:bg-black/70 dark:bg-white/80 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl transition-colors"
                        disabled={isProcessing}
                    >
                        {isProcessing ? "Processing..." : `Proceed to Pay ₹${totalAmount}`}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
