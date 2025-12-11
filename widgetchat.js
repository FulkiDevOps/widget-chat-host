(function () {
    const API_BASE_URL = "https://fulkito-protego-api.hf.space";
    //const API_BASE_URL = "http://localhost:8000/"
    let isOpen = false;
    let sessionId = Math.random().toString(36).substring(7);
    let isLoading = false;
    let messages = [
        { text: "Hola, soy el Agente AI de Protego. ¿En qué puedo ayudarte?", sender: "bot" }
    ];

    // Crear botón flotante
    const launcher = document.createElement("div");
    launcher.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 70px;
        height: 70px;
        background: #007bff;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        z-index: 9999;
    `;
    launcher.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/724/724715.png" style="width:40px;height:40px;filter:invert(1);" />`;
    document.body.appendChild(launcher);

    // Crear contenedor del chat
    const chat = document.createElement("div");
    chat.style.cssText = `
        display:none; /* OCULTO DESDE EL INICIO */
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        height: 500px;
        background: white;
        border-radius: 10px;
        border: 1px solid #ccc;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9998;
        overflow: hidden;
        font-family: Arial, sans-serif;
        flex-direction: column;
    `;

    chat.innerHTML = `
        <div style="background:#333;color:white;padding:10px;display:flex;justify-content:space-between;align-items:center;">
            <span>Asistente Virtual</span>
            <button id="closeChat" style="background:none;border:none;color:white;font-size:16px;cursor:pointer;">✕</button>
        </div>

        <div id="messagesArea" style="flex:1;padding:10px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;"></div>

        <div style="padding:10px;border-top:1px solid #eee;display:flex;">
            <input id="chatInput" placeholder="Escribe aquí..." style="flex:1;padding:8px;border:1px solid #ccc;border-radius:4px;" />
            <button id="sendBtn" style="margin-left:10px;padding:8px 15px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;">Enviar</button>
        </div>
    `;

    document.body.appendChild(chat);

    const $messages = chat.querySelector("#messagesArea");
    const $input = chat.querySelector("#chatInput");
    const $send = chat.querySelector("#sendBtn");
    const $close = chat.querySelector("#closeChat");

    function renderMessages() {
        $messages.innerHTML = "";

        messages.forEach(m => {
            const div = document.createElement("div");
            div.style.cssText = `
                max-width:85%;
                padding:8px 12px;
                border-radius:15px;
                line-height:1.4;
                ${m.sender === "user" ?
                "align-self:flex-end;background:#007bff;color:white;border-radius:15px 15px 0 15px;" :
                "align-self:flex-start;background:#f1f0f0;color:black;border-radius:15px 15px 15px 0;"}
            `;
            div.innerHTML = m.text;
            $messages.appendChild(div);
        });

        if (isLoading) {
            const loading = document.createElement("div");
            loading.style.cssText = "color:#888;font-style:italic;font-size:0.8rem;";
            loading.textContent = "Escribiendo...";
            $messages.appendChild(loading);
        }

        $messages.scrollTop = $messages.scrollHeight;
    }

    async function sendMessage() {
        if (!$input.value.trim() || isLoading) return;

        const text = $input.value;
        $input.value = "";

        messages.push({ text, sender: "user" });
        isLoading = true;
        renderMessages();

        try {
            const res = await fetch(`${API_BASE_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    texto: text,
                    session_id: sessionId
                })
            });

            const data = await res.json();

            messages.push({ text: data.respuesta_ia, sender: "bot" });

        } catch (err) {
            messages.push({ text: "Error al conectar con el servidor.", sender: "bot" });
        }

        isLoading = false;
        renderMessages();
    }

    launcher.onclick = () => {
        launcher.style.display = "none";
        chat.style.display = "flex";  // AHORA SE ABRE SOLO AQUÍ
        isOpen = true;
        renderMessages();
        setTimeout(() => $input.focus(), 100);
    };

    $close.onclick = () => {
        chat.style.display = "none";
        launcher.style.display = "flex";
        isOpen = false;
    };

    $send.onclick = sendMessage;

    $input.addEventListener("keypress", e => {
        if (e.key === "Enter") sendMessage();
    });

})();
