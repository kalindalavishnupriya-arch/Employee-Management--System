/**
 * Shared front-end validation utilities used across all forms.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,50}$/;
export const NAME_REGEX = /^[a-zA-Z\s'-]{2,50}$/;

/** Validate a login form. Returns { isValid, errors } */
export function validateLogin({ username, password }) {
  const errors = {};
  if (!username || !username.trim()) {
    errors.username = 'Username is required';
  } else if (!USERNAME_REGEX.test(username.trim())) {
    errors.username = 'Username must be 3–50 chars, letters/numbers/dots/underscores/hyphens only';
  }
  if (!password || !password.trim()) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

/** Validate a registration form. Returns { isValid, errors } */
export function validateRegister({ username, password, email, firstName, lastName }) {
  const errors = {};
  if (!firstName || !firstName.trim()) {
    errors.firstName = 'First name is required';
  } else if (!NAME_REGEX.test(firstName.trim())) {
    errors.firstName = 'First name must be 2–50 letters (no numbers or special chars)';
  }
  if (!lastName || !lastName.trim()) {
    errors.lastName = 'Last name is required';
  } else if (!NAME_REGEX.test(lastName.trim())) {
    errors.lastName = 'Last name must be 2–50 letters (no numbers or special chars)';
  }
  if (!email || !email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Please enter a valid email (e.g. user@example.com)';
  }
  if (!username || !username.trim()) {
    errors.username = 'Username is required';
  } else if (!USERNAME_REGEX.test(username.trim())) {
    errors.username = 'Username must be 3–50 chars, letters/numbers/dots/underscores/hyphens only';
  }
  if (!password || !password.trim()) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  } else if (password.length > 128) {
    errors.password = 'Password must not exceed 128 characters';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

/** Validate an employee form. Returns { isValid, errors } */
export function validateEmployee({ firstName, lastName, email, department }) {
  const errors = {};
  if (!firstName || !firstName.trim()) {
    errors.firstName = 'First name is required';
  } else if (!NAME_REGEX.test(firstName.trim())) {
    errors.firstName = 'First name must be 2–50 letters only';
  }
  if (!lastName || !lastName.trim()) {
    errors.lastName = 'Last name is required';
  } else if (!NAME_REGEX.test(lastName.trim())) {
    errors.lastName = 'Last name must be 2–50 letters only';
  }
  if (!email || !email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Please enter a valid email (e.g. user@example.com)';
  }
  if (!department || !department.trim()) {
    errors.department = 'Department is required';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

/** Validate a project form. Returns { isValid, errors } */
export function validateProject({ name, description, deadline }) {
  const errors = {};
  if (!name || !name.trim()) {
    errors.name = 'Project name is required';
  } else if (name.trim().length < 3) {
    errors.name = 'Project name must be at least 3 characters';
  } else if (name.trim().length > 120) {
    errors.name = 'Project name must not exceed 120 characters';
  }
  if (description && description.length > 1000) {
    errors.description = 'Description must not exceed 1000 characters';
  }
  if (deadline) {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(deadlineDate.getTime())) {
      errors.deadline = 'Please enter a valid deadline date';
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

/** Validate a task form. Returns { isValid, errors } */
export function validateTask({ title, description, progress, remarks, dueDate }) {
  const errors = {};
  if (!title || !title.trim()) {
    errors.title = 'Task title is required';
  } else if (title.trim().length < 3) {
    errors.title = 'Task title must be at least 3 characters';
  } else if (title.trim().length > 150) {
    errors.title = 'Task title must not exceed 150 characters';
  }
  if (description && description.length > 1000) {
    errors.description = 'Description must not exceed 1000 characters';
  }
  if (remarks && remarks.length > 500) {
    errors.remarks = 'Remarks must not exceed 500 characters';
  }
  if (progress !== undefined && progress !== null && progress !== '') {
    const p = Number(progress);
    if (isNaN(p) || p < 0 || p > 100) {
      errors.progress = 'Progress must be between 0 and 100';
    }
  }
  if (dueDate) {
    const d = new Date(dueDate);
    if (isNaN(d.getTime())) {
      errors.dueDate = 'Please enter a valid due date';
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

/** Extract backend field errors from axios error response */
export function extractApiErrors(err) {
  if (err?.response?.data?.fieldErrors) {
    return err.response.data.fieldErrors; // { field: message }
  }
  if (err?.response?.data?.message) {
    return { _general: err.response.data.message };
  }
  return { _general: 'An error occurred. Please try again.' };
}
