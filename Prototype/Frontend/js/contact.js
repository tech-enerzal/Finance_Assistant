document.addEventListener("DOMContentLoaded", function() {
    // Navbar Link Hover Animation
    const navbarLinks = document.querySelectorAll(".navbar-nav .nav-link");
    navbarLinks.forEach(link => {
        link.addEventListener("mouseover", () => {
            link.style.transition = "transform 0.4s ease, color 0.4s ease";
            link.style.transform = "translateY(-3px) scale(1.1)";
            link.style.color = "#ff4d4f";
            link.style.textShadow = "0 4px 6px rgba(255, 77, 79, 0.5)";
        });
        link.addEventListener("mouseleave", () => {
            link.style.transform = "translateY(0) scale(1)";
            link.style.color = "";
            link.style.textShadow = "none";
        });
    });

    // Contact Form Fields Entrance Animation
    const formFields = document.querySelectorAll(".form-control");
    formFields.forEach((field, index) => {
        field.style.opacity = 0;
        setTimeout(() => {
            field.style.transition = "opacity 0.8s ease, transform 0.8s ease";
            field.style.opacity = 1;
            field.style.transform = "translateY(0)";
        }, index * 150); // Stagger entrance animation
    });

    // Contact Form Focus Animation
    formFields.forEach(field => {
        field.addEventListener("focus", () => {
            field.style.transition = "box-shadow 0.3s ease, transform 0.3s ease";
            field.style.boxShadow = "0 0 12px rgba(220, 53, 69, 0.6)";
            field.style.transform = "scale(1.03)";
            field.style.backgroundColor = "#fff4f5";
        });
        field.addEventListener("blur", () => {
            field.style.boxShadow = "none";
            field.style.transform = "scale(1)";
            field.style.backgroundColor = "";
        });
    });

    // Button Bounce and Glow Effect on Hover
    const submitButton = document.querySelector(".btn-danger");
    submitButton.addEventListener("mouseover", () => {
        submitButton.style.animation = "bounce 0.6s infinite alternate";
        submitButton.style.boxShadow = "0 0 10px rgba(220, 53, 69, 0.6)";
    });
    submitButton.addEventListener("mouseleave", () => {
        submitButton.style.animation = "none";
        submitButton.style.boxShadow = "none";
    });

    // Form Submission Animation
    const form = document.querySelector(".contact-form");
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        submitButton.textContent = "Sending...";
        submitButton.style.backgroundColor = "#c82333";
        submitButton.classList.add("pulse");

        // Mock send delay
        setTimeout(() => {
            submitButton.textContent = "Message Sent!";
            form.reset();

            // Animated background on successful submission
            document.body.classList.add("bg-success-flash");
            setTimeout(() => {
                document.body.classList.remove("bg-success-flash");
            }, 800);

            // Reset button state after a delay
            setTimeout(() => {
                submitButton.textContent = "Send Message";
                submitButton.classList.remove("pulse");
                submitButton.style.backgroundColor = "#dc3545";
            }, 2000);
        }, 1500);
    });
});
