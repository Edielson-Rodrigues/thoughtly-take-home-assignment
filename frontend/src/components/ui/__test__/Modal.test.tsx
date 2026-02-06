import { render, screen } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './../Modal';

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        Content
      </Modal>
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        Content
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('displays the title', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Modal Title">
        Content
      </Modal>
    );
    expect(screen.getByText('Modal Title')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test">
        <div>Custom content</div>
      </Modal>
    );
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose} title="Test">
        Content
      </Modal>
    );

    await user.click(screen.getByRole('button'));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when backdrop is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose} title="Test">
        Content
      </Modal>
    );

    // Click the backdrop (the element with aria-hidden="true")
    const backdrop = document.querySelector('[aria-hidden="true"]');
    if (backdrop) {
      await user.click(backdrop);
    }
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('has proper z-index for overlay', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test">
        Content
      </Modal>
    );
    const overlay = screen.getByText('Test').closest('.fixed');
    expect(overlay).toHaveClass('z-50');
  });

  it('has close button with icon', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test">
        Content
      </Modal>
    );
    const closeButton = screen.getByRole('button');
    expect(closeButton.querySelector('svg')).toBeInTheDocument();
  });

  it('centers modal content', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test">
        Content
      </Modal>
    );
    const centeredContainer = screen.getByText('Content').closest('.flex');
    expect(centeredContainer).toHaveClass('items-center', 'justify-center');
  });
});
