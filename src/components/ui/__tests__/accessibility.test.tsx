/**
 * Core UI Components Accessibility Tests
 *
 * WCAG 2.2 Level AA 준수 검증
 * jest-axe를 사용한 자동화 테스트
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { M3Button } from '../M3Button';
import { M3TextField } from '../M3TextField';
import { M3Dialog } from '../M3Dialog';
import { M3Card } from '../M3Card';
import { M3Chip } from '../M3Chip';
import { LiveRegion, AlertLive, StatusLive } from '../LiveRegion';
import { VisuallyHidden, FocusVisible } from '../VisuallyHidden';
import { FormGroup } from '../FormGroup';

describe('M3Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<M3Button>Click me</M3Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('should have no violations with icon only (aria-label required)', async () => {
    const { container } = render(
      <M3Button aria-label="Close" leadingIcon={<span>X</span>} iconOnly>
        <span className="sr-only">Close</span>
      </M3Button>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('should have no violations when disabled', async () => {
    const { container } = render(<M3Button disabled>Disabled</M3Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('should have no violations when loading', async () => {
    const { container } = render(<M3Button loading>Loading</M3Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('M3TextField Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<M3TextField label="Email" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('should have no violations with helper text', async () => {
    const { container } = render(
      <M3TextField label="Password" helperText="At least 8 characters" />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('should have no violations with error state', async () => {
    const { container } = render(
      <M3TextField label="Email" error="Invalid email format" />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('should have no violations when required', async () => {
    const { container } = render(<M3TextField label="Name" required />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('should associate label with input', () => {
    render(<M3TextField label="Email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAccessibleName('Email');
  });

  it('should have aria-required when required', () => {
    render(<M3TextField label="Name" required />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('should have aria-invalid when error', () => {
    render(<M3TextField label="Email" error="Invalid" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('M3Dialog Accessibility', () => {
  const onClose = jest.fn();

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <M3Dialog open onClose={onClose} title="Test Dialog">
        Dialog content
      </M3Dialog>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('should have role="dialog"', () => {
    render(
      <M3Dialog open onClose={onClose} title="Test Dialog">
        Content
      </M3Dialog>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should have aria-modal="true"', () => {
    render(
      <M3Dialog open onClose={onClose} title="Test Dialog">
        Content
      </M3Dialog>
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('should have aria-labelledby when title provided', () => {
    render(
      <M3Dialog open onClose={onClose} title="Test Dialog">
        Content
      </M3Dialog>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    const labelId = dialog.getAttribute('aria-labelledby');
    expect(document.getElementById(labelId!)).toHaveTextContent('Test Dialog');
  });
});

describe('M3Card Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <M3Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </M3Card>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('M3Chip Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<M3Chip label="Filter" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('should have aria-pressed for toggle chips', async () => {
    const { container } = render(<M3Chip label="Selected" selected />);
    expect(await axe(container)).toHaveNoViolations();
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('LiveRegion Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<LiveRegion message="3 results found" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('should have role="status" by default', () => {
    render(<LiveRegion message="Loading complete" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should have aria-live="polite" by default', () => {
    const { container } = render(<LiveRegion message="Test" />);
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
  });

  it('should use aria-live="assertive" when specified', () => {
    const { container } = render(<LiveRegion message="Error!" politeness="assertive" />);
    expect(container.querySelector('[aria-live="assertive"]')).toBeInTheDocument();
  });

  it('AlertLive should have role="alert"', () => {
    render(<AlertLive message="Error occurred" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('StatusLive should have role="status"', () => {
    render(<StatusLive message="5 items loaded" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('VisuallyHidden Accessibility', () => {
  it('should have sr-only class', () => {
    const { container } = render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    expect(container.querySelector('.sr-only')).toBeInTheDocument();
  });

  it('should render as span by default', () => {
    const { container } = render(<VisuallyHidden>Text</VisuallyHidden>);
    expect(container.querySelector('span')).toBeInTheDocument();
  });

  it('should render as specified element', () => {
    const { container } = render(<VisuallyHidden as="h2">Heading</VisuallyHidden>);
    expect(container.querySelector('h2')).toBeInTheDocument();
  });

  it('should support id for aria-labelledby references', () => {
    render(<VisuallyHidden id="sr-label">Label</VisuallyHidden>);
    expect(document.getElementById('sr-label')).toBeInTheDocument();
  });
});

describe('FormGroup Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <FormGroup legend="Contact Information">
        <input type="text" aria-label="Email" />
        <input type="text" aria-label="Phone" />
      </FormGroup>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('should render as fieldset with legend', () => {
    render(
      <FormGroup legend="Options">
        <input type="checkbox" aria-label="Option 1" />
      </FormGroup>
    );
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByText('Options')).toBeInTheDocument();
  });

  it('should have aria-describedby when description provided', () => {
    const { container } = render(
      <FormGroup legend="Options" description="Select your preferences">
        <input type="checkbox" aria-label="Option" />
      </FormGroup>
    );
    const fieldset = container.querySelector('fieldset');
    expect(fieldset).toHaveAttribute('aria-describedby');
  });

  it('should show error with role="alert"', () => {
    render(
      <FormGroup legend="Options" error="At least one option required">
        <input type="checkbox" aria-label="Option" />
      </FormGroup>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('At least one option required');
  });

  it('should have aria-required when required', () => {
    const { container } = render(
      <FormGroup legend="Required Field" required>
        <input type="text" aria-label="Field" />
      </FormGroup>
    );
    expect(container.querySelector('fieldset')).toHaveAttribute('aria-required', 'true');
  });
});

describe('Focus Management', () => {
  it('FocusVisible should have focus-related classes', () => {
    const { container } = render(<FocusVisible>Skip to content</FocusVisible>);
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('focus:not-sr-only');
  });
});
