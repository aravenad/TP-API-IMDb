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

export default MovieController;
