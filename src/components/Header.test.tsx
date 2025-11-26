// src/components/Header.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';

// Mock next/navigation
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/',
}));

// Helper to set active tab
const setActiveTab = (tab: string | null) => {
  mockSearchParams.delete('tab');
  if (tab) {
    mockSearchParams.set('tab', tab);
  }
};

describe('Header Component', () => {
  beforeEach(() => {
    setActiveTab(null);
  });

  describe('Basic Rendering', () => {
    beforeEach(() => {
      render(<Header />);
    });

    it('should_render_project_title_with_link_to_home', () => {
      const titleLink = screen.getByRole('link', { name: /KRace 홈으로 이동/i });
      expect(titleLink).toBeInTheDocument();
      expect(titleLink).toHaveAttribute('href', '/');
    });

    it('should_render_navigation_links_with_correct_hrefs', () => {
      // Check for navigation links - using query params as defined in component
      const horseLinks = screen.getAllByRole('link', { name: /경마/i });
      expect(horseLinks[0]).toHaveAttribute('href', '/?tab=horse');

      const cycleLinks = screen.getAllByRole('link', { name: /경륜/i });
      expect(cycleLinks[0]).toHaveAttribute('href', '/?tab=cycle');

      const boatLinks = screen.getAllByRole('link', { name: /경정/i });
      expect(boatLinks[0]).toHaveAttribute('href', '/?tab=boat');
    });

    it('should_have_semantic_header_element', () => {
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      render(<Header />);
    });

    it('should_have_skip_to_content_link', () => {
      const skipLink = screen.getByText('본문으로 건너뛰기');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should_have_nav_with_aria_label', () => {
      const nav = screen.getByRole('navigation', { name: '주요 네비게이션' });
      expect(nav).toBeInTheDocument();
    });

    it('should_have_tooltips_on_nav_links', () => {
      const horseLinks = screen.getAllByRole('link', { name: /경마/i });
      expect(horseLinks[0]).toHaveAttribute('title', '경마 경기 보기');
    });

    it('should_have_aria_label_on_logo', () => {
      const logo = screen.getByRole('link', { name: /KRace 홈으로 이동/i });
      expect(logo).toHaveAttribute('aria-label', 'KRace 홈으로 이동');
    });
  });

  describe('Active State', () => {
    it('should_indicate_current_page_when_tab_is_active', () => {
      setActiveTab('horse');
      render(<Header />);

      const horseLinks = screen.getAllByRole('link', { name: /경마/i });
      expect(horseLinks[0]).toHaveAttribute('aria-current', 'page');
    });

    it('should_not_have_aria_current_on_inactive_tabs', () => {
      setActiveTab('horse');
      render(<Header />);

      const cycleLinks = screen.getAllByRole('link', { name: /경륜/i });
      expect(cycleLinks[0]).not.toHaveAttribute('aria-current');
    });
  });

  describe('Mobile Menu', () => {
    it('should_render_mobile_menu_button', () => {
      render(<Header />);
      const menuButton = screen.getByRole('button', { name: '메뉴 열기' });
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should_toggle_mobile_menu_on_button_click', () => {
      render(<Header />);
      const menuButton = screen.getByRole('button', { name: '메뉴 열기' });

      // Menu should be closed initially
      expect(screen.queryByRole('navigation', { name: '모바일 네비게이션' })).not.toBeInTheDocument();

      // Open menu
      fireEvent.click(menuButton);
      expect(screen.getByRole('navigation', { name: '모바일 네비게이션' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '메뉴 닫기' })).toHaveAttribute('aria-expanded', 'true');

      // Close menu
      fireEvent.click(screen.getByRole('button', { name: '메뉴 닫기' }));
      expect(screen.queryByRole('navigation', { name: '모바일 네비게이션' })).not.toBeInTheDocument();
    });

    it('should_close_mobile_menu_when_link_is_clicked', () => {
      render(<Header />);
      const menuButton = screen.getByRole('button', { name: '메뉴 열기' });
      fireEvent.click(menuButton);

      const mobileNav = screen.getByRole('navigation', { name: '모바일 네비게이션' });
      const horseLink = mobileNav.querySelector('a[href="/?tab=horse"]');

      fireEvent.click(horseLink!);
      expect(screen.queryByRole('navigation', { name: '모바일 네비게이션' })).not.toBeInTheDocument();
    });

    it('should_show_current_page_indicator_in_mobile_menu', () => {
      setActiveTab('cycle');
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: '메뉴 열기' });
      fireEvent.click(menuButton);

      expect(screen.getByText('현재 페이지')).toBeInTheDocument();
    });
  });

  describe('Touch Targets', () => {
    it('should_have_minimum_touch_target_size_classes', () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: '메뉴 열기' });
      expect(menuButton.className).toContain('min-h-[44px]');
      expect(menuButton.className).toContain('min-w-[44px]');
    });
  });
});
