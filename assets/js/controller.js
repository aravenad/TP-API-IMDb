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
            this.handleSearchResults(results);
            this.view.displayResults(
                results,
                this.isInFavorites.bind(this),
                this.toggleFavorite.bind(this)
            );
        } catch (error) {
            this.view.showError(`Failed to search movies: ${error.message || 'Unknown error'}`);
        }
    }

    // Handle search results
    handleSearchResults(results) {
        // Prioritize results if clicked from suggestions
        if (results && Array.isArray(results)) {
            const lastSelectedMovie = localStorage.getItem('last_selected_movie');
            if (lastSelectedMovie) {
                try {
                    const selectedMovie = JSON.parse(lastSelectedMovie);
                    
                    // Find the movie in results
                    const selectedIndex = results.findIndex(movie => {
                        const movieId = movie['#IMDB_ID'] || movie.imdbID || movie.id;
                        return movieId === selectedMovie.id;
                    });
                    
                    // Move it to the top if found
                    if (selectedIndex > 0) {
                        const movieToPromote = results.splice(selectedIndex, 1)[0];
                        results.unshift(movieToPromote);
                    }
                    
                    // Clear for future searches
                    localStorage.removeItem('last_selected_movie');
                } catch (error) {
                    console.error('Error prioritizing selected movie:', error);
                }
            }
        }
        
        // Continue with regular result handling
        // ...existing code...
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
            
            // Also update any other buttons in search results with same movie ID
            this.updateAllButtonsForMovie(movie.id, false);
        } else {
            this.model.addToFavorites(movie);
            if (button) this.view.updateFavoriteButton(button, true);
            
            // Also update any other buttons in search results with same movie ID
            this.updateAllButtonsForMovie(movie.id, true);
        }
        
        // Update favorites display
        this.updateFavoritesView();
    }
    
    // Update all buttons for a specific movie ID
    updateAllButtonsForMovie(movieId, isFavorite) {
        // Find all buttons in search results for this movie
        const allButtons = document.querySelectorAll(`.favorite-button[data-id="${movieId}"]`);
        allButtons.forEach(btn => {
            if (btn !== document.activeElement) { // Skip the button that was just clicked
                this.view.updateFavoriteButton(btn, isFavorite);
            }
        });
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

export default MovieController;
