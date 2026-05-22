import type { NamePrefix } from '../@types';

const KNOWN_PREFIXES: NamePrefix[] = ['MD', 'MBBS', 'DO', 'DDS', 'PhD', 'NP', 'PA', 'RN'];

/**
 * Splits a full name (optionally prefixed) into prefix, firstName, and lastName.
 * Used to populate edit form default values from a stored UserListItem.
 */
export function parseFullName(fullName: string): { prefix: NamePrefix; firstName: string; lastName: string } {
  const parts = fullName.trim().split(' ');
  const maybePrefix = parts[0] as NamePrefix;

  if (KNOWN_PREFIXES.includes(maybePrefix)) {
    return {
      prefix: maybePrefix,
      firstName: parts[1] ?? '',
      lastName: parts.slice(2).join(' '),
    };
  }

  return {
    prefix: 'MD',
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}
