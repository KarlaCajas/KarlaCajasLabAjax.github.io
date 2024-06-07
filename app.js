const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search');
const pokemonList = document.getElementById('pokemon-list');
const typeFilter = document.getElementById('type-filter');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const currentPageSpan = document.getElementById('current-page');
const spinner = document.getElementById('spinner');
const resetButton = document.getElementById('reset-button');
const scrollToTopButton = document.getElementById('scroll-to-top');

let currentPage = 1;
let totalPages = 0;
let currentTypeFilter = '';

document.addEventListener('DOMContentLoaded', () => {
    loadTypes();
    loadPokemon(currentPage);
    addScrollToTopButtonListener();
});

searchButton.addEventListener('click', () => {
    const searchQuery = searchInput.value;
    if (searchQuery) {
        currentPage = 1;
        loadPokemonByName(searchQuery);
    } else {
        currentPage = 1;
        loadPokemon(currentPage);
    }
});

prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadPokemon(currentPage);
    }
});

nextPageButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadPokemon(currentPage);
    }
});

typeFilter.addEventListener('change', () => {
    currentPage = 1;
    currentTypeFilter = typeFilter.value;
    if (currentTypeFilter === '') {
        currentTypeFilter = null;
    }
    loadPokemon(currentPage);
});

resetButton.addEventListener('click', () => {
    currentPage = 1;
    currentTypeFilter = '';
    typeFilter.value = '';
    loadPokemon(currentPage);
});

function loadTypes() {
    fetch('https://pokeapi.co/api/v2/type')
        .then(response => response.json())
        .then(data => {
            data.results.forEach(type => {
                const option = document.createElement('option');
                option.value = type.name;
                option.textContent = type.name;
                typeFilter.appendChild(option);
            });
        })
        .catch(error => console.error(error));
}

function loadPokemon(page) {
    const searchQuery = searchInput.value;
    const offset = (page - 1) * 20;
    let url = `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`;
    if (searchQuery) {
        url = `https://pokeapi.co/api/v2/pokemon/${searchQuery.toLowerCase()}`;
    }
    if (currentTypeFilter) {
        url = `https://pokeapi.co/api/v2/type/${currentTypeFilter}`;
    }

    showSpinner();
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (currentTypeFilter) {
                displayPokemonByType(data);
            } else {
                if (searchQuery) {
                    displaySinglePokemon(data);
                } else {
                    displayPokemonList(data);
                }
            }
        })
        .catch(error => console.error(error))
        .finally(() => hideSpinner());
}

function loadPokemonByName(name) {
    showSpinner();
    fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
        .then(response => response.json())
        .then(data => {
            displaySinglePokemon(data);
        })
        .catch(error => console.error(error))
        .finally(() => hideSpinner());
}

function displayPokemonList(data) {
    pokemonList.innerHTML = '';
    data.results.forEach(pokemon => {
        const pokemonItem = document.createElement('div');
        pokemonItem.classList.add('pokemon-item');
        pokemonItem.innerHTML = `
            <h2>${pokemon.name}</h2>
            <img src="" alt="${pokemon.name}">
        `;
        pokemonList.appendChild(pokemonItem);
    });
    totalPages = Math.ceil(data.count / 20);
    currentPageSpan.textContent = currentPage;
}

function displaySinglePokemon(data) {
    pokemonList.innerHTML = '';
    const pokemonItem = document.createElement('div');
    pokemonItem.classList.add('pokemon-item');
    pokemonItem.innerHTML = `
        <h2>${data.name}</h2>
        <img src="${data.sprites.front_default}" alt="${data.name}">
        <p>Altura: ${data.height}</p>
        <p>Peso: ${data.weight}</p>
    `;
    pokemonList.appendChild(pokemonItem);
    totalPages = 1;
    currentPageSpan.textContent = currentPage;
}

function displayPokemonByType(data) {
    pokemonList.innerHTML = '';
    data.pokemon.forEach(pokemonEntry => {
        fetch(pokemonEntry.pokemon.url)
            .then(response => response.json())
            .then(pokemonData => {
                const pokemonItem = document.createElement('div');
                pokemonItem.classList.add('pokemon-item');
                pokemonItem.innerHTML = `
                    <h2>${pokemonData.name}</h2>
                    <img src="${pokemonData.sprites.front_default}" alt="${pokemonData.name}">
                    <p>Altura: ${pokemonData.height}</p>
                    <p>Peso: ${pokemonData.weight}</p>
                `;
                pokemonList.appendChild(pokemonItem);
            });
    });
    totalPages = Math.ceil(data.pokemon.length / 20);
    currentPageSpan.textContent = currentPage;
}

function showSpinner() {
    spinner.style.display = 'block';
}

function hideSpinner() {
    spinner.style.display = 'none';
}

function addScrollToTopButtonListener() {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopButton.style.display = 'block';
        } else {
            scrollToTopButton.style.display = 'none';
        }
    });

    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}