import service from '~/api/request'

export function getJokes(): Promise<{ joke: string }> {
  return service({
    url: 'https://icanhazdadjoke.com',
    method: 'GET',
  })
}
