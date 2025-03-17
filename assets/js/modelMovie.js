// Model - Handles data and API operations for movies
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

export default MovieModel;
