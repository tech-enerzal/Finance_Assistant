document.addEventListener("DOMContentLoaded", function () {
    const pricingPlans = document.querySelectorAll(".pricing-plan");
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
    const formFields = document.querySelectorAll(".form-section input, .form-section textarea, .form-section button");

    // Initial animations for navbar links (slide-in from the top)
    navLinks.forEach((link, index) => {
        link.style.animation = `slideInFromTop 0.5s ease ${index * 0.1}s forwards`;
    });

    // Bounce effect on pricing plans when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("bounce-in");
            }
        });
    }, { threshold: 0.5 });

    pricingPlans.forEach(plan => {
        observer.observe(plan);
    });

    // Button click effect without disturbing existing hover effects
    const buttons = document.querySelectorAll(".pricing-plan button");
    buttons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            button.classList.add("pulse-click");
            setTimeout(() => {
                button.classList.remove("pulse-click");
            }, 300);
        });
    });

    // Staggered fade-in for form fields
    formFields.forEach((field, index) => {
        field.style.animation = `fadeIn 0.5s ease ${(index + 1) * 0.2}s forwards`;
    });
});

// CSS for unique animations and transitions without affecting hover styles
const style = document.createElement("style");
style.textContent = `
    /* Navbar Link Slide-in from Top Animation */
    @keyframes slideInFromTop {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* Bounce-In Animation for Pricing Plans */
    .pricing-plan {
        opacity: 0; /* Start hidden for animation */
        transform: scale(0.9); /* Initial size for bounce effect */
        transition: transform 0.3s ease, box-shadow 0.3s ease; /* Keep existing CSS transitions */
    }
    .pricing-plan.bounce-in {
        opacity: 1;
        animation: bounceIn 0.6s ease forwards;
    }

    @keyframes bounceIn {
        0% { transform: scale(0.9); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }

    /* Pulse Click Animation for Buttons */
    .pricing-plan button.pulse-click {
        animation: pulse 0.3s ease;
    }

    @keyframes pulse {
        50% { transform: scale(0.95); }
        100% { transform: scale(1); }
    }

    /* Fade-In Animation for Form Fields */
    .form-section input, .form-section textarea, .form-section button {
        opacity: 0; /* Initially hidden */
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
