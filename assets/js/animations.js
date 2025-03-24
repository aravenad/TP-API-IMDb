/**
 * Apple-style animations and interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Add subtle hover effect to all interactive elements
    const interactiveElements = document.querySelectorAll('button, .imdb-link');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', applyHoverEffect);
        element.addEventListener('mouseleave', removeHoverEffect);
    });
    
    // Observe new elements being added to the DOM
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        const newInteractiveElements = node.querySelectorAll('button, .movie-card, .imdb-link');
                        newInteractiveElements.forEach(element => {
                            element.addEventListener('mouseenter', applyHoverEffect);
                            element.addEventListener('mouseleave', removeHoverEffect);
                        });
                        
                        // If the node itself is an interactive element
                        if (node.matches('button, .movie-card, .imdb-link')) {
                            node.addEventListener('mouseenter', applyHoverEffect);
                            node.addEventListener('mouseleave', removeHoverEffect);
                        }
                    }
                });
            }
        });
    });
    
    // Start observing the document for added nodes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Remove search input animation
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        // Remove the scale animations
        searchInput.addEventListener('focus', () => {
            // No transform applied
        });
        
        searchInput.addEventListener('blur', () => {
            // No transform applied
        });
    }
    
    // Special animations for favorites section - COMPLETELY DISABLED to prevent flickering
    const favoritesContainer = document.getElementById('favorites-container');
    if (favoritesContainer) {
        // No animations or observers for favorites to avoid flickering issues
    }
    
    // Special animations for results section
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
        const resultsObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    // Check if this is a new search (container was cleared first)
                    const isNewSearch = Array.from(mutation.addedNodes).some(node => 
                        node.nodeType === 1 && 
                        (node.classList.contains('loading') || node.classList.contains('no-results'))
                    );
                    
                    // Add staggered animation to new result cards
                    const newCards = Array.from(mutation.addedNodes).filter(
                        node => node.nodeType === 1 && node.classList.contains('movie-card')
                    );
                    
                    if (newCards.length) {
                        newCards.forEach((card, index) => {
                            animateResultCard(card, index);
                        });
                    }
                }
            });
        });
        
        resultsObserver.observe(resultsContainer, { childList: true });
    }
});

function applyHoverEffect(e) {
    if (this.classList.contains('movie-card')) {
        // Don't add additional transform if already transformed by CSS hover
        return;
    }
    
    this.style.transition = 'transform 0.2s ease-out';
    this.style.transform = 'scale(0.98)';
}

function removeHoverEffect(e) {
    if (this.classList.contains('movie-card')) {
        return;
    }
    
    this.style.transform = 'scale(1)';
}

// Remove animation function for favorite cards entirely
function animateFavoriteCard(card) {
    // No animations to prevent flickering
    // Function left as a stub for compatibility
}

// Add a function to animate result cards with staggered timing
function animateResultCard(card, index) {
    card.style.opacity = 0;
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        card.style.opacity = 1;
        card.style.transform = 'translateY(0)';
    }, 100 + (index * 100)); // Staggered delay based on card index
}

// Export the animation module for potential reuse
export const animations = {
    applyHoverEffect,
    removeHoverEffect,
    animateFavoriteCard,
    animateResultCard
};
