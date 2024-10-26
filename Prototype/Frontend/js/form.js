document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    // Function to authenticate and get JWT token
    async function authenticateUser() {
        const response = await fetch('http://127.0.0.1:5000/auth', {  // Update URL
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password' })  // Adjust credentials as needed
        });
        const data = await response.json();
        return data.access_token;
    }
    

    

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const token = await authenticateUser();  // Get JWT token
            const response = await fetch('http://127.0.0.1:5000/submit_form', {  // Update URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`  // Include token in request header
                },
                body: JSON.stringify(data)
            });            
            const result = await response.json();

            if (response.ok) {
                alert(result.message);  // Show success message
                window.location.href = '/pages/dashboard.html';  // Redirect to dashboard
            } else {
                alert('Error: ' + result.message);  // Show error message if not successful
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting form data');
        }
    });
});
