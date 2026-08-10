export const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
export const validatePhone = (num) => /^[0-9]{10,11}$/.test(num);
export const validateRequired = (value) => value && value.trim() !== "";