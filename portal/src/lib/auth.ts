export function isAuthenticated(currentUser: string | null | undefined) {
  return Boolean(currentUser && currentUser !== 'Guest');
}
