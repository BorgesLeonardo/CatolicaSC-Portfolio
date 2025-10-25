import { slugify, appendNumericSuffix } from '../../../utils/slug'

describe('slug utils', () => {
  it('slugify lowers and trims accents and spaces', () => {
    expect(slugify(' Olá Mundo! ')).toBe('ola-mundo')
    expect(slugify('Projeto Ágil 101')).toBe('projeto-agil-101')
  })

  it('appendNumericSuffix appends only when n > 1', () => {
    expect(appendNumericSuffix('base', 1)).toBe('base')
    expect(appendNumericSuffix('base', 2)).toBe('base-2')
  })
})



