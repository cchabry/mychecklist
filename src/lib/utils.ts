
/**
 * Shared utility functions
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 * This is a utility function for combining Tailwind CSS classes conditionally
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Clean up and normalize a project ID
 * Removes any surrounding quotes or formatting issues
 */
export const cleanProjectId = (id: string | undefined): string => {
  if (!id) {
    console.error("Project ID is missing or undefined");
    return '';
  }
  
  console.log(`Cleaning project ID: "${id}"`);
  
  // If it's already a clean string, return it
  if (typeof id === 'string' && !id.startsWith('"')) {
    return id;
  }
  
  // Try to parse if it looks like a JSON string
  try {
    if (typeof id === 'string' && 
        id.startsWith('"') && 
        id.endsWith('"')) {
      const cleanedId = JSON.parse(id);
      console.log(`ID cleaned from JSON: "${id}" => "${cleanedId}"`);
      return cleanedId;
    }
  } catch (e) {
    console.error(`Error cleaning project ID: "${id}"`, e);
  }
  
  // Return as is if we couldn't clean it
  return id;
};

/**
 * Reset application state
 * Clears localStorage and performs other cleanup
 */
export const resetApplicationState = () => {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Reset any global state or cache as needed
    console.log('Application state has been reset');
    
    // Reload the page to ensure a clean state
    window.location.reload();
  } catch (error) {
    console.error('Error resetting application state:', error);
  }
};
