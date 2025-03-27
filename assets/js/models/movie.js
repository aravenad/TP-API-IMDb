// Modèle - Gère les données et les opérations API pour les films
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
            console.error('Erreur lors du chargement des favoris depuis localStorage:', error);
            // Initialise comme tableau vide en cas d'erreur
            this.favorites = [];
        }
    }

    /**
     * Recherche des films depuis l'API
     * @param {string} query - La requête de recherche
     * @returns {Promise<Array>} - Les résultats de la recherche
     */
    async searchMovies(query) {
        try {
            const response = await fetch(`${this.API_BASE_URL}?q=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`Le serveur a répondu avec le statut: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Vérifie si la réponse est réussie
            if (!data || !data.ok) {
                throw new Error('Erreur API: Réponse invalide.');
            }
            
            // Renvoie les résultats s'ils sont disponibles
            return data.description && Array.isArray(data.description) ? data.description : [];
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            throw error;
        }
    }

    /**
     * Ajoute un film aux favoris
     * @param {Object} movie - Le film à ajouter aux favoris
     * @returns {boolean} - Vrai si le film a été ajouté, faux sinon
     */
    addToFavorites(movie) {
        if (!this.isInFavorites(movie.id)) {
            this.favorites.push(movie);
            this.saveFavorites();
            return true;
        }
        return false;
    }

    /**
     * Supprime un film des favoris
     * @param {string} movieId - L'ID du film à supprimer
     * @returns {boolean} - Vrai si le film a été supprimé, faux sinon
     */
    removeFromFavorites(movieId) {
        const index = this.favorites.findIndex(fav => fav.id === movieId);
        if (index !== -1) {
            this.favorites.splice(index, 1);
            this.saveFavorites();
            return true;
        }
        return false;
    }

    /**
     * Sauvegarde les favoris dans localStorage
     */
    saveFavorites() {
        try {
            localStorage.setItem('imdbFavorites', JSON.stringify(this.favorites));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des favoris dans localStorage:', error);
        }
    }

    /**
     * Vérifie si un film est dans les favoris
     * @param {string} movieId - L'ID du film à vérifier
     * @returns {boolean} - Vrai si le film est dans les favoris, faux sinon
     */
    isInFavorites(movieId) {
        return this.favorites.some(fav => fav.id === movieId); // some() parcourt le tableau et renvoie vrai si un élément correspond au prédicat
    }

    /**
     * Récupère tous les favoris
     * @returns {Array} - Les films favoris
     */
    getFavorites() {
        return this.favorites;
    }
}

export default MovieModel;
