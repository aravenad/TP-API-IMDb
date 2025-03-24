// Main application file - entry point that initializes the app

import MovieModel from './modelMovie.js';
import view from './view.js';
import MovieController from './controller.js';
import { initializeDragAndDrop } from './dragdrop.js';
import { initSuggestions } from './suggestions.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('[Main] Initializing application');
        const model = new MovieModel();
        
        // Debug log to check if model has searchMovies method
        console.log('[Main] Model initialized:', model);
        console.log('[Main] Model searchMovies method:', model.searchMovies);
        
        const app = new MovieController(model, view);
        
        // Initialize drag and drop functionality for favorites
        initializeDragAndDrop();
        
        // Initialize search suggestions
        console.log('[Main] Initializing search suggestions with model');
        initSuggestions(model);
        
    } catch (error) {
        console.error("[Main] Error initializing application:", error);
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

// Add a function to prioritize selected movies from suggestions
function prioritizeSearchResults(results) {
    // If no results or not an array, return as is
    if (!results || !Array.isArray(results)) return results;
    
    try {
        // Check if we have a recently selected movie from suggestions
        const lastSelectedMovie = localStorage.getItem('last_selected_movie');
        if (lastSelectedMovie) {
            const selectedMovie = JSON.parse(lastSelectedMovie);
            
            // Find the index of the selected movie in results
            const selectedMovieIndex = results.findIndex(movie => {
                const movieId = movie['#IMDB_ID'] || movie.imdbID || movie.id;
                return movieId === selectedMovie.id;
            });
            
            // If found, move it to the beginning of the results array
            if (selectedMovieIndex > 0) {
                console.log(`[Main] Moving selected movie "${selectedMovie.title}" to top of results`);
                const movieToPromote = results.splice(selectedMovieIndex, 1)[0];
                results.unshift(movieToPromote);
            }
            
            // Clear the last selected movie to avoid affecting future unrelated searches
            localStorage.removeItem('last_selected_movie');
        }
    } catch (error) {
        console.error('[Main] Error prioritizing search results:', error);
    }
    
    return results;
}

// Find the right place to integrate this function
// This could be in the controller or the search handler function
// For example, if there's a processResults function:
function processResults(results) {
    // Prioritize the selected movie if any
    results = prioritizeSearchResults(results);
    
    // Continue with regular processing
    // ...existing processing code...
    
    return results;
}
