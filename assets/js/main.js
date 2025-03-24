// Main application file - entry point that initializes the app

import MovieModel from './modelMovie.js';
import view from './view.js';
import MovieController from './controller.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        const app = new MovieController(new MovieModel(), view);
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

// Note: This is a modification suggestion for the movie card creation function

// When creating movie cards for search results, make sure to use this structure:
function createMovieCard(movie, isFavorite = false) {
    // ...existing code...
    
    // For results section cards, wrap the IMDb link and favorite button in a container
    if (!isFavorite) {
        // Create action row div 
        const actionRow = document.createElement('div');
        actionRow.className = 'action-row';
        
        // Add IMDb link to action row
        const imdbLink = document.createElement('a');
        imdbLink.href = `https://www.imdb.com/title/${movie.imdbID}`;
        imdbLink.className = 'imdb-link';
        imdbLink.textContent = 'View on IMDb';
        imdbLink.target = '_blank';
        actionRow.appendChild(imdbLink);
        
        // Add favorite button to action row
        const favoriteButton = document.createElement('button');
        favoriteButton.className = 'favorite-button';
        favoriteButton.textContent = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
        favoriteButton.onclick = () => toggleFavorite(movie);
        actionRow.appendChild(favoriteButton);
        
        // Add action row to movie info
        movieInfo.appendChild(actionRow);
    } else {
        // For favorites, keep the button at the bottom
        const favoriteButton = document.createElement('button');
        favoriteButton.className = 'favorite-button remove';
        favoriteButton.textContent = 'Remove from Favorites';
        favoriteButton.onclick = () => toggleFavorite(movie);
        movieInfo.appendChild(favoriteButton);
    }
    
    // ...existing code...
}
