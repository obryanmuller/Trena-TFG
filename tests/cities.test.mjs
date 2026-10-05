import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { suggestCities } from '../src/city-search.mjs';
const cities = JSON.parse(
  readFileSync(new URL('../src/data/cities.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''),
);
test('sugestões encontram nomes sem acento e identificam a UF', () => {
  assert.deepEqual(suggestCities(cities, 'itajuba'), ['Itajubá, MG']);
  assert.ok(suggestCities(cities, 'sao paulo').includes('São Paulo, SP'));
  assert.deepEqual(suggestCities(cities, 'itajá rn'), ['Itajá, RN']);
});
test('sugestões limitam resultados e tratam entradas vazias e inexistentes', () => {
  assert.equal(suggestCities(cities, 'sao').length, 8);
  assert.deepEqual(suggestCities(cities, ''), []);
  assert.deepEqual(suggestCities(cities, 'a'), []);
  assert.deepEqual(suggestCities(cities, 'zzzzzz'), []);
  assert.equal(cities.length, new Set(cities).size);
  assert.ok(cities.every((city) => /, [A-Z]{2}$/.test(city)));
});
