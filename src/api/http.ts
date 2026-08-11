import service from '~/api/request'

export function getJokes(): Promise<{ joke: string }> {
  return service({
    url: 'https://icanhazdadjoke.com',
    method: 'GET',
  })
}

export function getUserInfo(username: string) {
  return service({
    url: `https://api.github.com/users/${username}`,
    method: 'GET',
  })
}

export function getUserRepos(username: string) {
  return service({
    url: `https://api.github.com/users/${username}/repos?sort=created`,
    method: 'GET',
  })
}
