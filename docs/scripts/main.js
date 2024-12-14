function generateToken(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        token += characters[randomIndex];
    }
    return token;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('token-form');
    const tokenDisplay = document.getElementById('token-display');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const token = generateToken(32); // Genera un token de 32 caracteres
        tokenDisplay.textContent = `TOKEN_SECRET = "${token}"`;
    });
});