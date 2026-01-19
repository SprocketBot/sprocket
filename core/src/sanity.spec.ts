/**
 * This file exists to ensure that we always have at least one test
 *  Many places in the CI/CD Pipeline can break if there is not at least one test
 */

describe('Sanity Check', () => {
  it('Should pass', () => {
    expect(true).toBeDefined();
  });
});
