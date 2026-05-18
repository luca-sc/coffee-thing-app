/**
 * jest.config.js
 * Configurarea Jest pentru rularea testelor.
 */
module.exports = {
  testEnvironment: 'node',
  // ruleaza testele secvential (impartasesc aceeasi baza de date)
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  // timpul maxim pentru un test (operatiile cu baza de date pot dura)
  testTimeout: 15000,
};
