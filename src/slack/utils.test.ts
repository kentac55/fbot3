import { trim, reminderHandler } from './utils'

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
