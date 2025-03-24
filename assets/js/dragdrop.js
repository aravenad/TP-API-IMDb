/**
 * Drag and drop functionality for favorite movies
 * Allows users to reorder their favorites using drag and drop
 */

// Store the currently dragged item
let draggedItem = null;

/**
 * Initialize drag and drop functionality
 */
export function initializeDragAndDrop() {
    // Find the favorites container
    const favoritesContainer = document.getElementById('favorites-container');
    if (!favoritesContainer) return;

    // Set up a MutationObserver to watch for new movie cards
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('movie-card')) {
                        makeDraggable(node);
                    }
                });
            }
        });
    });

    // Start observing the favorites container
    observer.observe(favoritesContainer, { childList: true });

    // Also make container a drop zone
    setupDropZone(favoritesContainer);
}

/**
 * Make a movie card draggable
 * @param {HTMLElement} element - The element to make draggable
 */
function makeDraggable(element) {
    // Add necessary attributes
    element.setAttribute('draggable', 'true');
    
    // Add visual indicator that the card is draggable
    element.style.cursor = 'grab';
    
    // Add drag indicator
    const dragIndicator = document.createElement('div');
    dragIndicator.className = 'drag-indicator';
    dragIndicator.innerHTML = '⋮⋮'; // "Burger menu" style indicator
    dragIndicator.title = 'Drag to reorder';
    dragIndicator.style.position = 'absolute';
    dragIndicator.style.right = '10px';
    dragIndicator.style.top = '10px';
    dragIndicator.style.color = 'var(--text-secondary)';
    dragIndicator.style.fontSize = '16px';
    dragIndicator.style.opacity = '0.7';
    
    // Add relative positioning to the card if it doesn't have it
    if (getComputedStyle(element).position === 'static') {
        element.style.position = 'relative';
    }
    
    element.appendChild(dragIndicator);

    // Add drag event listeners
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragend', handleDragEnd);
}

/**
 * Set up a container as a drop zone
 * @param {HTMLElement} container - The container to make a drop zone
 */
function setupDropZone(container) {
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('dragenter', handleDragEnter);
    container.addEventListener('dragleave', handleDragLeave);
    container.addEventListener('drop', handleDrop);
}

/**
 * Handle the start of a drag operation
 * @param {DragEvent} e - The drag event
 */
function handleDragStart(e) {
    // Set data and reference the dragged item
    draggedItem = this;
    
    // Set the drag effect
    e.dataTransfer.effectAllowed = 'move';
    
    // Set some data (required for Firefox)
    e.dataTransfer.setData('text/html', this.innerHTML);
    
    // Add styling to show it's being dragged
    this.classList.add('dragging');
    
    // Take a small delay to show the dragging visual effect
    setTimeout(() => {
        this.style.opacity = '0.6';
    }, 0);
}

/**
 * Handle the end of a drag operation
 */
function handleDragEnd() {
    // Remove the dragging style
    this.classList.remove('dragging');
    this.style.opacity = '1';
    
    // Reset all placeholder spaces
    const dropPlaceholders = document.querySelectorAll('.drop-placeholder');
    dropPlaceholders.forEach(placeholder => placeholder.remove());
}

/**
 * Handle dragging over a drop target
 * @param {DragEvent} e - The drag event
 */
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Allows us to drop
    }
    
    e.dataTransfer.dropEffect = 'move';
    
    return false;
}

/**
 * Handle entering a drop target
 * @param {DragEvent} e - The drag event
 */
function handleDragEnter(e) {
    // Only process if we're entering the container itself or another movie card
    const target = e.target.closest('.movie-card') || e.target.closest('#favorites-container');
    if (!target || target === draggedItem) return;

    // Find all movie cards in the container
    const movieCards = Array.from(document.querySelectorAll('#favorites-container .movie-card'));
    
    // If we're over another movie card, find where to insert the placeholder
    if (target.classList.contains('movie-card')) {
        const rect = target.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        
        // Determine if we're above or below the midpoint
        if (e.clientY < midpoint) {
            // Insert before the target
            if (target.previousElementSibling !== draggedItem) {
                target.parentNode.insertBefore(createPlaceholder(), target);
            }
        } else {
            // Insert after the target
            if (target.nextElementSibling !== draggedItem) {
                target.parentNode.insertBefore(createPlaceholder(), target.nextElementSibling);
            }
        }
    }
    // If we're just over the container and there are no cards yet
    else if (target.id === 'favorites-container' && movieCards.length === 0) {
        target.appendChild(createPlaceholder());
    }
}

/**
 * Handle leaving a drop target
 */
function handleDragLeave() {
    // Remove any placeholder if the mouse has left the area
    // We use a delay to prevent flicker when moving between cards
    setTimeout(() => {
        const hoveredElement = document.elementFromPoint(event.clientX, event.clientY);
        if (!hoveredElement || !hoveredElement.closest('#favorites-container')) {
            const placeholders = document.querySelectorAll('.drop-placeholder');
            placeholders.forEach(placeholder => placeholder.remove());
        }
    }, 50);
}

/**
 * Handle drop event
 * @param {DragEvent} e - The drag event
 */
function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation(); // Stops some browsers from redirecting
    }
    
    // Only process the drop if we have a draggedItem
    if (!draggedItem) return false;
    
    // Find the placeholder
    const placeholder = document.querySelector('.drop-placeholder');
    if (placeholder) {
        // Insert the dragged item where the placeholder is
        placeholder.parentNode.insertBefore(draggedItem, placeholder);
        placeholder.remove();
    }
    
    // Update the favorites order in storage
    updateFavoritesOrder();
    
    return false;
}

/**
 * Create a placeholder element for drop indication
 * @returns {HTMLElement} - The placeholder element
 */
function createPlaceholder() {
    // Remove any existing placeholders
    const existingPlaceholders = document.querySelectorAll('.drop-placeholder');
    existingPlaceholders.forEach(p => p.remove());
    
    // Create a new placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'drop-placeholder';
    placeholder.style.height = '10px';
    placeholder.style.backgroundColor = 'var(--primary-color)';
    placeholder.style.borderRadius = '5px';
    placeholder.style.margin = '10px 0';
    placeholder.style.transition = 'all 0.2s ease';
    
    return placeholder;
}

/**
 * Update the favorites order in localStorage
 */
function updateFavoritesOrder() {
    // Get all favorite movie cards
    const favoriteCards = document.querySelectorAll('#favorites-container .movie-card');
    
    // Extract movie IDs in their current order
    const favoriteIds = Array.from(favoriteCards).map(card => {
        // Get the movie ID from the card
        // This assumes each card has a data attribute with the movie ID
        return card.dataset.movieId;
    });
    
    // Get current favorites from localStorage
    let favorites = [];
    try {
        favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    } catch (error) {
        console.error('Error parsing favorites from localStorage:', error);
    }
    
    // Reorder the favorites array based on the new order of IDs
    const reorderedFavorites = favoriteIds.map(id => 
        favorites.find(favorite => favorite.imdbID === id)
    ).filter(Boolean); // Remove any undefined entries
    
    // Save the reordered favorites back to localStorage
    localStorage.setItem('favorites', JSON.stringify(reorderedFavorites));
}

// Initialize when the script is loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initializeDragAndDrop, 1);
} else {
    document.addEventListener('DOMContentLoaded', initializeDragAndDrop);
}
