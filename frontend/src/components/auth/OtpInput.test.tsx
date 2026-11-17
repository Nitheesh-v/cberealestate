// @vitest-environment jsdom
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OtpInput } from './FormControls';
/** Controlled harness preserves the exact six-digit value submitted by RHF. */
function Harness(): React.JSX.Element {
  const [value, setValue] = useState('');
  return (
    <>
      <OtpInput value={value} onChange={setValue} />
      <output>{value}</output>
    </>
  );
}
describe('Six-cell OTP input', () => {
  afterEach(cleanup);
  it('accepts pasted codes and preserves leading zeroes', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByLabelText('Code digit 1'));
    await userEvent.paste('001234');
    expect(screen.getByRole('status').textContent).toBe('001234');
    expect((screen.getByLabelText('Code digit 6') as HTMLInputElement).value).toBe('4');
  });
  it('auto-advances focus and supports backspace into the previous cell', async () => {
    render(<Harness />);
    await userEvent.type(screen.getByLabelText('Code digit 1'), '12');
    expect(document.activeElement).toBe(screen.getByLabelText('Code digit 3'));
    await userEvent.keyboard('{Backspace}');
    expect(document.activeElement).toBe(screen.getByLabelText('Code digit 2'));
    expect(screen.getByRole('status').textContent).toBe('1');
  });
});
