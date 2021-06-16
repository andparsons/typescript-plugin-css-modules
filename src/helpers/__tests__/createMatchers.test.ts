import type { Options } from '../../options';
import type { Logger } from '../logger';
import { createMatchers } from '../createMatchers';

const mockLogger: Logger = {
  log: jest.fn(),
  error: jest.fn(),
};

describe('utils / createMatchers', () => {
  it('should match `customMatcher` regexp', () => {
    const options: Options = { customMatcher: '\\.css$' };
    const { isCSS, isRelativeCSS } = createMatchers(mockLogger, options);

    expect(isCSS('./myfile.css')).toBe(true);
    expect(isCSS('./myfile.m.css')).toBe(true);
    expect(isRelativeCSS('../folder/myfile.css')).toBe(true);
    expect(isRelativeCSS('../folder/myfile.m.css')).toBe(true);
  });

  it('should handle bad `customMatcher` regexp', () => {
    const options: Options = { customMatcher: '$([a' };
    const { isCSS } = createMatchers(mockLogger, options);

    expect(isCSS('./myfile.module.css')).toBe(true);
  });
});
