<script setup lang="ts" vapor>
interface Movie {
  id: number
  overview: string
  poster_path: string | null
  title: string
  vote_average: number
}

interface MovieResponse {
  results: Movie[]
}

const API_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&page=1'
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280'
const SEARCH_API = 'https://api.themoviedb.org/3/search/movie?api_key=3fd2be6f0c70a2a598f084ddfb75487c&query='

const movies = ref<Movie[]>([])
const searchTerm = ref('')

onMounted(() => {
  void getMovies(API_URL)
})

async function getMovies(url: string) {
  const response = await fetch(url)
  const data = await response.json() as MovieResponse

  movies.value = data.results
}

function getClassByRate(vote: number) {
  if (vote >= 8)
    return 'green'

  if (vote >= 5)
    return 'orange'

  return 'red'
}

function searchMovies() {
  const query = searchTerm.value.trim()

  if (query) {
    void getMovies(`${SEARCH_API}${encodeURIComponent(query)}`)
    searchTerm.value = ''
    return
  }

  void getMovies(API_URL)
}
</script>

<template>
  <div class="body base_container">
    <header>
      <form id="form" @submit.prevent="searchMovies">
        <input
          id="search"
          v-model="searchTerm"
          class="search"
          type="search"
          placeholder="Search"
          aria-label="Search movies"
        >
      </form>
    </header>

    <main id="main">
      <article v-for="movie in movies" :key="movie.id" class="movie">
        <img
          :src="`${IMG_PATH}${movie.poster_path}`"
          :alt="movie.title"
        >
        <div class="movie-info">
          <h3>{{ movie.title }}</h3>
          <span :class="getClassByRate(movie.vote_average)">
            {{ movie.vote_average }}
          </span>
        </div>
        <div class="overview">
          <h3>Overview</h3>
          {{ movie.overview }}
        </div>
      </article>
    </main>
  </div>
</template>

<style scoped lang="scss">
@use './index.scss';
</style>
