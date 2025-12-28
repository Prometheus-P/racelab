import type { Preview } from '@storybook/nextjs';

// Import global styles (Tailwind CSS + custom styles)
import '../src/app/globals.css';
import '../src/styles/typography.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#FFFFFF' },
        { name: 'surface-dim', value: '#F4F4F5' },
        { name: 'dark', value: '#27272A' },
      ],
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default preview;
