document.addEventListener("DOMContentLoaded", function() {
    // Navbar Link Hover Animation
    const navbarLinks = document.querySelectorAll(".navbar-nav .nav-link");
    navbarLinks.forEach(link => {
        link.addEventListener("mouseover", () => {
            link.style.transition = "transform 0.3s ease, color 0.3s ease";
            link.style.transform = "scale(1.1)";
            link.style.color = "#ff4d4f";
        });
        link.addEventListener("mouseleave", () => {
            link.style.transform = "scale(1)";
            link.style.color = "";
        });
    });

    // Heading Fade-In Animation
    const headings = document.querySelectorAll("h1, h2");
    headings.forEach((heading, index) => {
        setTimeout(() => {
            heading.classList.add("fade-in");
        }, index * 500); // Stagger animation
    });

    // Card Slide-Up and Zoom Animation
    const cards = document.querySelectorAll(".card");
    cards.forEach((card, index) => {
        card.style.opacity = 0;
        setTimeout(() => {
            card.style.transition = "transform 0.6s ease, opacity 0.6s ease";
            card.style.transform = "translateY(-20px) scale(1.05)";
            card.style.opacity = 1;
        }, index * 200); // Stagger animation for each card
    });

    // Carousel Slide Animation
    const carouselItems = document.querySelectorAll(".carousel-item img");
    carouselItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add("slide-in");
        }, index * 300);
    });

    // Button Pulsing Effect
    const carouselButtons = document.querySelectorAll(".carousel-control-prev, .carousel-control-next");
    carouselButtons.forEach(button => {
        button.addEventListener("mouseover", () => {
            button.classList.add("pulse");
        });
        button.addEventListener("mouseleave", () => {
            button.classList.remove("pulse");
        });
    });
});
