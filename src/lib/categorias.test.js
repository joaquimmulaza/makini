import { describe, it, expect } from 'vitest';
import { CATEGORIAS, CATEGORIAS_NOMES } from './categorias';

describe('categorias library', () => {
  it('CATEGORIAS should be an array of length 4', () => {
    expect(Array.isArray(CATEGORIAS)).toBe(true);
    expect(CATEGORIAS.length).toBe(4);
  });

  it('each item in CATEGORIAS should have id, nome, and icon properties', () => {
    CATEGORIAS.forEach(categoria => {
      expect(categoria).toHaveProperty('id');
      expect(typeof categoria.id).toBe('string');
      expect(categoria).toHaveProperty('nome');
      expect(typeof categoria.nome).toBe('string');
      expect(categoria).toHaveProperty('icon');
      // icon should be a React component (function or object)
      expect(typeof categoria.icon).toMatch(/function|object/);
    });
  });

  it('CATEGORIAS_NOMES should correctly map the nome property from CATEGORIAS', () => {
    expect(Array.isArray(CATEGORIAS_NOMES)).toBe(true);
    expect(CATEGORIAS_NOMES.length).toBe(4);

    CATEGORIAS.forEach((categoria, index) => {
      expect(CATEGORIAS_NOMES[index]).toBe(categoria.nome);
    });
  });

  it('CATEGORIAS should contain specific expected categories', () => {
    const ids = CATEGORIAS.map(c => c.id);
    expect(ids).toContain('preparacao');
    expect(ids).toContain('plantio');
    expect(ids).toContain('insumos');
    expect(ids).toContain('colheita');
  });
});
