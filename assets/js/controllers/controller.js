// Contrôleur - Coordonne le Modèle et la Vue
class MovieController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        // Lie les gestionnaires d'événements
        this.view.bindSearchEvents(
            this.handleSearch.bind(this), // bind() pour lier le contexte du contrôleur
            this.handleEnterKey.bind(this)
        );
        
        // Initialise la vue
        this.updateFavoritesView();
    }

    /**
     * Gère le clic sur le bouton de recherche
     */
    handleSearch() {
        this.performSearch();
    }

    /**
     * Gère l'appui sur la touche Entrée
     */
    handleEnterKey() {
        this.performSearch();
    }

    /**
     * Effectue la recherche de films
     */
    async performSearch() {
        const query = this.view.getSearchQuery();
        
        if (!query) {
            this.view.resultsContainer.innerHTML = '<p class="no-results">Veuillez entrer un terme de recherche.</p>';
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
            this.view.showError(`Échec de la recherche de films: ${error.message || 'Erreur inconnue'}`);
        }
    }

    /**
     * Gère les résultats de la recherche
     * @param {Array} results - Les résultats de la recherche
     */
    handleSearchResults(results) {
        // Priorise les résultats si cliqués depuis les suggestions
        if (results && Array.isArray(results)) {
            const lastSelectedMovie = localStorage.getItem('last_selected_movie');
            if (lastSelectedMovie) {
                try {
                    const selectedMovie = JSON.parse(lastSelectedMovie);
                    
                    // Trouve le film dans les résultats
                    const selectedIndex = results.findIndex(movie => {
                        const movieId = movie['#IMDB_ID'] || movie.imdbID || movie.id;
                        return movieId === selectedMovie.id;
                    });
                    
                    // Le déplace en haut si trouvé
                    if (selectedIndex > 0) {
                        const movieToPromote = results.splice(selectedIndex, 1)[0];
                        results.unshift(movieToPromote); // unshift() pour ajouter au début
                    }
                    
                    // Efface pour les recherches futures
                    localStorage.removeItem('last_selected_movie');
                } catch (error) {
                    console.error('Erreur lors de la priorisation du film sélectionné:', error);
                }
            }
        }
    }

    /**
     * Vérifie si un film est dans les favoris
     * @param {string} movieId - L'ID du film
     * @returns {boolean} - Vrai si le film est dans les favoris, faux sinon
     */
    isInFavorites(movieId) {
        return this.model.isInFavorites(movieId);
    }

    /**
     * Bascule le statut favori
     * @param {Object} movie - Le film à basculer
     * @param {HTMLElement} button - Le bouton qui a été cliqué
     */
    toggleFavorite(movie, button) {
        const isCurrentlyFavorite = this.model.isInFavorites(movie.id);
        
        if (isCurrentlyFavorite) {
            this.model.removeFromFavorites(movie.id);
            if (button) this.view.updateFavoriteButton(button, false);
            
            // Met également à jour tous les autres boutons dans les résultats de recherche avec le même ID de film
            this.updateAllButtonsForMovie(movie.id, false);
        } else {
            this.model.addToFavorites(movie);
            if (button) this.view.updateFavoriteButton(button, true);
            
            // Met également à jour tous les autres boutons dans les résultats de recherche avec le même ID de film
            this.updateAllButtonsForMovie(movie.id, true);
        }
        
        // Met à jour l'affichage des favoris
        this.updateFavoritesView();
    }
    
    /**
     * Met à jour tous les boutons pour un ID de film spécifique
     * @param {string} movieId - L'ID du film
     * @param {boolean} isFavorite - Si le film est un favori ou non
     */
    updateAllButtonsForMovie(movieId, isFavorite) {
        // Trouve tous les boutons dans les résultats de recherche pour ce film
        const allButtons = document.querySelectorAll(`.favorite-button[data-id="${movieId}"]`);
        allButtons.forEach(btn => {
            if (btn !== document.activeElement) { // Ignore le bouton qui vient d'être cliqué
                this.view.updateFavoriteButton(btn, isFavorite);
            }
        });
    }

    /**
     * Met à jour la vue des favoris
     */
    updateFavoritesView() {
        const favorites = this.model.getFavorites();
        this.view.displayFavorites(
            favorites,
            this.toggleFavorite.bind(this)
        );
    }
}

export default MovieController;
