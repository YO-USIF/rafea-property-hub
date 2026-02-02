import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Escapes HTML special characters to prevent XSS attacks when inserting
 * user-controlled data into HTML strings (e.g., in print windows).
 * 
 * @param text - The string to escape (can be null or undefined)
 * @returns The escaped string, or empty string if input is null/undefined
 */
export function escapeHtml(text: string | null | undefined): string {
  if (text === null || text === undefined) return '';
  
  const str = String(text);
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
