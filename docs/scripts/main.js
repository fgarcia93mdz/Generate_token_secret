// ── Utilidades criptográficas ─────────────────────────────────────────────
function cryptoRand(max) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
}

// ── Generador de tokens (usa crypto para mayor seguridad) ─────────────────
function generateToken(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => characters[b % characters.length]).join('');
}

// ── Perfiles de plataformas ───────────────────────────────────────────────
const PLATFORM_PRESETS = {
    windows: {
        name: 'PC / Windows',
        length: 14, minLength: 8, maxLength: 64,
        upper: true, lower: true, numbers: true, special: true,
        specialChars: '!@#$%^&*()_-+=[]{}|;:,.?',
        info: 'Windows requiere mín. 8 caracteres con al menos 3 de estos 4 tipos: mayúsculas, minúsculas, números y símbolos. La contraseña no puede contener el nombre de usuario ni partes del nombre completo.'
    },
    outlook: {
        name: 'Outlook / Microsoft 365',
        length: 16, minLength: 8, maxLength: 64,
        upper: true, lower: true, numbers: true, special: true,
        specialChars: '!@#$%^&*()_-+=[]{}|;:,.?',
        info: 'Azure AD / M365 requiere mín. 8 caracteres con al menos 3 de los 4 tipos (mayúsculas, minúsculas, números, símbolos). Se evitan < > y " para máxima compatibilidad con formularios web.'
    },
    odoo: {
        name: 'Odoo',
        length: 12, minLength: 8, maxLength: 64,
        upper: true, lower: true, numbers: true, special: true,
        specialChars: '!@#$%&*()_-+=',
        info: 'Odoo recomienda mín. 8 caracteres. El módulo de política de contraseñas puede exigir mayúsculas, minúsculas, números y símbolos. Se usa un conjunto seguro de especiales para evitar conflictos con el ORM y el XML-RPC.'
    },
    bitrix: {
        name: 'Bitrix24',
        length: 12, minLength: 6, maxLength: 64,
        upper: true, lower: true, numbers: true, special: true,
        specialChars: '!@#$%^&*()_-+=[]{}',
        info: 'Bitrix24 admite desde 6 caracteres, pero se recomienda 8 o más. La política de administrador puede exigir letras, números y símbolos. Compatible con acceso vía REST API y Single Sign-On.'
    },
    universal: {
        name: 'Universal',
        length: 16, minLength: 8, maxLength: 64,
        upper: true, lower: true, numbers: true, special: true,
        specialChars: '!@#$%^&*()_-+=',
        info: 'Contraseña compatible con la mayoría de plataformas: Outlook, Odoo, Bitrix24, SAP, Salesforce, WordPress, etc. Usa caracteres seguros aceptados universalmente.'
    }
};

let currentPreset = PLATFORM_PRESETS.universal;

