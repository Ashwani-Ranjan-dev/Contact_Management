// Email validation
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Indian mobile number validation
export const isValidPhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

// Validate and normalize contact data
export const validateContactData = (data) => {
    const name = String(data.name ?? "").trim();
    const email = String(data.email ?? "").trim().toLowerCase();
    const phone = String(data.phone ?? "").trim();
    const address = String(data.address ?? "").trim();
    const company = String(data.company ?? "").trim();

    if (!name || !email || !phone) {
        return {
            valid: false,
            message: "Name, email and phone number are required."
        };
    }

    if (name.length > 100) {
        return { valid: false, message: "Name cannot exceed 100 characters." };
    }

    if (email.length > 254 || !isValidEmail(email)) {
        return { valid: false, message: "Please enter a valid email address." };
    }

    if (!isValidPhone(phone)) {
        return {
            valid: false,
            message: "Please enter a valid 10-digit Indian mobile number."
        };
    }

    if (address.length > 300) {
        return { valid: false, message: "Address cannot exceed 300 characters." };
    }

    if (company.length > 100) {
        return { valid: false, message: "Company cannot exceed 100 characters." };
    }

    return {
        valid: true,
        data: { name, email, phone, address, company }
    };
};