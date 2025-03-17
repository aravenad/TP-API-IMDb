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
