import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should handle conditional class names', () => {
    expect(cn('bg-red-500', { 'text-white': true, 'opacity-50': false })).toBe('bg-red-500 text-white');
  });

  it('should handle arrays of class names', () => {
    expect(cn(['bg-red-500', 'text-white'], 'p-4')).toBe('bg-red-500 text-white p-4');
  });

  it('should handle falsy values', () => {
    expect(cn('bg-red-500', null, undefined, false, 0, 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('should handle complex nesting', () => {
    expect(cn('base', ['nested', { conditional: true, hidden: false }], { outer: true })).toBe('base nested conditional outer');
  });
});
