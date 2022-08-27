describe('Root suite', () => {
  describe('Nested root suite 1', () => {
    it('first assert', async () => {
      expect(true).toEqual(true);
    });
    describe('Nested Nested root suite 1', () => {
      it('Nested Nested first assert', async () => {
        expect(true).toEqual(true);
      });
    });
  });

  it('second assert', async () => {
    expect(true).toEqual(true);
  });

  describe('Nested suite 2', () => {
    it('suite 2 first assert', async () => {
      expect(true).toEqual(true);
    });

    it('suite 2 second assert', async () => {
      expect(true).toEqual(true);
    });
  });
});

it('ROOT assert', async () => {
  expect(true).toEqual(true);
});
