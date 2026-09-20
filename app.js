document.addEventListener('DOMContentLoaded', () => {
    const engine = new NLPEngine();
    const chatDisplay = document.getElementById('chat-display');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const typingIndicator = document.getElementById('typing-indicator');
    const suggestionContainer = document.getElementById('suggestions');
    const answeredCountEl = document.getElementById('session-answered');
    
    let sessionAnswered = 0;

    // Initialize stats
    document.getElementById('faq-count').innerText = faqData.length;
    const categories = [...new Set(faqData.map(item => item.category))];
    document.getElementById('cat-count').innerText = categories.length;

    // 1. Suggested Questions
    const suggestions = [
        "What services do you provide?",
        "How much does it cost?",
        "Is my data secure?",
        "What payment methods do you accept?"
    ];

    suggestions.forEach(text => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerText = text;
        chip.onclick = () => handleUserInput(text);
        suggestionContainer.appendChild(chip);
    });

    // 2. Chat Handlers
    chatForm.onsubmit = (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (text) handleUserInput(text);
    };

    async function handleUserInput(text) {
        addMessage(text, 'user');
        userInput.value = '';
        
        // Show typing
        typingIndicator.classList.remove('hidden');
        chatDisplay.scrollTop = chatDisplay.scrollHeight;

        // Simulate AI "thinking" time
        setTimeout(() => {
            typingIndicator.classList.add('hidden');
            processResponse(text);
        }, 800);
    }

    function processResponse(query) {
        // Special Case: Greetings
        const greetings = ['hi', 'hello', 'hey', 'greetings'];
        if (greetings.includes(query.toLowerCase())) {
            addMessage("Hello! I'm TechNova AI. How can I assist you with our products or pricing today?", 'bot');
            return;
        }

        const match = engine.findBestMatch(query, faqData);

        if (match) {
            const confidence = (match.confidence * 100).toFixed(0);
            const response = `${match.answer} <br><br> <small><i>(Match confidence: ${confidence}%)</i></small>`;
            addMessage(response, 'bot');
            sessionAnswered++;
            answeredCountEl.innerText = sessionAnswered;
        } else {
            addMessage("I’m sorry, I couldn’t find a relevant answer to that question. Please try rephrasing it or contact our support team at support@technova.com.", 'bot');
        }
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        msgDiv.innerHTML = `
            ${text}
            <span class="time">${time}</span>
            ${sender === 'bot' ? '<button class="copy-btn" onclick="copyText(this)"><i class="far fa-copy"></i></button>' : ''}
        `;
        
        chatDisplay.appendChild(msgDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    // Global clear chat
    document.getElementById('clear-chat').onclick = () => {
        chatDisplay.innerHTML = '<div class="message bot-msg">Conversation cleared. How can I help you?</div>';
    };
});

// Helper for copying text
function copyText(btn) {
    const text = btn.parentElement.innerText.replace('Copy', '').trim();
    navigator.clipboard.writeText(text);
    btn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => { btn.innerHTML = '<i class="far fa-copy"></i>'; }, 2000);
}