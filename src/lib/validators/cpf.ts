/**
 * CPF Validator and Formatter
 * Brazilian Individual Taxpayer Registration
 */

/**
 * Validates a CPF number
 * @param cpf - CPF string (can be formatted or unformatted)
 * @returns true if valid, false otherwise
 */
export function validateCPF(cpf: string): boolean {
    // Remove non-digits
    const cleanCPF = cpf.replace(/\D/g, '');

    // Must have exactly 11 digits
    if (cleanCPF.length !== 11) {
        return false;
    }

    // Check for known invalid CPFs (all same digits)
    const invalidCPFs = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999',
    ];

    if (invalidCPFs.includes(cleanCPF)) {
        return false;
    }

    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
        remainder = 0;
    }
    if (remainder !== parseInt(cleanCPF.charAt(9))) {
        return false;
    }

    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
        remainder = 0;
    }
    if (remainder !== parseInt(cleanCPF.charAt(10))) {
        return false;
    }

    return true;
}

/**
 * Formats a CPF to the standard Brazilian format
 * @param cpf - CPF string (unformatted or partially formatted)
 * @returns Formatted CPF (000.000.000-00) or the original string if invalid
 */
export function formatCPF(cpf: string): string {
    // Remove non-digits
    const cleanCPF = cpf.replace(/\D/g, '');

    // Apply format mask
    if (cleanCPF.length <= 3) {
        return cleanCPF;
    } else if (cleanCPF.length <= 6) {
        return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3)}`;
    } else if (cleanCPF.length <= 9) {
        return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6)}`;
    } else {
        return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6, 9)}-${cleanCPF.slice(9, 11)}`;
    }
}

/**
 * Removes formatting from a CPF
 * @param cpf - Formatted CPF string
 * @returns Unformatted CPF (only digits)
 */
export function unformatCPF(cpf: string): string {
    return cpf.replace(/\D/g, '');
}

/**
 * Masks a CPF for privacy (e.g., ***.***.***-00)
 * @param cpf - CPF string
 * @param showLast - Number of digits to show at the end (default: 2)
 * @returns Masked CPF
 */
export function maskCPF(cpf: string, showLast: number = 2): string {
    const cleanCPF = cpf.replace(/\D/g, '');

    if (cleanCPF.length !== 11) {
        return cpf;
    }

    const visiblePart = cleanCPF.slice(-showLast);
    const maskedPart = '*'.repeat(11 - showLast);

    // Format the masked CPF
    const full = maskedPart + visiblePart;
    return `${full.slice(0, 3)}.${full.slice(3, 6)}.${full.slice(6, 9)}-${full.slice(9, 11)}`;
}

/**
 * Validates and formats CPF in one step
 * @param cpf - CPF string
 * @returns Object with validation result and formatted CPF
 */
export function processedCPF(cpf: string): {
    valid: boolean;
    formatted: string;
    unformatted: string;
    masked: string;
} {
    const unformatted = unformatCPF(cpf);
    const valid = validateCPF(cpf);

    return {
        valid,
        formatted: valid ? formatCPF(cpf) : cpf,
        unformatted,
        masked: valid ? maskCPF(cpf) : cpf,
    };
}

/**
 * CPF input mask handler for real-time formatting
 * Use with onChange event
 * @param value - Current input value
 * @returns Formatted value for display
 */
export function handleCPFInput(value: string): string {
    // Remove non-digits
    let digits = value.replace(/\D/g, '');

    // Limit to 11 digits
    digits = digits.slice(0, 11);

    // Apply progressive formatting
    return formatCPF(digits);
}

/**
 * Generates a random valid CPF (for testing purposes)
 * @returns A valid CPF string (formatted)
 */
export function generateRandomCPF(): string {
    const randomDigits = Array.from({ length: 9 }, () =>
        Math.floor(Math.random() * 10)
    );

    // Calculate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += randomDigits[i] * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    const digit1 = remainder === 10 || remainder === 11 ? 0 : remainder;

    // Calculate second check digit
    sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += randomDigits[i] * (11 - i);
    }
    sum += digit1 * 2;
    remainder = (sum * 10) % 11;
    const digit2 = remainder === 10 || remainder === 11 ? 0 : remainder;

    const cpf = [...randomDigits, digit1, digit2].join('');
    return formatCPF(cpf);
}
