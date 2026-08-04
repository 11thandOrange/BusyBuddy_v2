import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  COUNTDOWN_TIMER_THEMES,
  CountdownTimerDisplay,
  CountdownThemePicker,
} from '../../components/Editor/CountdownTimerThemes';

describe('CountdownTimerDisplay', () => {
  it('renders every theme without throwing and shows the formatted time', () => {
    for (const theme of COUNTDOWN_TIMER_THEMES) {
      const { unmount } = render(
        <CountdownTimerDisplay
          theme={theme.id}
          bgColor="#C4290E"
          textColor="#FFFFFF"
          hours="01"
          minutes="02"
          seconds="03"
          label="Ends in:"
        />
      );
      expect(screen.getByText(/01/)).toBeInTheDocument();
      unmount();
    }
  });

  it('falls back to the classic theme for an unknown theme id', () => {
    render(
      <CountdownTimerDisplay theme="not-a-real-theme" hours="12" minutes="00" seconds="00" label="Ends in:" />
    );
    expect(screen.getByText(/Ends in:/)).toBeInTheDocument();
    expect(screen.getByText(/12:00:00/)).toBeInTheDocument();
  });

  it('shows a days segment only when days is a positive number', () => {
    const { rerender } = render(
      <CountdownTimerDisplay theme="segmented" hours="01" minutes="02" seconds="03" label="" />
    );
    expect(screen.queryByText('D')).not.toBeInTheDocument();

    rerender(<CountdownTimerDisplay theme="segmented" days={2} hours="01" minutes="02" seconds="03" label="" />);
    expect(screen.getByText('D')).toBeInTheDocument();
  });
});

describe('CountdownThemePicker', () => {
  it('renders a swatch for every theme and calls onChange with the clicked theme id', () => {
    const onChange = vi.fn();
    render(<CountdownThemePicker value="classic" onChange={onChange} bgColor="#C4290E" textColor="#FFFFFF" />);

    for (const theme of COUNTDOWN_TIMER_THEMES) {
      expect(screen.getByText(theme.label)).toBeInTheDocument();
    }

    fireEvent.click(screen.getByText('Neon Glow').closest('button'));
    expect(onChange).toHaveBeenCalledWith('neon');
  });
});
