import { describe, expect, it } from 'vitest';

import { queryClient } from '../react-query';

describe('react-query configuration', () => {
  describe('QueryClient instance', () => {
    it('should be defined', () => {
      expect(queryClient).toBeDefined();
    });

    it('should be an instance of QueryClient', () => {
      expect(queryClient).toHaveProperty('getQueryData');
      expect(queryClient).toHaveProperty('setQueryData');
      expect(queryClient).toHaveProperty('invalidateQueries');
      expect(queryClient).toHaveProperty('prefetchQuery');
      expect(queryClient).toHaveProperty('fetchQuery');
    });
  });

  describe('default query options', () => {
    it('should have correct staleTime', () => {
      const defaultOptions = queryClient.getDefaultOptions();

      expect(defaultOptions.queries?.staleTime).toBe(1000 * 60); // 1 minute
    });

    it('should have refetchOnWindowFocus disabled', () => {
      const defaultOptions = queryClient.getDefaultOptions();

      expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
    });

    it('should have retry set to 1', () => {
      const defaultOptions = queryClient.getDefaultOptions();

      expect(defaultOptions.queries?.retry).toBe(1);
    });
  });

  describe('query cache', () => {
    it('should have a query cache', () => {
      const queryCache = queryClient.getQueryCache();

      expect(queryCache).toBeDefined();
    });

    it('should be able to set and get query data', () => {
      const testKey = ['test-key'];
      const testData = { value: 'test' };

      queryClient.setQueryData(testKey, testData);
      const cachedData = queryClient.getQueryData(testKey);

      expect(cachedData).toEqual(testData);

      queryClient.clear();
    });

    it('should be able to invalidate queries', () => {
      const testKey = ['test-invalidate'];
      const testData = { value: 'test' };

      queryClient.setQueryData(testKey, testData);
      queryClient.invalidateQueries({ queryKey: testKey });

      const query = queryClient.getQueryState(testKey);
      expect(query?.isInvalidated).toBe(true);

      queryClient.clear();
    });
  });

  describe('mutation cache', () => {
    it('should have a mutation cache', () => {
      const mutationCache = queryClient.getMutationCache();

      expect(mutationCache).toBeDefined();
    });
  });

  describe('query methods', () => {
    it('should support getQueryData', () => {
      expect(typeof queryClient.getQueryData).toBe('function');
    });

    it('should support setQueryData', () => {
      expect(typeof queryClient.setQueryData).toBe('function');
    });

    it('should support invalidateQueries', () => {
      expect(typeof queryClient.invalidateQueries).toBe('function');
    });

    it('should support removeQueries', () => {
      expect(typeof queryClient.removeQueries).toBe('function');
    });

    it('should support resetQueries', () => {
      expect(typeof queryClient.resetQueries).toBe('function');
    });

    it('should support cancelQueries', () => {
      expect(typeof queryClient.cancelQueries).toBe('function');
    });

    it('should support prefetchQuery', () => {
      expect(typeof queryClient.prefetchQuery).toBe('function');
    });

    it('should support fetchQuery', () => {
      expect(typeof queryClient.fetchQuery).toBe('function');
    });
  });

  describe('query state', () => {
    it('should return undefined for non-existent query', () => {
      const state = queryClient.getQueryState(['non-existent']);

      expect(state).toBeUndefined();
    });

    it('should return query state for existing query', () => {
      const testKey = ['test-state'];
      queryClient.setQueryData(testKey, { value: 'test' });

      const state = queryClient.getQueryState(testKey);

      expect(state).toBeDefined();
      expect(state?.data).toEqual({ value: 'test' });

      queryClient.clear();
    });
  });

  describe('clear', () => {
    it('should clear all queries and mutations', () => {
      queryClient.setQueryData(['test-1'], { value: 1 });
      queryClient.setQueryData(['test-2'], { value: 2 });

      queryClient.clear();

      expect(queryClient.getQueryData(['test-1'])).toBeUndefined();
      expect(queryClient.getQueryData(['test-2'])).toBeUndefined();
    });
  });

  describe('default options structure', () => {
    it('should have queries default options', () => {
      const defaultOptions = queryClient.getDefaultOptions();

      expect(defaultOptions).toHaveProperty('queries');
      expect(defaultOptions.queries).toBeDefined();
    });

    it('should not have mutations default options configured', () => {
      const defaultOptions = queryClient.getDefaultOptions();

      expect(defaultOptions.mutations).toBeUndefined();
    });
  });
});
