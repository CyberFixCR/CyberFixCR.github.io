const config = window.CYBERFIX_SUPABASE_CONFIG;
const setupNotice = document.getElementById('setup-notice');
const authPanel = document.getElementById('auth-panel');
const recoveryPanel = document.getElementById('recovery-panel');
const dashboard = document.getElementById('dashboard');
const authForm = document.getElementById('auth-form');
const requestForm = document.getElementById('request-form');
const recoveryForm = document.getElementById('recovery-form');
const authStatus = document.getElementById('auth-status');
const requestStatus = document.getElementById('request-status');
const requestsStatus = document.getElementById('requests-status');
const requestList = document.getElementById('request-list');
const nameField = document.getElementById('name-field');
const consentField = document.getElementById('consent-field');
const authSubmit = document.getElementById('auth-submit');
const toggleAuthButton = document.getElementById('toggle-auth');
const resetPasswordButton = document.getElementById('reset-password');

document.getElementById('portal-year').textContent = new Date().getFullYear();

function setStatus(element, message, type = '') {
  element.textContent = message;
  element.className = `portal-status${type ? ` ${type}` : ''}`;
}

function setFieldsDisabled(disabled) {
  document.querySelectorAll('#auth-form input, #auth-form button, #recovery-form input, #recovery-form button, #request-form input, #request-form select, #request-form textarea, #request-form button, #reset-password, #toggle-auth, #sign-out').forEach(element => {
    element.disabled = disabled;
  });
}

if (!config || !config.url || !config.anonKey) {
  setupNotice.textContent = 'Configuración pendiente: creá un proyecto Supabase, agregá su URL y clave publicable en supabase-config.js y ejecutá supabase-schema.sql en el SQL Editor. Mientras tanto, no es posible crear cuentas ni enviar solicitudes.';
  setFieldsDisabled(true);
} else {
  initializePortal().catch(error => {
    console.error('No se pudo iniciar el portal CyberFixCR.', error);
    setupNotice.textContent = 'No se pudo conectar con el servicio de cuentas. Revisá la configuración del proyecto Supabase y recargá la página.';
    setFieldsDisabled(true);
  });
}

