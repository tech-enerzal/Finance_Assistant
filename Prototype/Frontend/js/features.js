// features.js

document.addEventListener("DOMContentLoaded", function () {
    
    // Responsive Feature Boxes: Slide up with fade-in and staggered timing
    const featuresBoxes = document.querySelectorAll(".features-box");
    featuresBoxes.forEach((box, index) => {
        box.style.opacity = "0";
        box.style.transform = "translateY(50px)";
        box.style.transition = "opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)";
        setTimeout(() => {
            box.style.opacity = "1";
            box.style.transform = "translateY(0)";
        }, index * 200);
    });

    // Navbar: Smooth slide-in from top
    const navbar = document.querySelector(".navbar");
    navbar.style.transform = "translateY(-60px)";
    navbar.style.transition = "transform 0.6s ease-out";
    setTimeout(() => {
        navbar.style.transform = "translateY(0)";
    }, 300);

    // Heading Text: Gradient shimmer with fade-in and slight zoom
    const heading = document.querySelector(".features-section h1");
    heading.style.opacity = "0";
    heading.style.transform = "scale(0.9)";
    heading.style.transition = "opacity 1s ease, transform 1s ease, background-position 3.5s ease-in-out";
    setTimeout(() => {
        heading.style.opacity = "1";
        heading.style.transform = "scale(1)";
    }, 500);
    heading.style.backgroundSize = "200% auto";
    setInterval(() => {
        heading.style.backgroundPosition = heading.style.backgroundPosition === "0% 0%" ? "100% 0%" : "0% 0%";
    }, 3500); // Gradient shimmer effect

    // Paragraph Text: Subtle fade-in with staggered timing for each paragraph
    const paragraphs = document.querySelectorAll(".features-section p, .features-text");
    paragraphs.forEach((text, index) => {
        text.style.opacity = "0";
        text.style.transition = "opacity 0.8s ease, transform 0.8s ease";
        text.style.transform = "translateY(30px)";
        setTimeout(() => {
            text.style.opacity = "1";
            text.style.transform = "translateY(0)";
        }, index * 150); // Staggered timing
    });

    // Icons: Smooth scaling on hover
    const featureIcons = document.querySelectorAll(".features-icon");
    featureIcons.forEach((icon) => {
        icon.addEventListener("mouseover", () => {
            icon.style.transition = "transform 0.4s ease-in-out";
            icon.style.transform = "scale(1.15)";
        });
        icon.addEventListener("mouseleave", () => {
            icon.style.transform = "scale(1)";
        });
    });

    // Navbar Toggler: Clean rotation on click
    const navbarToggler = document.querySelector(".navbar-toggler");
    if (navbarToggler) {
        navbarToggler.addEventListener("click", () => {
            navbarToggler.style.transition = "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
            navbarToggler.style.transform = navbarToggler.style.transform === "rotate(90deg)" ? "rotate(0deg)" : "rotate(90deg)";
        });
    }
});
