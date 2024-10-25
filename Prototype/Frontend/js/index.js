// Function to add continuous bouncing effect with glow to the "Get Started" button
function addContinuousBounceEffect() {
    const getStartedButton = document.querySelector('.btn-danger');
    
    // Add the continuous bounce effect
    getStartedButton.classList.add('continuous-bounce');
}
// Enhanced navbar scroll effect with fade-in and glow on scroll
function enhancedNavbarScrollEffect() {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled', 'navbar-fade-in', 'navbar-glow');
        } else {
            navbar.classList.remove('navbar-scrolled', 'navbar-fade-in', 'navbar-glow');
        }
    });
}

// Smooth fade-in effect for main content
function fadeInMainContent() {
    const mainContent = document.querySelector('.main-content');
    mainContent.style.opacity = '0';
    setTimeout(() => {
        mainContent.style.transition = 'opacity 2s ease';
        mainContent.style.opacity = '1';
        mainContent.classList.add('main-fade-in');
    }, 500);
}

// Function to fade in and animate navbar links individually
function animateNavbarLinks() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach((link, index) => {
        link.style.opacity = '0';
        setTimeout(() => {
            link.style.transition = `opacity 0.5s ease ${index * 0.3}s`;
            link.style.opacity = '1';
            link.classList.add('link-slide-in');
        }, index * 200);
    });
}

// Pulse effect for header text and fade-in for content in the left container
function animateLeftContainerContent() {
    const elements = document.querySelectorAll('.left-container h1, .left-container h2, .left-container p');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.opacity = '1';
            element.classList.add('text-slide-in');
        }, index * 250);
    });
}

// Event listeners for DOM load and button interactions
window.addEventListener('DOMContentLoaded', () => {
    addContinuousBounceEffect();
    enhancedNavbarScrollEffect();
    fadeInMainContent();
    animateNavbarLinks();
    animateLeftContainerContent();
    smoothScroll();
});
