import React, { useEffect, useState } from 'react'
import './Pokedex.css'
import Logo from '../../assets/Logo-Pokedex.svg'
import SearchIcon from '../../assets/Icon-buscar.svg'

function Pokedex() {
  const [pokemonList, setPokemonList] = useState([]) // Dados dos Pokémon
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('') // Valor do campo de busca
  const [paginationLimit, setPaginationLimit] = useState(40)

  // Função para buscar dados da API
  async function fetchPokemonData() {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/?limit=${paginationLimit}&offset=0`
      )
      if (!response.ok) throw new Error('Falha ao buscar os dados da API.')

      const data = await response.json()

      // Buscar detalhes de cada Pokémon
      const detailedPokemonData = await Promise.all(
        data.results.map(async (pokemon) => {
          const res = await fetch(pokemon.url) // Buscar detalhes individuais
          const details = await res.json()
          return {
            name: pokemon.name,
            imageUrl:
              details.sprites.versions['generation-v']['black-white'].animated
                .front_default || details.sprites.front_default, // Imagem animada ou estática
            id: details.id,
            types: details.types.map((type) => type.type.name).join(' '), // Tipos do Pokémon
            stats: {
              hp:
                details.stats.find((stat) => stat.stat.name === 'hp')
                  ?.base_stat || 0,
              attack:
                details.stats.find((stat) => stat.stat.name === 'attack')
                  ?.base_stat || 0,
              defense:
                details.stats.find((stat) => stat.stat.name === 'defense')
                  ?.base_stat || 0,
              speed:
                details.stats.find((stat) => stat.stat.name === 'speed')
                  ?.base_stat || 0,
            },
          }
        })
      )

      setPokemonList(detailedPokemonData)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Chama a API sempre que a paginação é alterada
  useEffect(() => {
    fetchPokemonData()
  }, [paginationLimit])

  // Função para lidar com a busca
  const filteredPokemonList = pokemonList.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Função para buscar mais Pokémon
  function loadMorePokemon() {
    setPaginationLimit((prev) => prev + 20)
  }

  return (
    <>
      <div className="pokedex-container">
        {/* Logo Central */}
        <div className="pokedex-header">
          <img src={Logo} alt="Pokedex Logo" className="pokedex-logo" />
        </div>

        {/* Campo de Busca */}
        <div className="pokedex-search">
          <input
            type="text"
            placeholder="Buscar Pokémon"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-button">
            <img src={SearchIcon} alt="Buscar" className="search-icon" />
          </button>
        </div>

        {/* Indicador de Carregamento */}
        {isLoading && <p className="loading-text">Carregando...</p>}

        {/* Exibição de Erro */}
        {errorMessage && <p className="error-text">Erro: {errorMessage}</p>}

        {/* Lista de Pokémons */}
        <div className="pokemon-list">
          {filteredPokemonList.map((pokemon) => (
            <div
              key={pokemon.id}
              className={`pokemon-card ${pokemon.types
                .split(' ')
                .map((type) => `${type}-type`)
                .join(' ')}`}
            >
              {/* Lado Esquerdo */}
              <div className="pokemon-left">
                <p className="pokemon-name">{pokemon.name}</p>
                <p className="pokemon-types">{pokemon.types}</p>
                <div className="pokemon-stats">
                  <div className="stat-bar">
                    <span>HP</span>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{ width: `${pokemon.stats.hp}%` }}
                      ></div>
                    </div>
                    <span className="stat-value">{pokemon.stats.hp}</span>
                  </div>

                  <div className="stat-bar">
                    <span>ATK</span>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{ width: `${pokemon.stats.attack}%` }}
                      ></div>
                    </div>
                    <span className="stat-value">{pokemon.stats.attack}</span>
                  </div>

                  <div className="stat-bar">
                    <span>DEF</span>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{ width: `${pokemon.stats.defense}%` }}
                      ></div>
                    </div>
                    <span className="stat-value">{pokemon.stats.defense}</span>
                  </div>

                  <div className="stat-bar">
                    <span>SPD</span>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{ width: `${pokemon.stats.speed}%` }}
                      ></div>
                    </div>
                    <span className="stat-value">{pokemon.stats.speed}</span>
                  </div>
                </div>
              </div>

              {/* Lado Direito */}
              <div className="pokemon-right">
                <p className="pokemon-id">#{pokemon.id}</p>
                <div className="pokemon-image">
                  <img src={pokemon.imageUrl} alt={pokemon.name} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botão "Buscar Mais" */}
        <button
          onClick={loadMorePokemon}
          disabled={isLoading}
          className="load-more-button"
        >
          {isLoading ? 'Carregando...' : 'Buscar Mais'}
        </button>

        {/* Nenhum Pokémon encontrado */}
        {!isLoading && !filteredPokemonList.length && (
          <p className="no-results">Nenhum Pokémon encontrado.</p>
        )}
      </div>
    </>
  )
}

export default Pokedex
