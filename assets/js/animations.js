/**
 * Apple-style animations and interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Add subtle hover effect to all interactive elements
    const interactiveElements = document.querySelectorAll('button, .movie-card, .imdb-link');
    
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
    
    // Add search input animation
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.style.transform = 'scale(1.01)';
        });
        
        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.style.transform = 'scale(1)';
        });
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

// Export the animation module for potential reuse
export const animations = {
    applyHoverEffect,
    removeHoverEffect
};
