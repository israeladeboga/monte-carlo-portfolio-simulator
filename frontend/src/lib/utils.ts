
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercentage = (value: number, decimals: number = 1) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const validateFinancialInput = (value: number, min: number = 0, max?: number): string | null => {
  if (isNaN(value)) return 'Please enter a valid number';
  if (value < min) return `Value must be at least ${min}`;
  if (max && value > max) return `Value must be at most ${max}`;
  return null;
};

export const getFinancialInsight = (goalProbability: number): string => {
  if (goalProbability >= 0.9) {
    return "Excellent! You're very likely to exceed your retirement goal. Consider if you're being too conservative or could retire earlier.";
  } else if (goalProbability >= 0.75) {
    return "Good news! You have a strong chance of meeting your retirement goal. Your plan looks solid.";
  } else if (goalProbability >= 0.5) {
    return "Moderate success probability. Consider increasing contributions, extending your timeline, or adjusting your risk tolerance.";
  } else if (goalProbability >= 0.25) {
    return "Low success probability. Significant adjustments needed - consider higher contributions, longer timeline, or more aggressive investments.";
  } else {
    return "Very low success probability. Major changes required to your savings strategy, timeline, or goals.";
  }
};

export const getRiskToleranceDescription = (riskTolerance: string): string => {
  switch (riskTolerance) {
    case 'conservative':
      return 'Lower volatility, more stable returns. Suitable for those close to retirement or risk-averse.';
    case 'moderate':
      return 'Balanced approach with moderate volatility. Good for most long-term investors.';
    case 'aggressive':
      return 'Higher volatility, potential for higher returns. Best for younger investors with long time horizons.';
    default:
      return 'Balanced approach with moderate volatility.';
  }
};
