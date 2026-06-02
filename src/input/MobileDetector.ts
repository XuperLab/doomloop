/**
 * Detect whether the device supports touch input.
 * Returns true if the device is likely a touch-capable mobile device.
 */
export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  );
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
