/**
 * @fileoverview Handles chat interface interactions, including sending messages,
 * managing conversation history, handling file uploads, and communicating with
 * the backend API.
 * @version 1.0
 */

document.addEventListener('DOMContentLoaded', function() {
    /**
     * DOM Elements
     */
    const chatBubbles = document.querySelector('.chat-bubbles'); // Container for chat messages
    const initialBubbles = document.querySelector('.initial-bubbles'); // Initial chat bubbles
    const sendButton = document.getElementById('sendButton'); // Send button element
    const input = document.getElementById('userInput'); // User input field
    const logo = document.getElementById('logo'); // Logo element
    const fileUpload = document.getElementById('fileUpload'); // File upload input

    /**
     * Adds click event listeners to each initial chat bubble.
     * When a bubble is clicked, its associated message is sent.
     */
    document.querySelectorAll('.initial-bubbles .chat-bubble').forEach(bubble => {
        bubble.addEventListener('click', function() {
            const message = this.getAttribute('data-message');
            sendMessage(message);
        });
    });

    /**
     * Adds a click event listener to the send button.
     * When clicked, it sends the message from the input field if not empty.
     */
    sendButton.addEventListener('click', function() {
        const message = input.value.trim();
        if (message !== '') {
            sendMessage(message);
        }
    });

    /**
     * Adds a keydown event listener to the input field.
     * When the ENTER key is pressed, it sends the message if not empty.
     * @param {KeyboardEvent} event - The keyboard event triggered by the user.
     */
    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default new line in textarea
            const message = input.value.trim();
            if (message !== '') {
                sendMessage(message);
            }
        }
    });

    let conversationHistory = []; // Array to hold the chat history

    /**
     * Initial system message defining the assistant's role and guidelines.
     * Utilizes Markdown for response formatting.
     * @type {string}
     */
    
    // Use Markdown when generating responses


    /**
     * Prunes the conversation history to retain only the system message and the last three user/assistant interactions.
     */
    function pruneConversationHistory() {
        // Retain only the last 4 messages (adjust the number as needed)
        if (conversationHistory.length > 4) {
            conversationHistory = conversationHistory.slice(-4);
        }
    }
    

    /**
     * Sends a message from the user to the assistant and handles the response.
     * @param {string} message - The message input by the user.
     */
    async function sendMessage(message) {
        if (message) {
            // Remove initial bubbles and logo after the first message is sent
            if (initialBubbles) {
                initialBubbles.remove();
            }
            if (logo) {
                logo.remove();
            }
    
            console.log("User message:", message);
    
            // Create user message bubble
            const userBubble = document.createElement('div');
            userBubble.className = 'chat-bubble chat-bubble-user shadow-sm';
            userBubble.innerHTML = `<p>${message}</p>`;
            chatBubbles.appendChild(userBubble);
    
            // Add the user's message to the conversation history
            conversationHistory.push({ role: "user", content: message });
    
            // Prune conversation history to retain only last 3 messages plus system prompt
            pruneConversationHistory();
    
            // Clear input and disable it while waiting for response
            input.value = '';
            input.disabled = true; // Disable input while waiting for response
            chatBubbles.scrollTop = chatBubbles.scrollHeight; // Scroll to bottom
    
            try {
                // Retrieve the JWT token from localStorage and log its presence
                const token = localStorage.getItem('jwtToken');
                console.log("Authorization Token from localStorage:", token);
    
                // Check if token is missing and log a message if necessary
                if (!token) {
                    console.error("Authorization Token is missing. User might need to log in again.");
                    alert("Authorization Token is missing. Please log in again.");
                    input.disabled = false; // Re-enable input to allow user action
                    return;
                }
    
                // Send the conversation history with Authorization header
                const response = await fetch("http://localhost:5000/api/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        messages: conversationHistory // Send conversation history only
                    })
                });
    
                console.log("Response status:", response.status);
                const responseBody = await response.json();
                console.log("Response body:", responseBody);
    
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
    
                // Create and display assistant response bubble
                const assistantBubble = document.createElement('div');
                assistantBubble.className = 'chat-bubble chat-bubble-assistant shadow-sm';
                assistantBubble.innerHTML = `<p>${responseBody.content}</p>`;
                chatBubbles.appendChild(assistantBubble);
    
                // Add the assistant's message to the conversation history
                conversationHistory.push({ role: "assistant", content: responseBody.content });
    
            } catch (error) {
                console.error("Error in sendMessage:", error);
                const errorBubble = document.createElement('div');
                errorBubble.className = 'chat-bubble chat-bubble-assistant shadow-sm';
                errorBubble.innerHTML = `<p>Sorry, I encountered an error. Please try again later.</p>`;
                chatBubbles.appendChild(errorBubble);
            }
    
            // Re-enable input
            input.disabled = false;
            chatBubbles.scrollTop = chatBubbles.scrollHeight; // Scroll to bottom
        }
    }
    
    

    /**
     * Handles file uploads to allow users to send documents to the assistant.
     */
    fileUpload.addEventListener('change', async function(event) {
        const file = event.target.files[0];
        if (file) {
            // Disable input while processing the file
            input.disabled = true;

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('http://localhost:5000/api/upload', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                if (result.content) {
                    const fileName = file.name; // Get the file name
                    const content = result.content;
                    console.log("Uploaded file content:", content);

                    // Add the explanation and file name to the system prompt (this is for the model, not shown to the user)
                    const systemMessage = `
                        The user has uploaded a document named "${fileName}". The contents of this file should be considered to assist in generating responses.
                        Here is the content of the file parse in text format:
                        ${content}
                    `;

                    // Add this system message to the conversation history, but do not display it to the user
                    conversationHistory.push({ role: "system", content: systemMessage });
                    console.log(conversationHistory)

                    // Notify user that the file is uploaded successfully
                    const fileSuccessBubble = document.createElement('div');
                    fileSuccessBubble.className = 'chat-bubble chat-bubble-system shadow-sm';
                    fileSuccessBubble.innerHTML = `<p>File <b>"${fileName}"</b> uploaded successfully and ready to be used.</p>`;
                    chatBubbles.appendChild(fileSuccessBubble);

                    // Re-enable input for further queries
                    input.disabled = false;

                } else {
                    throw new Error('Failed to process the file.');
                }

            } catch (error) {
                console.error("Error uploading file:", error);
                // Display error message to user
                const errorBubble = document.createElement('div');
                errorBubble.className = 'chat-bubble chat-bubble-system shadow-sm';
                errorBubble.innerHTML = `<p>Sorry, there was an issue with the file upload.</p>`;
                chatBubbles.appendChild(errorBubble);
                input.disabled = false; // Re-enable input
            }
            chatBubbles.scrollTop = chatBubbles.scrollHeight; // Scroll to bottom
        }
    });
});
