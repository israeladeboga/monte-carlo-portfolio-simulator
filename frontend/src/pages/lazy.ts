import { lazy } from 'react';

// Lazy load pages for code splitting
export const LazyIndex = lazy(() => import('./Index'));
export const LazySimulate = lazy(() => import('./Simulate'));
export const LazyReport = lazy(() => import('./Report'));
export const LazySavedResults = lazy(() => import('./SavedResults'));
export const LazySimulationHistory = lazy(() => import('./SimulationHistory'));
export const LazyLogin = lazy(() => import('./auth/Login'));
export const LazySignup = lazy(() => import('./auth/Signup'));
export const LazyNotFound = lazy(() => import('./NotFound'));