import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../test/test-utils';
import { ThemeToggle } from '../ThemeToggle';

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render the toggle button', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should have correct aria-label for dark mode (default)', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });

    it('should render sun icon in dark mode (default)', () => {
      render(<ThemeToggle />);

      const svg = screen.getByRole('button').querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('text-yellow-400');
    });
  });

  describe('Interaction', () => {
    it('should call toggleTheme when clicked', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    });

    it('should toggle between dark and light mode icons', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button');

      let svg = button.querySelector('svg');
      expect(svg).toHaveClass('text-yellow-400');

      await user.click(button);

      svg = button.querySelector('svg');
      expect(svg).toHaveClass('text-gray-700');

      await user.click(button);

      svg = button.querySelector('svg');
      expect(svg).toHaveClass('text-yellow-400');
    });
  });

  describe('Styling', () => {
    it('should have correct base styling classes', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-2', 'rounded-lg', 'transition-colors');
    });
  });
});
