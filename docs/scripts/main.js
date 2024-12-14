function generateToken(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        token += characters[randomIndex];
    }
    return token;
}

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).textContent;
    const token = text.split('=')[1].trim().replace(/"/g, '');
    navigator.clipboard.writeText(token).then(() => {
        showToast('Texto copiado al portapapeles');
    }).catch(err => {
        console.error('Error al copiar el texto: ', err);
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('token-form');
    const tokenText = document.getElementById('token-text');
    const sessionText = document.getElementById('session-text');
    const secretKeyProdText = document.getElementById('secret-key-prod-text');
    const secretKeyText = document.getElementById('secret-key-text');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const token = generateToken(32); 
        const session = generateToken(32); 
        const secretKeyProd = generateToken(32); 
        const secretKey = generateToken(32); 

        tokenText.textContent = `TOKEN_SECRET = "${token}"`;
        sessionText.textContent = `SESSION_SECRET = "${session}"`;
        secretKeyProdText.textContent = `SECRET_KEY_PROD = "${secretKeyProd}"`;
        secretKeyText.textContent = `SECRET_KEY = "${secretKey}"`;

        // Mostrar los botones de copiar
        document.querySelectorAll('.copy-button').forEach(button => {
            button.style.display = 'inline-block';
        });
    });
});