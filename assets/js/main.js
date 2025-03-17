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
