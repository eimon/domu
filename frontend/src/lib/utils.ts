import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(value: number | string): string {
    return Math.round(Number(value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
