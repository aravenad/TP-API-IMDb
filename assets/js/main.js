// Fichier principal - point d'entrée qui initialise l'application

import MovieModel from './models/movie.js';
import view from './views/view.js';
import MovieController from './controllers/controller.js';
import { initializeDragAndDrop } from './utils/dragdrop.js';
import { initSuggestions } from './utils/suggestions.js';

// Initialise l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('[Main] Initialisation de l\'application');
        const model = new MovieModel();
        
        console.log('[Main] Modèle initialisé:', model);
        console.log('[Main] Méthode searchMovies du modèle:', model.searchMovies);
        
        const app = new MovieController(model, view);
        
        // Initialise la fonctionnalité glisser-déposer pour les favoris
        initializeDragAndDrop();
        
        // Initialise les suggestions de recherche
        console.log('[Main] Initialisation des suggestions de recherche avec le modèle');
        initSuggestions(model);
        
    } catch (error) {
        console.error("[Main] Erreur lors de l'initialisation de l'application:", error);
        document.body.innerHTML = `
            <div style="color: red; padding: 20px; text-align: center;">
                <h2>Erreur d'Application</h2>
                <p>Désolé, l'application n'a pas pu se charger. Veuillez rafraîchir la page.</p>
                <p>Erreur: ${error.message || 'Erreur inconnue'}</p>
            </div>
        `;
    }
});

// Structure suggérée pour la création de cartes de films
function createMovieCard(movie, isFavorite = false) {
    
    // Pour les cartes de la section résultats, enveloppe le lien IMDb et le bouton favoris dans un conteneur
    if (!isFavorite) {
        // Création d'une ligne d'actions
        const actionRow = document.createElement('div');
        actionRow.className = 'action-row';
        
        // Ajout du lien IMDb à la ligne d'actions
        const imdbLink = document.createElement('a');
        imdbLink.href = `https://www.imdb.com/title/${movie.imdbID}`;
        imdbLink.className = 'imdb-link';
        imdbLink.textContent = 'Voir sur IMDb';
        imdbLink.target = '_blank';
        actionRow.appendChild(imdbLink);
        
        // Ajout du bouton favoris à la ligne d'actions
        const favoriteButton = document.createElement('button');
        favoriteButton.className = 'favorite-button';
        favoriteButton.textContent = isFavorite ? 'Retirer des Favoris' : 'Ajouter aux Favoris';
        favoriteButton.onclick = () => toggleFavorite(movie);
        actionRow.appendChild(favoriteButton);
        
        // Ajout de la ligne d'actions aux infos du film
        movieInfo.appendChild(actionRow);
    } else {
        const favoriteButton = document.createElement('button');
        favoriteButton.className = 'favorite-button remove';
        favoriteButton.textContent = 'Retirer des Favoris';
        favoriteButton.onclick = () => toggleFavorite(movie);
        movieInfo.appendChild(favoriteButton);
    }
}
