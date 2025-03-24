/**
 * Animations et interactions de style Apple
 */

document.addEventListener('DOMContentLoaded', () => {
    // Ajoute un effet de survol subtil à tous les éléments interactifs
    const interactiveElements = document.querySelectorAll('button, .imdb-link');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', applyHoverEffect);
        element.addEventListener('mouseleave', removeHoverEffect);
    });
    
    // Observe les nouveaux éléments ajoutés au DOM
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Nœud élément
                        const newInteractiveElements = node.querySelectorAll('button, .movie-card, .imdb-link');
                        newInteractiveElements.forEach(element => {
                            element.addEventListener('mouseenter', applyHoverEffect);
                            element.addEventListener('mouseleave', removeHoverEffect);
                        });
                        
                        // Si le nœud lui-même est un élément interactif
                        if (node.matches('button, .movie-card, .imdb-link')) {
                            node.addEventListener('mouseenter', applyHoverEffect);
                            node.addEventListener('mouseleave', removeHoverEffect);
                        }
                    }
                });
            }
        });
    });
    
    // Commence à observer le document pour les nœuds ajoutés
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Ajoute un comportement de défilement fluide
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
    
    // Observation spéciale pour la section des résultats
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
        const resultsObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    // Vérifie s'il s'agit d'une nouvelle recherche (le conteneur a été vidé d'abord)
                    const isNewSearch = Array.from(mutation.addedNodes).some(node => 
                        node.nodeType === 1 && 
                        (node.classList.contains('loading') || node.classList.contains('no-results'))
                    );
                    
                    // Ajoute une animation échelonnée aux nouvelles cartes de résultats
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

/**
 * Applique l'effet de survol à un élément
 */
function applyHoverEffect(e) {
    if (this.classList.contains('movie-card')) {
        // N'ajoute pas de transformation supplémentaire si déjà transformé par le survol CSS
        return;
    }
    
    this.style.transition = 'transform 0.2s ease-out';
    this.style.transform = 'scale(0.98)';
}

/**
 * Supprime l'effet de survol d'un élément
 */
function removeHoverEffect(e) {
    if (this.classList.contains('movie-card')) {
        return;
    }
    
    this.style.transform = 'scale(1)';
}

/**
 * Fonction d'animation pour les cartes favorites (désactivée)
 * @param {HTMLElement} card - La carte à animer
 */
function animateFavoriteCard(card) {
    // Pas d'animations pour éviter le scintillement
    // Fonction laissée comme stub pour la compatibilité
}

/**
 * Anime les cartes de résultats avec un timing échelonné
 * @param {HTMLElement} card - La carte à animer
 * @param {number} index - L'index de la carte pour le timing échelonné
 */
function animateResultCard(card, index) {
    card.style.opacity = 0;
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        card.style.opacity = 1;
        card.style.transform = 'translateY(0)';
    }, 100 + (index * 100)); // Délai échelonné basé sur l'index de la carte
}

// Exporte le module d'animations pour une réutilisation potentielle
export const animations = {
    applyHoverEffect,
    removeHoverEffect,
    animateFavoriteCard,
    animateResultCard
};
