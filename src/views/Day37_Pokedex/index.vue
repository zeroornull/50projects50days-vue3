<script setup lang="ts" vapor>
interface PokemonResponse {
  id: number
  name: string
  types: Array<{
    type: {
      name: string
    }
  }>
}

interface PokemonCard {
  color: string
  id: number
  image: string
  name: string
  number: string
  type: PokemonType
}

const POKEMON_COUNT = 150
const POKEMON_API = 'https://pokeapi.co/api/v2/pokemon'
const POKEMON_SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'

const colors = {
  fire: '#FDDFDF',
  grass: '#DEFDE0',
  electric: '#FCF7DE',
  water: '#DEF3FD',
  ground: '#f4e7da',
  rock: '#d5d5d4',
  fairy: '#fceaff',
  poison: '#98d7a5',
  bug: '#f8d5a3',
  dragon: '#97b3e6',
  psychic: '#eaeda1',
  flying: '#F5F5F5',
  fighting: '#E6E0D4',
  normal: '#F5F5F5',
} as const

type PokemonType = keyof typeof colors

const mainTypes = Object.keys(colors) as PokemonType[]
const pokemons = ref<PokemonCard[]>([])
const errorMessage = ref('')
const requestController = new AbortController()

onMounted(() => {
  void fetchPokemons()
})

onUnmounted(() => {
  requestController.abort()
})

async function fetchPokemons() {
  try {
    for (let id = 1; id <= POKEMON_COUNT; id++) {
      const pokemon = await getPokemon(id)
      pokemons.value.push(createPokemonCard(pokemon))
    }
  }
  catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError')
      return

    errorMessage.value = 'Unable to load Pok\u00e9mon. Please try again later.'
  }
}

async function getPokemon(id: number) {
  const response = await fetch(`${POKEMON_API}/${id}`, {
    signal: requestController.signal,
  })

  if (!response.ok)
    throw new Error(`Failed to fetch Pok\u00e9mon ${id}`)

  return await response.json() as PokemonResponse
}

function createPokemonCard(pokemon: PokemonResponse): PokemonCard {
  const pokemonTypes = pokemon.types.map(({ type }) => type.name)
  const type = mainTypes.find(mainType => pokemonTypes.includes(mainType)) ?? 'normal'

  return {
    id: pokemon.id,
    name: `${pokemon.name.charAt(0).toUpperCase()}${pokemon.name.slice(1)}`,
    number: pokemon.id.toString().padStart(3, '0'),
    type,
    color: colors[type],
    image: `${POKEMON_SPRITES}/${pokemon.id}.png`,
  }
}
</script>

<template>
  <div class="body base_container">
    <h1>Pokedex</h1>

    <p v-if="errorMessage" class="error" role="alert">
      {{ errorMessage }}
    </p>

    <div id="poke-container" class="poke-container">
      <article
        v-for="pokemon in pokemons"
        :key="pokemon.id"
        class="pokemon"
        :style="{ backgroundColor: pokemon.color }"
      >
        <div class="img-container">
          <img :src="pokemon.image" :alt="pokemon.name">
        </div>

        <div class="info">
          <span class="number">#{{ pokemon.number }}</span>
          <h3 class="name">
            {{ pokemon.name }}
          </h3>
          <small class="type">Type: <span>{{ pokemon.type }}</span></small>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './index.scss';
</style>
