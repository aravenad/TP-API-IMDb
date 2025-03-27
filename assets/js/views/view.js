// Vue - Gère la manipulation du DOM et le rendu de l'interface utilisateur
const view = {
    // Éléments du DOM
    searchInput: document.getElementById('search-input'),
    searchButton: document.getElementById('search-button'),
    resultsContainer: document.getElementById('results-container'),
    favoritesContainer: document.getElementById('favorites-container'),
    
    // Icône de film simple encodée en Base64
    placeholderImage: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTUwIiBmaWxsPSIjODg4ODg4Ij48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZWVlZSIvPjxwYXRoIGQ9Ik0zMCA0MEg3MHYySDMwek0zMCA4MEg3MHYySDMwek0zMCAxMjBINzB2MkgzMHpNMjAgMjBIODB2MTBIMjB6TTIwIDYwSDgwdjEwSDIwek0yMCAxMDBIODB2MTBIMjB6Ii8+PHRleHQgeD0iNTAiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk1vdmllPC90ZXh0Pjwvc3ZnPg==',

    // Configure les écouteurs d'événements avec des fonctions de rappel
    bindSearchEvents(handleSearch, handleEnterKey) {
        this.searchButton.addEventListener('click', handleSearch);
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleEnterKey();
            }
        });
    },

    // Récupère la requête de recherche
    getSearchQuery() {
        return this.searchInput.value.trim();
    },

    // Affiche l'état de chargement
    showLoading() {
        this.resultsContainer.innerHTML = '<p class="loading">Recherche en cours...</p>';
    },

    // Affiche un message d'erreur
    showError(message) {
        this.resultsContainer.innerHTML = `<p class="no-results">Erreur: ${message}</p>`;
    },

    // Méthode auxiliaire pour gérer les erreurs d'image
    setImagePlaceholder(imgElement) {
        imgElement.alt = 'Image du film';
        imgElement.onerror = () => {
            imgElement.src = this.placeholderImage;
            imgElement.alt = 'Image du film';
        };
    },

    // Affiche les résultats de recherche
    displayResults(results, isFavoriteCallback, toggleFavoriteCallback) {
        if (!results || !Array.isArray(results) || results.length === 0) {
            this.resultsContainer.innerHTML = '<p class="no-results">Aucun résultat trouvé.</p>';
            return;
        }
        
        this.resultsContainer.innerHTML = '';
        
        results.forEach(movie => {
            if (!movie || typeof movie !== 'object') {
                console.warn("Élément de film invalide:", movie);
                return;
            }
            
            try {
                const movieId = movie['#IMDB_ID'] || `movie_${Math.random().toString(36).substr(2, 9)}`; // Génère un ID aléatoire si non disponible pour éviter les doublons
                const isFavorite = isFavoriteCallback(movieId);
                
                const movieCard = document.createElement('div');
                movieCard.className = 'movie-card';
                
                const title = movie['#TITLE'] || 'Titre inconnu';
                const year = movie['#YEAR'] || 'Année non disponible';
                const rank = movie['#RANK'] || 'Non classé';
                const actors = movie['#ACTORS'] || '';
                const imdbUrl = movie['#IMDB_URL'] || `https://www.imdb.com/title/${movieId}`;
                const posterUrl = movie['#IMG_POSTER'] || this.placeholderImage;
                
                movieCard.innerHTML = `
                    <img src="${posterUrl}" alt="${title}" class="movie-poster">
                    <div class="movie-info">
                        <h3 class="movie-title">${title}</h3>
                        <p class="movie-year">${year}</p>
                        <p>Classement: ${rank}</p>
                        ${actors ? `<p class="actors">Acteurs: ${actors}</p>` : ''}
                        <a href="${imdbUrl}" target="_blank" class="imdb-link">Voir sur IMDb</a>
                        <button class="favorite-button ${isFavorite ? 'remove' : ''}" data-id="${movieId}">
                            ${isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        </button>
                    </div>
                `;
                
                const posterImage = movieCard.querySelector('.movie-poster');
                this.setImagePlaceholder(posterImage);
                
                const favoriteButton = movieCard.querySelector('.favorite-button');
                favoriteButton.addEventListener('click', function() {
                    const movieData = {
                        id: movieId,
                        title: title,
                        year: year,
                        rank: rank,
                        actors: actors,
                        imdb_url: imdbUrl,
                        image: posterUrl
                    };
                    
                    toggleFavoriteCallback(movieData, this);
                });
                
                this.resultsContainer.appendChild(movieCard);
            } catch (error) {
                console.error("Erreur lors du rendu de la carte du film:", error, movie);
            }
        });
    },

    // Met à jour l'état du bouton favori
    updateFavoriteButton(button, isFavorite) {
        if (isFavorite) {
            button.classList.add('remove');
            button.textContent = 'Retirer des favoris';
        } else {
            button.classList.remove('remove');
            button.textContent = 'Ajouter aux favoris';
        }
    },

    // Affiche les favoris avec état de chargement
    displayFavorites(favorites, toggleFavoriteCallback) {
        this.favoritesContainer.innerHTML = '<p class="loading">Chargement des favoris...</p>';
        
        setTimeout(() => {
            if (!favorites || favorites.length === 0) {
                this.favoritesContainer.innerHTML = '<p class="no-results">Aucun favori ajouté pour le moment.</p>';
                return;
            }
            
            this.favoritesContainer.innerHTML = '';
            
            favorites.forEach(movie => {
                try {
                    const movieCard = document.createElement('div');
                    movieCard.className = 'movie-card';
                    
                    const posterUrl = movie.image || this.placeholderImage;
                    
                    movieCard.innerHTML = `
                        <img src="${posterUrl}" alt="${movie.title || 'Inconnu'}" class="movie-poster">
                        <div class="movie-info">
                            <h3 class="movie-title">${movie.title || 'Titre inconnu'}</h3>
                            <p class="movie-year">${movie.year || 'Année non disponible'}</p>
                            ${movie.rank ? `<p>Classement: ${movie.rank}</p>` : ''}
                            ${movie.actors ? `<p class="actors">Acteurs: ${movie.actors}</p>` : ''}
                            ${movie.imdb_url ? `<a href="${movie.imdb_url}" target="_blank" class="imdb-link">Voir sur IMDb</a>` : ''}
                            <button class="favorite-button remove" data-id="${movie.id}">
                                Retirer des favoris
                            </button>
                        </div>
                    `;
                    
                    const posterImage = movieCard.querySelector('.movie-poster');
                    this.setImagePlaceholder(posterImage);
                    
                    const favoriteButton = movieCard.querySelector('.favorite-button');
                    favoriteButton.addEventListener('click', function() {
                        toggleFavoriteCallback(movie, null);
                        movieCard.remove();
                    });
                    
                    this.favoritesContainer.appendChild(movieCard);
                } catch (error) {
                    console.error("Erreur lors du rendu de la carte du film favori:", error, movie);
                }
            });
        }, 10);
    }
};

export default view;
