document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const filterType = document.getElementById('filter-type');
    const filterId = document.getElementById('filter-id');

    let categories = [];
    let files = [];

    async function loadFilters() {
        try {
            const [catRes, fileRes] = await Promise.all([
                fetch('/categories'),
                fetch('/files')
            ]);
            categories = await catRes.json();
            files = await fileRes.json();
        } catch (e) { console.error(e); }
    }

    filterType.onchange = () => {
        const type = filterType.value;
        if (type === 'all') {
            filterId.style.display = 'none';
        } else {
            filterId.style.display = 'block';
            filterId.innerHTML = '';
            const list = type === 'category' ? categories : files;
            list.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.id;
                opt.textContent = item.name || item.filename;
                filterId.appendChild(opt);
            });
        }
    };

    loadFilters();

    function appendMessage(role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}-message`;

        if (role === 'ai') {
            // Render markdown for AI messages
            msgDiv.innerHTML = marked.parse(text);
        } else {
            msgDiv.textContent = text;
        }

        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        userInput.value = '';
        appendMessage('user', text);

        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing';
        typingDiv.textContent = '... Escribiendo';
        chatWindow.appendChild(typingDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: text,
                    filter_type: filterType.value,
                    filter_id: filterId.value ? parseInt(filterId.value) : null
                })
            });
            const data = await response.json();

            chatWindow.removeChild(typingDiv);
            appendMessage('ai', data.response);
        } catch (error) {
            console.error('Error in chat:', error);
            chatWindow.removeChild(typingDiv);
            appendMessage('ai', 'Lo siento, hubo un error al conectar con el servidor.');
        }
    }

    sendBtn.onclick = sendMessage;
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
