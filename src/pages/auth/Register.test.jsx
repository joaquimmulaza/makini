import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Register from './Register';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// Mocking useAuth hook
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
            signUp: vi.fn(),
        }
    },
}));

describe('Register Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show an error for invalid email format before submitting', async () => {
        // Mock that the user is NOT authenticated
        useAuth.mockReturnValue({ user: null, profile: null });

        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        // Select a role first
        const agricultorCard = screen.getByText('Sou Agricultor').closest('div.cursor-pointer');
        fireEvent.click(agricultorCard);

        const nameInput = screen.getByLabelText('Nome Completo');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Palavra-passe');

        const submitButton = screen.getByRole('button', { name: 'Criar Conta e Confirmar' });

        // Fill with invalid email
        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'invalid-email-format' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        fireEvent.submit(submitButton.closest('form'));

        // Expect an error message to be shown
        await waitFor(() => {
            expect(screen.getByText('Por favor, insira um email válido.')).toBeInTheDocument();
        });

        // Supabase should not have been called
        expect(supabase.auth.signUp).not.toHaveBeenCalled();
    });

    it('should redirect if user is already authenticated (agricultor)', async () => {
        // Mock that the user IS authenticated as agricultor
        useAuth.mockReturnValue({
            user: { id: '123' },
            profile: { role: 'agricultor' }
        });

        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        // The useEffect should trigger a redirect immediately
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/buscar');
        });
    });
});
