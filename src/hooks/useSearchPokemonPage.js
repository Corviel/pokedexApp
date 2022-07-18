import { useEffect, useRef, useState } from "react";
import { useUpdatePokemons } from "../context/PokemonContext";
import axios from "axios";

function useSearchPokemonPage(query, pageNumber) {
    
    const [loading, setLoading] = useState(true)
    const [pokemons, setPokemons] = useState([])
    const pokemonsRef = useRef()
    const [offset, setOffset] = useState([1, 20])
    const [hasMore, setHasMore] = useState(true)
    const updatePokemons = useUpdatePokemons()

    useEffect(() => {
        setPokemons([])
    }, [query])


    useEffect(() => {
        axios.get("https://pokeapi.co/api/v2/pokemon?limit=905&offset=0").then(res => {
            pokemonsRef.current = res.data.results
        })
    }, [])

    useEffect(() => {

        if(pokemonsRef.current){
            let filteredPokemons = pokemonsRef.current.map(item => { // This will map through all pokemons and return the id of those who match the query
                if(item.name.includes(query)){
                    const pokemonId = Number(item.url.slice(34, item.url.length - 1))
                    return pokemonId
                }
            }).filter(item => { // this will filter "undefined" results
                return item
            })
            console.log(filteredPokemons.slice(20, 40))
        }
        
        if(offset[1] < 900){
            if(pageNumber > 1) setOffset([(20 * pageNumber) - 19, 20 * pageNumber])
        }
        else {
            setHasMore(false)
            setOffset([901, 905])
        }
        setLoading(true)

    }, [pageNumber, query]);


    useEffect(() => {
        let newPokemons = []
        for(let i = offset[0]; i <= offset[1]; i++){
            updatePokemons(i)
            .then(pokemon => {
                newPokemons.push(pokemon)
                if(i === offset[1]){
                    setPokemons(prevPokemons => {
                        return [...prevPokemons, ...newPokemons.map(item => item)].sort(sortArrayById)
                    })
                }
            })
            .catch(err => {throw err})
        }
        setLoading(false)
    }, [offset]);

    function sortArrayById(a, b) {
        var idA = a.id
        var idB = b.id

        if(idA < idB) return -1
        if(idB > idA) return 1
    }

    return {loading, pokemons, hasMore};
}

export default useSearchPokemonPage;