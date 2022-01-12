const app = require('../app.js');

describe('Test de phrase', () => {
    it('Cela devrait être une phrase', () => {
        expect(app.sentence.length).toBeGreaterThan(0);
    });

    it('La phrase doit contenir 11 lettres', () => {
        expect(app.sentence.length).toEqual(11);
    });
});