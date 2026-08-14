import { type ClassValue, clsx } from 'clsx';

// Utility function for conditional CSS classes
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Generate random gradient for collections
export function getRandomGradient() {
  const colors = [
    '#ff9a9e', '#fad0c4', '#a1c4fd', '#c2e9fb', '#fbc2eb', '#a6c1ee',
    '#fdcbf1', '#e6dee9', '#ffecd2', '#fcb69f', '#d4fc79', '#96e6a1',
    '#84fab0', '#8fd3f4', '#cfd9df', '#e2ebf0'
  ];
  
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  const color2 = colors[Math.floor(Math.random() * colors.length)];
  const angle = Math.floor(Math.random() * 360);
  
  return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
}

// Format time greeting
export function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// Check if place is expired popup
export function isExpiredLimitedTimePopup(place: any): boolean {
  if (!place.popup) return false;
  if (!place.endDate) return false;
  return new Date(place.endDate) < new Date();
}

// Extract first name from full name
export function getFirstName(fullName?: string): string | null {
  if (!fullName) return null;
  return fullName.trim().split(' ')[0];
}

// Format date to readable string
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}