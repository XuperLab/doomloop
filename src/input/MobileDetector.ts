/**
 * Detect whether the device is a mobile/touch-primary device.
 * Uses multiple signals to avoid false positives on touch-capable laptops.
 *
 * A device is considered touch-primary ONLY if:
 * 1. It has touch capability AND
 * 2. It lacks a fine pointer (mouse) OR has a small screen
 */
export function isTouchDevice(): boolean {
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!hasTouch) return false;

  // Check for fine pointer (mouse) — laptops with touch screens have both
  const hasFinePointer = window.matchMedia?.('(pointer: fine)').matches ?? false;

  // Small screen heuristic: mobile devices are typically < 1024px wide
  const isSmallScreen = window.innerWidth < 1024;

  // Touch-primary if: no fine pointer (pure tablet/phone) OR small screen (phone-sized)
  // Laptops with touch: have fine pointer + large screen → NOT touch-primary
  return !hasFinePointer || isSmallScreen;
}

/**
 * Detection result for optional granular checks.
 */
export interface MobileDetectionResult {
  isTouchDevice: boolean;
  maxTouchPoints: number;
  hasCoarsePointer: boolean;  // CSS pointer: coarse
  hasFinePointer: boolean;    // CSS pointer: fine
}

export function detectMobile(): MobileDetectionResult {
  return {
    isTouchDevice: isTouchDevice(),
    maxTouchPoints: navigator.maxTouchPoints || 0,
    hasCoarsePointer: window.matchMedia?.('(pointer: coarse)').matches ?? false,
    hasFinePointer: window.matchMedia?.('(pointer: fine)').matches ?? false,
  };
}
