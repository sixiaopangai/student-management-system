import { describe, test, expect } from '@jest/globals';

describe('Basic Test Suite', () => {
  test('should pass basic math', () => {
    expect(1 + 1).toBe(2);
  });

  test('should pass string comparison', () => {
    expect('hello').toBe('hello');
  });
});