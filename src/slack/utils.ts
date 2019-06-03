export const isUserID = (id: string): boolean => {
  if (id.match(/<\@U\w{8}>/)) {
    return true
  } else {
    return false
  }
}
