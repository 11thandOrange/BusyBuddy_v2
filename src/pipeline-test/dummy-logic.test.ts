import { describe, it, expect } from 'vitest';
import { add, subtract } from './dummy-logic';

describe('dummy-logic', () => {
  it('should add two numbers correctly', () => {
    expect(add(1, 2)).toBe(3);
    expect(add(0, 0)).toBe(0);
    expect(add(-1, 1)).toBe(0);
    expect(add(-1, -1)).toBe(-2);
  });

  it('should subtract two numbers correctly', () => {
    expect(subtract(5, 3)).toBe(2);
    expect(subtract(0, 0)).toBe(0);
    expect(subtract(1, -1)).toBe(2);
    expect(subtract(-5, -3)).toBe(-2);
  });
});
