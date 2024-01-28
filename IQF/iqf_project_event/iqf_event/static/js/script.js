const urlApi = 'register/';  // Use a URL completa

// Função para aplicar a máscara de CPF
function applyCpfMask(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
}

// Função para validar CPF
function validateCpf(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++)
        soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++)
        soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    const loadingDiv = document.getElementById('loading');
    const qrCodeContainer = document.getElementById('qr-code-container');
    const qrCodeImage = document.getElementById('qr-code');
    const cpfInput = document.getElementById('cpf');

    // Aplicar máscara de CPF ao digitar
    cpfInput.addEventListener('input', function (e) {
        e.target.value = applyCpfMask(e.target.value);
    });

    // Evento de envio do formulário
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validar CPF antes de enviar
        const cpf = data.cpf.replace(/[^\d]/g, '');
        if (!validateCpf(cpf)) {
            alert('Por favor, insira um CPF válido.');
            return;
        }

        // Mostrar indicador de carregamento
        loadingDiv.style.display = 'block';

        try {
            const response = await fetch(urlApi, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Incluir CSRF token se necessário
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            // Atualizar a interface do usuário após o sucesso da inscrição
            const titleElement = document.querySelector('#registration .title');
            const messageElement = document.querySelector('#registration .message');
            titleElement.textContent = 'Inscrição Concluída';
            messageElement.textContent = 'Você receberá um e-mail com o QR Code e informações sobre data e local do evento. Muito obrigado!';
            
            // Definir o src da imagem do QR Code
            qrCodeImage.src = result.qr_code_url;
            qrCodeContainer.style.display = 'block';
            form.style.display = 'none';
            loadingDiv.style.display = 'none';
            
            // Configurar o botão de download do QR Code
            const downloadButton = document.getElementById('download-qr');
            downloadButton.addEventListener('click', () => {
                const downloadLink = document.createElement('a');
                downloadLink.href = qrCodeImage.src;
                downloadLink.download = 'qr_code.png';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            });

        } catch (error) {
            console.error('Error:', error);
            loadingDiv.style.display = 'none';
        }
    });
});


function toggleAgendaDetail(id) {
    var content = document.getElementById(id);
    var header = content.previousElementSibling; // Pega o cabeçalho do card
    var detailsDisplayed = content.style.display === 'block';
    // Hide all open details first
    document.querySelectorAll('.card-content').forEach(function(detail) {
        detail.style.display = 'none';
        detail.previousElementSibling.classList.remove('active'); // Remove 'active' dos outros cabeçalhos
    });
    // Then, toggle the clicked one if it was not already displayed
    if (!detailsDisplayed) {
        content.style.display = 'block';
        header.classList.add('active'); // Adiciona 'active' ao cabeçalho clicado
    } else {
        header.classList.remove('active'); // Remove 'active' se estiver fechando
    }
}
