/**
 * Utilidades de validación para formularios
 * Específicamente adaptadas para clientes institucionales en Colombia
 */

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): { isValid: boolean; message: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        return { isValid: false, message: 'El correo electrónico es obligatorio' };
    }

    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'Por favor ingresa un correo electrónico válido' };
    }

    return { isValid: true, message: '' };
};

/**
 * Valida NIT colombiano
 * Formato: 9 dígitos + dígito verificador (opcional)
 */
export const validateNIT = (nit: string): { isValid: boolean; message: string } => {
    if (!nit) {
        return { isValid: false, message: 'El NIT es obligatorio' };
    }

    // Remover espacios y guiones
    const cleanNit = nit.replace(/[\s-]/g, '');

    // Validar que solo contenga números
    if (!/^\d+$/.test(cleanNit)) {
        return { isValid: false, message: 'El NIT solo debe contener números' };
    }

    // Validar longitud (9-10 dígitos)
    if (cleanNit.length < 9 || cleanNit.length > 10) {
        return { isValid: false, message: 'El NIT debe tener entre 9 y 10 dígitos' };
    }

    return { isValid: true, message: 'NIT válido' };
};

/**
 * Valida fortaleza de contraseña
 */
export const validatePassword = (password: string): {
    isValid: boolean;
    message: string;
    strength: 'weak' | 'medium' | 'strong'
} => {
    if (!password) {
        return { isValid: false, message: 'La contraseña es obligatoria', strength: 'weak' };
    }

    if (password.length < 8) {
        return {
            isValid: false,
            message: 'La contraseña debe tener al menos 8 caracteres',
            strength: 'weak'
        };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(password);

    const criteriaMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

    // El servicio requiere que se cumplan TODOS los criterios
    if (criteriaMet < 4) {
        const missing = [];
        if (!hasUpperCase) missing.push('mayúsculas');
        if (!hasLowerCase) missing.push('minúsculas');
        if (!hasNumbers) missing.push('números');
        if (!hasSpecialChar) missing.push('símbolos especiales');
        
        return {
            isValid: false,
            message: `Debe incluir: ${missing.join(', ')}`,
            strength: criteriaMet < 2 ? 'weak' : 'medium'
        };
    }

    if (criteriaMet < 3) {
        return {
            isValid: true,
            message: 'Contraseña aceptable',
            strength: 'medium'
        };
    }

    return {
        isValid: true,
        message: 'Contraseña segura',
        strength: 'strong'
    };
};

/**
 * Valida nombre completo
 */
export const validateFullName = (name: string): { isValid: boolean; message: string } => {
    if (!name) {
        return { isValid: false, message: 'El nombre completo es obligatorio' };
    }

    if (name.trim().length < 3) {
        return { isValid: false, message: 'El nombre debe tener al menos 3 caracteres' };
    }

    // Validar que contenga al menos 2 palabras (nombre y apellido)
    const words = name.trim().split(/\s+/);
    if (words.length < 2) {
        return { isValid: false, message: 'Ingresa nombre y apellido' };
    }

    // Validar que solo contenga letras y espacios
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
        return { isValid: false, message: 'El nombre solo puede contener letras' };
    }

    return { isValid: true, message: 'Nombre válido' };
};

/**
 * Valida todo el formulario
 * Mantiene compatibilidad con el campo 'username' para el frontend
 * pero mapea internamente a 'nombre' para la API
 */
export const validateForm = (form: {
    username: string;
    email: string;
    nit: string;
    password: string;
}) => {
    const validations = {
        username: validateFullName(form.username),
        email: validateEmail(form.email),
        nit: validateNIT(form.nit),
        password: validatePassword(form.password),
    };

    const isFormValid = Object.values(validations).every(validation => validation.isValid);

    return {
        isValid: isFormValid,
        validations,
    };
};

/**
 * Convierte los datos del formulario al formato esperado por la API
 */
export const mapFormToApiData = (form: {
    username: string;
    email: string;
    nit: string;
    password: string;
}) => {
    return {
        nombre: form.username, // Mapear username -> nombre
        email: form.email,
        nit: form.nit,
        password: form.password,
    };
};