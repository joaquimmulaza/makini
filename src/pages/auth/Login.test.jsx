import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// Mocking useAuth hook to easily control auth state
vi.mock('../../contexts/AuthContext', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useAuth: vi.fn(),
    };
});

// Mocking useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate, // Returning the mock correctly
    };
});

// Mocking supabase client
vi.mock('../../lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(),
        })),
    },
}));

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show an error for invalid email format before submitting', async () => {
        // Mock that the user is NOT authenticated initially
        useAuth.mockReturnValue({ user: null, profile: null });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Palavra-passe');
        const submitButton = screen.getByRole('button', { name: 'Entrar' });

        // Fill with invalid email
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        // submit form
        fireEvent.submit(submitButton.closest('form'));

        // Expect an error message to be shown
        await waitFor(() => {
            expect(screen.getByText('Por favor, insira um email válido.')).toBeInTheDocument();
        });

        // Supabase should not have been called
        expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should redirect if user is already authenticated (agricultor)', async () => {
        // Mock that the user IS authenticated as agricultor
        useAuth.mockReturnValue({
            user: { id: '123' },
            profile: { role: 'agricultor' }
        });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        // The useEffect should trigger a redirect immediately
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/buscar');
        });
    });

    it('should redirect if user is already authenticated (fornecedor)', async () => {
        // Mock that the user IS authenticated as fornecedor
        useAuth.mockReturnValue({
            user: { id: '456' },
            profile: { role: 'fornecedor' }
        });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        // The useEffect should trigger a redirect immediately
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });
});
