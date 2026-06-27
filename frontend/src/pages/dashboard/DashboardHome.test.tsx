import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardHome from './DashboardHome';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: '123', email: 'test@example.com', displayName: 'John Doe' },
    loading: false,
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: any) => <div>{children}</div>
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('DashboardHome UI', () => {
  it('renders welcome message for the user', () => {
    renderWithProviders(<DashboardHome />);
    const heading = screen.getByText(/upload new resume/i);
    expect(heading).toBeInTheDocument();
  });
});
