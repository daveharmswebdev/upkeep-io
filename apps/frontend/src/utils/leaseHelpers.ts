/**
 * Pure utility functions for lease status logic
 * No dependencies, easily testable, reusable across components
 */

import { LeaseStatus } from '@domain/entities';

/**
 * Determine if a lease status represents an active lease
 * @param status - LeaseStatus enum value
 * @returns true if lease is ACTIVE or MONTH_TO_MONTH
 * @example
 * isActiveLease(LeaseStatus.ACTIVE) // true
 * isActiveLease(LeaseStatus.MONTH_TO_MONTH) // true
 * isActiveLease(LeaseStatus.ENDED) // false
 */
export const isActiveLease = (status: LeaseStatus): boolean => {
  return status === LeaseStatus.ACTIVE || status === LeaseStatus.MONTH_TO_MONTH;
};

/**
 * Get display text for a lease status
 * @param status - LeaseStatus enum value, or undefined for vacant
 * @returns Human-readable status text
 * @example
 * getLeaseStatusDisplay(LeaseStatus.ACTIVE) // "Active"
 * getLeaseStatusDisplay(LeaseStatus.MONTH_TO_MONTH) // "Month-to-Month"
 * getLeaseStatusDisplay(undefined) // "Vacant"
 */
export const getLeaseStatusDisplay = (status?: LeaseStatus): string => {
  if (!status) return 'Vacant';

  switch (status) {
    case LeaseStatus.ACTIVE:
      return 'Active';
    case LeaseStatus.MONTH_TO_MONTH:
      return 'Month-to-Month';
    case LeaseStatus.ENDED:
      return 'Lease Ended';
    case LeaseStatus.VOIDED:
      return 'Voided';
    default:
      return 'Vacant';
  }
};

/**
 * Get Tailwind CSS classes for lease status badge
 * @param status - LeaseStatus enum value, or undefined for vacant
 * @returns Object with bg and text classes for badge styling
 * @example
 * getLeaseStatusBadgeClass(LeaseStatus.ACTIVE)
 * // { bg: 'bg-primary-100', text: 'text-primary-500' }
 */
export const getLeaseStatusBadgeClass = (status?: LeaseStatus): { bg: string; text: string } => {
  if (!status) {
    return {
      bg: 'bg-complement-100',
      text: 'text-complement-500',
    };
  }

  switch (status) {
    case LeaseStatus.ACTIVE:
      return {
        bg: 'bg-primary-100',
        text: 'text-primary-500',
      };
    case LeaseStatus.MONTH_TO_MONTH:
      return {
        bg: 'bg-secondary-2-100',
        text: 'text-secondary-2-500',
      };
    case LeaseStatus.ENDED:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-500',
      };
    case LeaseStatus.VOIDED:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-500',
      };
    default:
      return {
        bg: 'bg-complement-100',
        text: 'text-complement-500',
      };
  }
};
