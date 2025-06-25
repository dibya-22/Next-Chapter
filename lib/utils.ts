import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | null) {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    }).replace(/\//g, '-') + ' (' +
        date.toLocaleString('en-US', {
            weekday: 'short'
        }).toUpperCase() + ')'
}
export function getMonth(datenow: string | null = new Date().toISOString()) {
    if (!datenow) return 'Not available';
    const date = new Date(datenow);
    return date.toLocaleString('en-US', { month: 'long' });
}

export function capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}