// ── Generador de contraseñas ──────────────────────────────────────────────
function generatePassword(length, useUpper, useLower, useNumbers, useSpecial, specialChars) {
    const lower   = 'abcdefghijklmnopqrstuvwxyz';
    const upper   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    let charset = '';
    const requiredSets = [];

    if (useLower)                    { charset += lower;       requiredSets.push(lower); }
    if (useUpper)                    { charset += upper;       requiredSets.push(upper); }
    if (useNumbers)                  { charset += numbers;     requiredSets.push(numbers); }
    if (useSpecial && specialChars)  { charset += specialChars; requiredSets.push(specialChars); }

    if (!charset) return '';

    // Garantizar al menos un carácter de cada tipo activado
    const pwd = requiredSets.map(set => set[cryptoRand(set.length)]);

    // Completar hasta la longitud deseada
    while (pwd.length < length) {
        pwd.push(charset[cryptoRand(charset.length)]);
    }

    // Mezclar con Fisher-Yates usando crypto
    for (let i = pwd.length - 1; i > 0; i--) {
        const j = cryptoRand(i + 1);
        [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
    }

    return pwd.join('');
}

// ── Medidor de fortaleza ──────────────────────────────────────────────────
function calculateStrength(password) {
    let score = 0;
    if (password.length >= 8)  score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (password.length >= 20) score += 1;
    if (/[a-z]/.test(password))        score += 1;
    if (/[A-Z]/.test(password))        score += 1;
    if (/[0-9]/.test(password))        score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 2;
    if (password.length < 8) score = Math.min(score, 1);

    if (score <= 2) return { pct: 20,  label: 'Muy débil', color: '#dc3545' };
    if (score <= 4) return { pct: 40,  label: 'Débil',     color: '#fd7e14' };
    if (score <= 6) return { pct: 60,  label: 'Media',     color: '#ffc107' };
    if (score <= 8) return { pct: 80,  label: 'Fuerte',    color: '#28a745' };
    return               { pct: 100, label: 'Muy fuerte', color: '#20c997' };
}

// ── Copiar al portapapeles ────────────────────────────────────────────────
function copyToClipboard(elementId) {
    const text  = document.getElementById(elementId).textContent;
    const token = text.split('=')[1].trim().replace(/"/g, '');
    navigator.clipboard.writeText(token)
        .then(() => showToast('Copiado al portapapeles'))
        .catch(err => console.error('Error al copiar:', err));
}

function copyPassword() {
    const text = document.getElementById('pwd-text').textContent;
    navigator.clipboard.writeText(text)
        .then(() => showToast('Contraseña copiada al portapapeles'))
        .catch(err => console.error('Error al copiar:', err));
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Aplicar preset de plataforma ──────────────────────────────────────────
function applyPreset(presetKey) {
    currentPreset = PLATFORM_PRESETS[presetKey];
    const slider = document.getElementById('pwd-length');
    const sliderMax = Math.min(currentPreset.maxLength, 64);

    slider.min   = currentPreset.minLength;
    slider.max   = sliderMax;
    slider.value = currentPreset.length;
    document.getElementById('length-display').textContent = currentPreset.length;

    document.getElementById('opt-upper').checked   = currentPreset.upper;
    document.getElementById('opt-lower').checked   = currentPreset.lower;
    document.getElementById('opt-numbers').checked = currentPreset.numbers;
    document.getElementById('opt-special').checked = currentPreset.special;
    document.getElementById('preset-info').textContent = currentPreset.info;

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === presetKey);
    });
}

// ── DOMContentLoaded ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // —— Tabs ——
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });

    // —— Formulario de tokens ——
    document.getElementById('token-form').addEventListener('submit', (event) => {
        event.preventDefault();
        document.getElementById('token-text').textContent           = `TOKEN_SECRET = "${generateToken(32)}"`;
        document.getElementById('session-text').textContent         = `SESSION_SECRET = "${generateToken(32)}"`;
        document.getElementById('secret-key-prod-text').textContent = `SECRET_KEY_PROD = "${generateToken(32)}"`;
        document.getElementById('secret-key-text').textContent      = `SECRET_KEY = "${generateToken(32)}"`;
        document.querySelectorAll('#tab-tokens .copy-button').forEach(btn => {
            btn.style.display = 'inline-block';
        });
    });

    // —— Botones de preset ——
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });

    // —— Slider de longitud ——
    document.getElementById('pwd-length').addEventListener('input', function () {
        document.getElementById('length-display').textContent = this.value;
    });

    // —— Generar contraseña ——
    document.getElementById('generate-pwd-btn').addEventListener('click', () => {
        const length     = parseInt(document.getElementById('pwd-length').value);
        const useUpper   = document.getElementById('opt-upper').checked;
        const useLower   = document.getElementById('opt-lower').checked;
        const useNumbers = document.getElementById('opt-numbers').checked;
        const useSpecial = document.getElementById('opt-special').checked;

        const pwd = generatePassword(length, useUpper, useLower, useNumbers, useSpecial, currentPreset.specialChars);

        if (!pwd) {
            showToast('Selecciona al menos un tipo de carácter');
            return;
        }

        document.getElementById('pwd-text').textContent = pwd;

        const strength = calculateStrength(pwd);
        document.getElementById('strength-fill').style.width      = strength.pct + '%';
        document.getElementById('strength-fill').style.background = strength.color;
        document.getElementById('strength-label').textContent     = strength.label;
        document.getElementById('strength-label').style.color     = strength.color;

        document.getElementById('pwd-result').style.display = 'block';
    });

    // Inicializar con el preset universal
    applyPreset('universal');
});