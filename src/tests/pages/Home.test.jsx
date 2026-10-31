import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '../../../app/page.jsx';
import axios from 'axios';

vi.mock('../../../app/components/home/Hero.jsx', () => ({
  default: () => <div data-testid="hero-component">Hero</div>
}));
vi.mock('../../../app/components/home/RealMoments.jsx', () => ({
  default: () => <div data-testid="real-moments-component">Real Moments</div>
}));
vi.mock('../../../app/components/home/FeaturedCompanions.jsx', () => ({
  default: () => <div data-testid="featured-companions-component">Featured Companions</div>
}));
vi.mock('../../../app/components/home/TrustAndSafetyBanner.jsx', () => ({
  default: () => <div data-testid="trust-safety-component">Trust & Safety</div>
}));
vi.mock('../../../app/components/home/FinalCTA.jsx', () => ({
  default: () => <div data-testid="final-cta-component">Final CTA</div>
}));

vi.mock('../../../app/context/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../../app/context/AuthContext.jsx';
vi.mock('axios');

describe('Home Page', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      token: null,
      userData: null,
      logout: mockLogout
    });
  });

  it('renders all streamlined homepage sections correctly', () => {
    render(<Home />);

    expect(screen.getByTestId('hero-component')).toBeInTheDocument();
    expect(screen.getByTestId('real-moments-component')).toBeInTheDocument();
    expect(screen.getByTestId('featured-companions-component')).toBeInTheDocument();
    expect(screen.getByTestId('trust-safety-component')).toBeInTheDocument();
    expect(screen.getByTestId('final-cta-component')).toBeInTheDocument();
    expect(screen.getByText(/About the Founder/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Mukarram Jah/i).length).toBeGreaterThan(0);
  });

  it('does not check profile status if no token is present', () => {
    render(<Home />);
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('checks profile status if token is present', async () => {
    useAuth.mockReturnValue({
      token: 'fake-jwt-token',
      userData: { id: 1 },
      logout: mockLogout
    });

    axios.get.mockResolvedValueOnce({ status: 200, data: {} });

    render(<Home />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
  });

  it('calls logout if profile status check returns 401', async () => {
    useAuth.mockReturnValue({
      token: 'fake-jwt-token',
      userData: { id: 1 },
      logout: mockLogout
    });

    const errorWith401Response = new Error('Request failed with status code 401');
    errorWith401Response.response = { status: 401 };

    axios.get.mockRejectedValueOnce(errorWith401Response);

    render(<Home />);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});
