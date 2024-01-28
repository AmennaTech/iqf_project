document.addEventListener('DOMContentLoaded', () => {
    const inputCustomId = document.getElementById('custom_id');
    const form = document.getElementById('confirmation-form');
    const fullNameSpan = document.getElementById('full-name');
    const cpfSpan = document.getElementById('cpf');
    const emailSpan = document.getElementById('email');

    // Função para buscar as informações do participante
    function fetchParticipantInfo(customId) {
        fetch(`/iqf_event/confirm_presence/?custom_id=${customId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                fullNameSpan.textContent = data.full_name || 'Não encontrado';
                cpfSpan.textContent = data.cpf || 'Não encontrado';
                emailSpan.textContent = data.email || 'Não encontrado';
                inputCustomId.value = customId; // Preenche o campo custom_id com o valor buscado
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    // Evento que lida com a alteração do custom_id
    inputCustomId.addEventListener('input', () => {
        const customId = inputCustomId.value;
        if (customId.match(/^\d{6}$/)) {  // Verifica se o custom_id possui 6 dígitos
            fetchParticipantInfo(customId);
        } else {
            // Limpa os campos se o custom_id não é válido ou está incompleto
            fullNameSpan.textContent = '';
            cpfSpan.textContent = '';
            emailSpan.textContent = '';
        }
    });

    // Evento que lida com a submissão do formulário
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('/iqf_event/confirm_presence/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Inclua o CSRF token se necessário
                },
                body: JSON.stringify({ custom_id: inputCustomId.value }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            alert(result.message);  // Exibe uma mensagem de sucesso
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Inicialização e configuração do scanner de QR Code
    function onScanSuccess(decodedText, decodedResult) {
        console.log(`Code scanned = ${decodedText}`, decodedResult);
        document.getElementById('custom_id').value = decodedText;
        fetchParticipantInfo(decodedText); // Atualiza a página com os detalhes do participante
    }

    let html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader", { fps: 60, qrbox: 500 });
    html5QrcodeScanner.render(onScanSuccess);
});
