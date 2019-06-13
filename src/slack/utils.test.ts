import { A1 } from '../utils'
import { trim, reminderHandler, extractCount, parse } from './utils'

test('trim() should remove spaces and dot', (): void => {
  expect(trim('$    ojichat  me.')).toBe('$ ojichat me')
})

test('reminderHandler() should remove English reminder string', (): void => {
  expect(reminderHandler('Reminder: $ ojichat'.split(' '))).toEqual(
    '$ ojichat'.split(' ')
  )
})

test('reminderHandler() should remove Japanese reminder string', (): void => {
  expect(reminderHandler('リマインダー : $ ojichat'.split(' '))).toEqual(
    '$ ojichat'.split(' ')
  )
})

test('extractCount() should extract number', (): void => {
  expect(
    extractCount('$ ojichat rand -c 100'.split(' ') as A1<string>)
  ).toEqual(['$ ojichat rand'.split(' '), 100])
})

test('extractCount() should extract number from the end of an array', (): void => {
  expect(
    extractCount('$ ojichat rand -c 100'.split(' ') as A1<string>)
  ).toEqual(['$ ojichat rand'.split(' '), 100])
})

test('extractCount() should extract number from the middle of an array', (): void => {
  expect(
    extractCount('$ ojichat -c 100 rand'.split(' ') as A1<string>)
  ).toEqual(['$ ojichat rand'.split(' '), 100])
})

test("extractCount() should use default number 1 when count doesn't exist", (): void => {
  expect(extractCount('$ ojichat rand'.split(' ') as A1<string>)).toEqual([
    '$ ojichat rand'.split(' '),
    1,
  ])
})

test('parse() should generate ValidCommand object', (): void => {
  expect(parse('$ ojichat rand -c 100')).toEqual({
    isCmd: true,
    input: '$ ojichat rand -c 100',
    cmd: 'ojichat',
    args: ['rand'],
    runs: 100,
  })
})

test('parse() should generate InvalidCommand object', (): void => {
  expect(parse('$')).toEqual({
    isCmd: false,
    input: '$',
  })
})
