// Main application file using MVC architecture

// Model - Handles data and API operations
class MovieModel {
    constructor() {
        this.API_BASE_URL = 'https://imdb.iamidiotareyoutoo.com/search';
        this.favorites = [];
        
        try {
            const storedFavorites = localStorage.getItem('imdbFavorites');
            if (storedFavorites) {
                this.favorites = JSON.parse(storedFavorites) || [];
            }
        } catch (error) {
            console.error('Error loading favorites from localStorage:', error);
            // Initialize as empty array if there's an error
            this.favorites = [];
        }
    }

    // Search movies from API
    async searchMovies(query) {
        try {
            const response = await fetch(`${this.API_BASE_URL}?q=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Check if the response is successful
            if (!data || !data.ok) {
                throw new Error('API error: Invalid response.');
            }
            
            // Return the results if available
            return data.description && Array.isArray(data.description) ? data.description : [];
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    // Add a movie to favorites
    addToFavorites(movie) {
        if (!this.favorites.some(fav => fav.id === movie.id)) {
            this.favorites.push(movie);
            this.saveFavorites();
            return true;
        }
        return false;
    }

    // Remove a movie from favorites
    removeFromFavorites(movieId) {
        const index = this.favorites.findIndex(fav => fav.id === movieId);
        if (index !== -1) {
            this.favorites.splice(index, 1);
            this.saveFavorites();
            return true;
        }
        return false;
    }

    // Save favorites to localStorage
    saveFavorites() {
        try {
            localStorage.setItem('imdbFavorites', JSON.stringify(this.favorites));
        } catch (error) {
            console.error('Error saving favorites to localStorage:', error);
        }
    }

    // Check if a movie is in favorites
    isInFavorites(movieId) {
        return this.favorites.some(fav => fav.id === movieId);
    }

    // Get all favorites
    getFavorites() {
        return this.favorites;
    }
}

// View - Handles DOM manipulation and UI rendering
class MovieView {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchButton = document.getElementById('search-button');
        this.resultsContainer = document.getElementById('results-container');
        this.favoritesContainer = document.getElementById('favorites-container');
        
        // Base64 encoded simple film placeholder icon
        this.placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTUwIiBmaWxsPSIjODg4ODg4Ij48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZWVlZSIvPjxwYXRoIGQ9Ik0zMCA0MEg3MHYySDMwek0zMCA4MEg3MHYySDMwek0zMCAxMjBINzB2MkgzMHpNMjAgMjBIODB2MTBIMjB6TTIwIDYwSDgwdjEwSDIwek0yMCAxMDBIODB2MTBIMjB6Ii8+PHRleHQgeD0iNTAiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk1vdmllPC90ZXh0Pjwvc3ZnPg==';
        // Alternative URL backup in case the base64 fails for any reason
        this.fallbackPlaceholderUrl = 'https://via.placeholder.com/100x150?text=Movie';
    }

    // Set up event listeners with callback functions
    bindSearchEvents(handleSearch, handleEnterKey) {
        this.searchButton.addEventListener('click', handleSearch);
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleEnterKey();
            }
        });
    }

    // Get search query
    getSearchQuery() {
        return this.searchInput.value.trim();
    }

    // Show loading state
    showLoading() {
        this.resultsContainer.innerHTML = '<p class="loading">Searching...</p>';
    }

    // Show error message
    showError(message) {
        this.resultsContainer.innerHTML = `<p class="no-results">Error: ${message}</p>`;
    }

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
    }

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
    }

    // Update favorite button state
    updateFavoriteButton(button, isFavorite) {
        if (isFavorite) {
            button.classList.add('remove');
            button.textContent = 'Remove from favorites';
        } else {
            button.classList.remove('remove');
            button.textContent = 'Add to favorites';
        }
    }

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
}

// Controller - Coordinates Model and View
class MovieController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        // Bind event handlers
        this.view.bindSearchEvents(
            this.handleSearch.bind(this),
            this.handleEnterKey.bind(this)
        );
        
        // Initialize the view
        this.updateFavoritesView();
    }

    // Handle search button click
    handleSearch() {
        this.performSearch();
    }

    // Handle Enter key press
    handleEnterKey() {
        this.performSearch();
    }

    // Perform movie search with improved error handling
    async performSearch() {
        const query = this.view.getSearchQuery();
        
        if (!query) {
            this.view.resultsContainer.innerHTML = '<p class="no-results">Please enter a search term.</p>';
            return;
        }
        
        this.view.showLoading();
        
        try {
            const results = await this.model.searchMovies(query);
            this.view.displayResults(
                results,
                this.isInFavorites.bind(this),
                this.toggleFavorite.bind(this)
            );
        } catch (error) {
            this.view.showError(`Failed to search movies: ${error.message || 'Unknown error'}`);
        }
    }

    // Check if a movie is in favorites
    isInFavorites(movieId) {
        return this.model.isInFavorites(movieId);
    }

    // Toggle favorite status
    toggleFavorite(movie, button) {
        const isCurrentlyFavorite = this.model.isInFavorites(movie.id);
        
        if (isCurrentlyFavorite) {
            this.model.removeFromFavorites(movie.id);
            if (button) this.view.updateFavoriteButton(button, false);
        } else {
            this.model.addToFavorites(movie);
            if (button) this.view.updateFavoriteButton(button, true);
        }
        
        // Update favorites display
        this.updateFavoritesView();
    }

    // Update favorites view
    updateFavoritesView() {
        const favorites = this.model.getFavorites();
        this.view.displayFavorites(
            favorites,
            this.toggleFavorite.bind(this)
        );
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        const app = new MovieController(new MovieModel(), new MovieView());
    } catch (error) {
        console.error("Error initializing application:", error);
        document.body.innerHTML = `
            <div style="color: red; padding: 20px; text-align: center;">
                <h2>Application Error</h2>
                <p>Sorry, the application failed to load. Please try refreshing the page.</p>
                <p>Error: ${error.message || 'Unknown error'}</p>
            </div>
        `;
    }
});
