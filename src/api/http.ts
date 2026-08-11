import service from '~/api/request'

interface PicsumImage {
  id: string
}

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

export function getItemList() {
  return service('https://randomuser.me/api?results=50')
}

export function getUserList() {
  return service('/mock/getuserlist')
}

export async function getRandomImg(): Promise<string[]> {
  const page = Math.floor(Math.random() * 30) + 1
  const images = await service.get<PicsumImage[], PicsumImage[]>(
    `https://picsum.photos/v2/list?page=${page}&limit=30`,
  )

  return images.map(({ id }) => `https://picsum.photos/id/${id}/300/300`)
}