async function initializePortal() {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const supabase = createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  let authMode = 'login';
  let currentSession = null;

  function setAuthMode(mode) {
    authMode = mode;
    const signingUp = mode === 'signup';
    nameField.hidden = !signingUp;
    nameField.querySelector('input').required = signingUp;
    consentField.hidden = !signingUp;
    consentField.querySelector('input').required = signingUp;
    authForm.elements.password.autocomplete = signingUp ? 'new-password' : 'current-password';
    document.getElementById('auth-title').textContent = signingUp ? 'Crear cuenta' : 'Iniciá sesión';
    document.getElementById('auth-description').textContent = signingUp
      ? 'Te enviaremos un correo para confirmar tu dirección.'
      : 'Usá tu correo y contraseña para ver tus solicitudes.';
    authSubmit.textContent = signingUp ? 'Crear cuenta' : 'Iniciar sesión';
    toggleAuthButton.textContent = signingUp ? '¿Ya tenés cuenta? Iniciar sesión' : '¿Primera vez? Crear cuenta';
    setStatus(authStatus, '');
  }

  function showSession(session) {
    currentSession = session;
    const signedIn = Boolean(session);
    authPanel.hidden = signedIn;
    dashboard.hidden = !signedIn;
    setupNotice.hidden = true;
    if (!signedIn) return;

    const user = session.user;
    const displayName = user.user_metadata?.full_name || user.email || 'cliente';
    document.getElementById('customer-name').textContent = displayName;
    document.getElementById('customer-email').textContent = user.email || '';
    loadRequests();
  }

  async function loadRequests() {
    requestList.replaceChildren();
    const loading = document.createElement('p');
    loading.className = 'empty-requests';
    loading.textContent = 'Cargando tus solicitudes…';
    requestList.append(loading);

    let data;
    let error;
    try {
      ({ data, error } = await supabase
        .from('service_requests')
        .select('id, service, message, status, created_at')
        .order('created_at', { ascending: false }));
    } catch (requestError) {
      console.error('No se pudieron cargar las solicitudes.', requestError);
      requestList.replaceChildren();
      setStatus(requestsStatus, 'No pudimos cargar tus solicitudes. Revisá la conexión o intentá de nuevo.', 'error');
      return;
    }

    if (error) {
      console.error('No se pudieron cargar las solicitudes.', error);
      requestList.replaceChildren();
      setStatus(requestsStatus, 'No pudimos cargar tus solicitudes. Revisá la conexión o intentá de nuevo.', 'error');
      return;
    }

    setStatus(requestsStatus, '');
    if (!data.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-requests';
      empty.textContent = 'Todavía no tenés solicitudes. Podés enviar una desde el formulario.';
      requestList.replaceChildren(empty);
      return;
    }

    const statusLabels = {
      received: 'Recibida',
      reviewing: 'En revisión',
      in_progress: 'En proceso',
      completed: 'Completada',
      cancelled: 'Cerrada'
    };
    const formatter = new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium' });
    const fragment = document.createDocumentFragment();
    data.forEach(item => {
      const article = document.createElement('article');
      article.className = 'request-item';
      const header = document.createElement('div');
      header.className = 'request-item-head';
      const title = document.createElement('h3');
      title.textContent = item.service;
      const date = document.createElement('time');
      date.dateTime = item.created_at;
      date.textContent = formatter.format(new Date(item.created_at));
      const status = document.createElement('span');
      status.className = 'request-status';
      status.textContent = statusLabels[item.status] || 'Estado actualizado';
      const message = document.createElement('p');
      message.textContent = item.message;
      header.append(title, date);
      article.append(header, status, message);
      fragment.append(article);
    });
    requestList.replaceChildren(fragment);
  }

  toggleAuthButton.addEventListener('click', () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
  });

  authForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!authForm.reportValidity()) return;
    setFieldsDisabled(true);
    setStatus(authStatus, authMode === 'signup' ? 'Creando tu cuenta…' : 'Iniciando sesión…');
    const email = authForm.elements.email.value.trim().toLowerCase();
    const password = authForm.elements.password.value;
    let result;

    try {
      if (authMode === 'signup') {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: authForm.elements.name.value.trim() },
            emailRedirectTo: new URL('portal.html', window.location.href).href
          }
        });
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }
    } catch (error) {
      console.error('Error de autenticación.', error);
      setFieldsDisabled(false);
      setStatus(authStatus, 'No se pudo conectar con el servicio de cuentas. Intentá de nuevo.', 'error');
      return;
    }

    setFieldsDisabled(false);
    if (result.error) {
      console.error('Error de autenticación.', result.error);
      setStatus(authStatus, 'No se pudo completar la operación. Verificá los datos y la configuración del proyecto.', 'error');
      return;
    }

    if (authMode === 'signup' && !result.data.session) {
      authForm.reset();
      setStatus(authStatus, 'Cuenta creada. Revisá tu correo y confirmá la dirección antes de iniciar sesión.', 'success');
      return;
    }
    if (result.data.session) showSession(result.data.session);
  });

  resetPasswordButton.addEventListener('click', async () => {
    const email = authForm.elements.email.value.trim().toLowerCase();
    if (!email || !authForm.elements.email.checkValidity()) {
      setStatus(authStatus, 'Escribí primero un correo válido para enviarte el enlace de recuperación.', 'error');
      authForm.elements.email.focus();
      return;
    }
    resetPasswordButton.disabled = true;
    let error;
    try {
      ({ error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: new URL('portal.html', window.location.href).href
      }));
    } catch (resetError) {
      console.error('No se pudo iniciar la recuperación de contraseña.', resetError);
      resetPasswordButton.disabled = false;
      setStatus(authStatus, 'No se pudo conectar para enviar el correo. Intentá de nuevo.', 'error');
      return;
    }
    resetPasswordButton.disabled = false;
    if (error) {
      console.error('No se pudo iniciar la recuperación de contraseña.', error);
      setStatus(authStatus, 'No se pudo enviar el correo. Revisá el email y la configuración del proveedor.', 'error');
      return;
    }
    setStatus(authStatus, 'Si el correo está registrado, recibirás un enlace para cambiar tu contraseña.', 'success');
  });

  recoveryForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!recoveryForm.reportValidity()) return;
    const submit = recoveryForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    setStatus(document.getElementById('recovery-status'), 'Actualizando contraseña…');
    let error;
    try {
      ({ error } = await supabase.auth.updateUser({ password: recoveryForm.elements.password.value }));
    } catch (updateError) {
      console.error('No se pudo actualizar la contraseña.', updateError);
      submit.disabled = false;
      setStatus(document.getElementById('recovery-status'), 'No se pudo conectar para actualizar la contraseña. Intentá de nuevo.', 'error');
      return;
    }
    submit.disabled = false;
    if (error) {
      console.error('No se pudo actualizar la contraseña.', error);
      setStatus(document.getElementById('recovery-status'), 'No se pudo actualizar la contraseña. Solicitá un nuevo enlace e intentá otra vez.', 'error');
      return;
    }
    recoveryForm.reset();
    recoveryPanel.hidden = true;
    const { data } = await supabase.auth.getSession();
    showSession(data.session);
    if (data.session) {
      setStatus(requestStatus, 'Contraseña actualizada correctamente.', 'success');
    } else {
      setStatus(authStatus, 'Contraseña actualizada. Ya podés iniciar sesión.', 'success');
      authPanel.hidden = false;
    }
  });

  requestForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!currentSession || !requestForm.reportValidity()) return;
    const submit = requestForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    setStatus(requestStatus, 'Enviando consulta…');
    let error;
    try {
      ({ error } = await supabase.from('service_requests').insert({
        user_id: currentSession.user.id,
        service: requestForm.elements.service.value,
        message: requestForm.elements.message.value.trim()
      }));
    } catch (requestError) {
      console.error('No se pudo guardar la solicitud.', requestError);
      submit.disabled = false;
      setStatus(requestStatus, 'No se pudo conectar para enviar. Revisá la conexión e intentá de nuevo.', 'error');
      return;
    }
    submit.disabled = false;
    if (error) {
      console.error('No se pudo guardar la solicitud.', error);
      setStatus(requestStatus, 'No se pudo enviar. Revisá la conexión e intentá de nuevo.', 'error');
      return;
    }
    requestForm.reset();
    setStatus(requestStatus, 'Consulta enviada. Podés revisar su estado en esta página.', 'success');
    await loadRequests();
  });

  document.getElementById('sign-out').addEventListener('click', async () => {
    let error;
    try {
      ({ error } = await supabase.auth.signOut());
    } catch (signOutError) {
      console.error('No se pudo cerrar la sesión.', signOutError);
      setStatus(requestsStatus, 'No se pudo conectar para cerrar la sesión. Intentá de nuevo.', 'error');
      return;
    }
    if (error) {
      console.error('No se pudo cerrar la sesión.', error);
      setStatus(requestsStatus, 'No se pudo cerrar la sesión. Intentá de nuevo.', 'error');
      return;
    }
    showSession(null);
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      dashboard.hidden = true;
      authPanel.hidden = true;
      recoveryPanel.hidden = false;
      setupNotice.hidden = true;
      return;
    }
    if (event === 'SIGNED_OUT' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
      showSession(session);
    }
  });

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  showSession(data.session);
  setFieldsDisabled(false);
}
