// index.js

// Function to add glowing effect to all buttons on hover
function addGlowEffect() {
    const buttons = document.querySelectorAll('.btn-danger');
    buttons.forEach(button => {
        button.addEventListener('mouseover', () => {
            button.classList.add('glow');
        });
        button.addEventListener('mouseout', () => {
            button.classList.remove('glow');
        });
    });
}

// Sweeper function for a sweeping highlight effect across the main content
function sweeperEffect() {
    const mainContent = document.querySelector('.main-content');
    mainContent.classList.add('sweeper');
}

// Function to fade in navbar items one by one with a color transition effect
function fadeInNavbar() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach((link, index) => {
        link.style.animation = `fadeIn 0.5s ease ${index * 0.3}s forwards`;
        link.addEventListener('mouseover', () => {
            link.classList.add('nav-color-transition');
        });
        link.addEventListener('mouseout', () => {
            link.classList.remove('nav-color-transition');
        });
    });
}

// Function to animate left container text on page load
function animateLeftContainer() {
    const elements = document.querySelectorAll('.left-container h1, .left-container h2, .left-container p, .btn-danger');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.opacity = '1';
            element.classList.add('slide-in');
        }, index * 200);
    });
}

// Pulse effect for header text
function pulseHeaderText() {
    const headerText = document.querySelector('.left-container h1');
    headerText.classList.add('pulse');
}

// Scroll-to-top button functionality
function scrollToTop() {
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerText = '⬆️';
    scrollTopBtn.classList.add('scroll-to-top');
    document.body.appendChild(scrollTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.style.display = 'block';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Navbar background change and glow on scroll
function navbarScrollEffect() {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled', 'navbar-glow');
        } else {
            navbar.classList.remove('navbar-scrolled', 'navbar-glow');
        }
    });
}

// Shake effect for login button on hover
function addShakeEffect() {
    const loginButton = document.querySelector('.btn-danger');
    loginButton.addEventListener('mouseover', () => {
        loginButton.classList.add('shake');
    });
    loginButton.addEventListener('mouseout', () => {
        loginButton.classList.remove('shake');
    });
}

// Smooth scroll for in-page navigation
function smoothScroll() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            document.getElementById(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

// Event listeners for DOM load and button interactions
window.addEventListener('DOMContentLoaded', () => {
    addGlowEffect();
    sweeperEffect();
    fadeInNavbar();
    animateLeftContainer();
    pulseHeaderText();
    scrollToTop();
    navbarScrollEffect();
    addShakeEffect();
    smoothScroll();
});
