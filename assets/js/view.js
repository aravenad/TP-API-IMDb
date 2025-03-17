// View - Handles DOM manipulation and UI rendering
const view = {
    // DOM elements
    searchInput: document.getElementById('search-input'),
    searchButton: document.getElementById('search-button'),
    resultsContainer: document.getElementById('results-container'),
    favoritesContainer: document.getElementById('favorites-container'),
    
    // Base64 encoded simple film placeholder icon
    placeholderImage: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTUwIiBmaWxsPSIjODg4ODg4Ij48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZWVlZSIvPjxwYXRoIGQ9Ik0zMCA0MEg3MHYySDMwek0zMCA4MEg3MHYySDMwek0zMCAxMjBINzB2MkgzMHpNMjAgMjBIODB2MTBIMjB6TTIwIDYwSDgwdjEwSDIwek0yMCAxMDBIODB2MTBIMjB6Ii8+PHRleHQgeD0iNTAiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk1vdmllPC90ZXh0Pjwvc3ZnPg==',
    // Alternative URL backup in case the base64 fails for any reason
    fallbackPlaceholderUrl: 'https://via.placeholder.com/100x150?text=Movie',

    // Set up event listeners with callback functions
    bindSearchEvents(handleSearch, handleEnterKey) {
        this.searchButton.addEventListener('click', handleSearch);
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleEnterKey();
            }
        });
    },

    // Get search query
    getSearchQuery() {
        return this.searchInput.value.trim();
    },

    // Show loading state
    showLoading() {
        this.resultsContainer.innerHTML = '<p class="loading">Searching...</p>';
    },

    // Show error message
    showError(message) {
        this.resultsContainer.innerHTML = `<p class="no-results">Error: ${message}</p>`;
    },

    // Add helper method for handling image errors
    setImagePlaceholder(imgElement) {
        imgElement.alt = 'Movie placeholder';
        imgElement.onerror = () => {
            // Try our base64 placeholder first
            imgElement.src = this.placeholderImage;
            imgElement.alt = 'Movie placeholder';
            
            // If base64 placeholder somehow fails, use remote URL as last resort
            imgElement.onerror = () => {
                imgElement.src = this.fallbackPlaceholderUrl;
                imgElement.onerror = null; // Prevent further error handling
            };
        };
    },

    // Display search results
    displayResults(results, isFavoriteCallback, toggleFavoriteCallback) {
        if (!results || !Array.isArray(results) || results.length === 0) {
            this.resultsContainer.innerHTML = '<p class="no-results">No results found.</p>';
            return;
        }
        
        this.resultsContainer.innerHTML = '';
        
        results.forEach(movie => {
            // Skip if the movie is not an object
            if (!movie || typeof movie !== 'object') {
                console.warn("Invalid movie item:", movie);
                return;
            }
            
            // Use a try-catch to handle any potential issues with movie data
            try {
                const movieId = movie['#IMDB_ID'] || `movie_${Math.random().toString(36).substr(2, 9)}`;
                const isFavorite = isFavoriteCallback(movieId);
                
                const movieCard = document.createElement('div');
                movieCard.className = 'movie-card';
                
                // Extract properties with the correct names from the response
                const title = movie['#TITLE'] || 'Unknown Title';
                const year = movie['#YEAR'] || 'Year not available';
                const rank = movie['#RANK'] || 'Not ranked';
                const actors = movie['#ACTORS'] || '';
                const imdbUrl = movie['#IMDB_URL'] || `https://www.imdb.com/title/${movieId}`;
                const posterUrl = movie['#IMG_POSTER'] || this.placeholderImage;
                
                movieCard.innerHTML = `
                    <img src="${posterUrl}" alt="${title}" class="movie-poster">
                    <div class="movie-info">
                        <h3 class="movie-title">${title}</h3>
                        <p class="movie-year">${year}</p>
                        <p>Rank: ${rank}</p>
                        ${actors ? `<p class="actors">Actors: ${actors}</p>` : ''}
                        <a href="${imdbUrl}" target="_blank" class="imdb-link">View on IMDb</a>
                        <button class="favorite-button ${isFavorite ? 'remove' : ''}" data-id="${movieId}">
                            ${isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        </button>
                    </div>
                `;
                
                // Set placeholder for image if it fails to load
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
                console.error("Error rendering movie card:", error, movie);
            }
        });
    },

    // Update favorite button state
    updateFavoriteButton(button, isFavorite) {
        if (isFavorite) {
            button.classList.add('remove');
            button.textContent = 'Remove from favorites';
        } else {
            button.classList.remove('remove');
            button.textContent = 'Add to favorites';
        }
    },

    // Display favorites with loading state
    displayFavorites(favorites, toggleFavoriteCallback) {
        this.favoritesContainer.innerHTML = '<p class="loading">Loading favorites...</p>';
        
        // Using setTimeout to allow the UI to update with the loading message
        setTimeout(() => {
            if (!favorites || favorites.length === 0) {
                this.favoritesContainer.innerHTML = '<p class="no-results">No favorites added yet.</p>';
                return;
            }
            
            this.favoritesContainer.innerHTML = '';
            
            favorites.forEach(movie => {
                try {
                    const movieCard = document.createElement('div');
                    movieCard.className = 'movie-card';
                    
                    const posterUrl = movie.image || this.placeholderImage;
                    
                    movieCard.innerHTML = `
                        <img src="${posterUrl}" alt="${movie.title || 'Unknown'}" class="movie-poster">
                        <div class="movie-info">
                            <h3 class="movie-title">${movie.title || 'Unknown Title'}</h3>
                            <p class="movie-year">${movie.year || 'Year not available'}</p>
                            ${movie.rank ? `<p>Rank: ${movie.rank}</p>` : ''}
                            ${movie.actors ? `<p class="actors">Actors: ${movie.actors}</p>` : ''}
                            ${movie.imdb_url ? `<a href="${movie.imdb_url}" target="_blank" class="imdb-link">View on IMDb</a>` : ''}
                            <button class="favorite-button remove" data-id="${movie.id}">
                                Remove from favorites
                            </button>
                        </div>
                    `;
                    
                    // Set placeholder for image if it fails to load
                    const posterImage = movieCard.querySelector('.movie-poster');
                    this.setImagePlaceholder(posterImage);
                    
                    const favoriteButton = movieCard.querySelector('.favorite-button');
                    favoriteButton.addEventListener('click', function() {
                        toggleFavoriteCallback(movie, null);
                        movieCard.remove();
                    });
                    
                    this.favoritesContainer.appendChild(movieCard);
                } catch (error) {
                    console.error("Error rendering favorite movie card:", error, movie);
                }
            });
        }, 10);
    }
};

export default view;
