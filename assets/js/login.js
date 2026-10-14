const form = document.getElementById('loginForm');

form.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(form);
  let valid = true;

  clearErrors(form);

  const email = data.get('email').trim();
  if (!email) {
    showError(form, 'email', 'Email is required.');
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError(form, 'email', 'Enter a valid email address.');
    valid = false;
  }

  const password = data.get('password');
  if (!password) {
    showError(form, 'password', 'Password is required.');
    valid = false;
  } else if (password.length < 8) {
    showError(form, 'password', 'Password must be at least 8 characters.');
    valid = false;
  }

  if (valid) {
    // No backend yet — simulate success
    window.location.href = 'index.html';
  }
});

/* Clear errors on input */
form.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', () => {
    input.classList.remove('invalid');
    const err = form.querySelector(`[data-error-for="${input.name}"]`);
    if (err) err.textContent = '';
  });
});

function showError(form, name, message) {
  const input = form.querySelector(`[name="${name}"]`);
  const error = form.querySelector(`[data-error-for="${name}"]`);
  if (input) input.classList.add('invalid');
  if (error) error.textContent = message;
}

function clearErrors(form) {
  form.querySelectorAll('.field-input').forEach(el => el.classList.remove('invalid'));
  form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}
