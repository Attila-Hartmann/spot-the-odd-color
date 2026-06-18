import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
  const pipe = new DurationPipe();

  it('formats whole minutes and seconds as mm:ss', () => {
    expect(pipe.transform(0)).toBe('00:00');
    expect(pipe.transform(65000)).toBe('01:05');
    expect(pipe.transform(600000)).toBe('10:00');
  });

  it('floors sub-second remainders', () => {
    expect(pipe.transform(1999)).toBe('00:01');
  });

  it('clamps negative and invalid input to 00:00', () => {
    expect(pipe.transform(-500)).toBe('00:00');
    expect(pipe.transform(null)).toBe('00:00');
    expect(pipe.transform(undefined)).toBe('00:00');
    expect(pipe.transform(NaN)).toBe('00:00');
  });
});
