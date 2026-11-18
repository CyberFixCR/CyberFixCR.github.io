# CyberFixCR — sitio web inicial

Sitio empresarial estático creado con HTML, CSS y JavaScript. No requiere frameworks ni proceso de compilación.

Publicado en GitHub Pages: https://cyberfixcr.github.io/

## Archivos
- `index.html`: estructura y contenido.
- `styles.css`: diseño adaptable, animaciones y estilos.
- `script.js`: menú móvil, navegación, preguntas frecuentes, formulario demostrativo y diálogos legales.
- `portal.html`, `portal.css`, `portal.js`: acceso de clientes y seguimiento de solicitudes.
- `supabase-config.js`: URL y clave publicable del proyecto Supabase (vacías hasta configurarlo).
- `supabase-schema.sql`: tabla de solicitudes y políticas de acceso por usuario (RLS).
- `github-invertocat.svg`: símbolo blanco oficial de GitHub, usado en la intro; descargado sin modificar del [paquete de logos](https://brand.github.com/GitHub_Logos.zip).
- `favicon.svg`: icono de la marca.

## Probar localmente
1. Descargá y descomprimí el ZIP.
2. Abrí `index.html` en un navegador.
3. Para una prueba más fiel, usá la extensión Live Server de Visual Studio Code.

## Publicar con GitHub Pages
1. Creá un repositorio público llamado `cyberfixcr` en GitHub.
2. Subí todos los archivos de esta carpeta a la raíz del repositorio.
3. En el repositorio abrí **Settings → Pages**.
4. En **Build and deployment**, elegí **Deploy from a branch**.
5. Seleccioná `main` y `/ (root)`, luego **Save**.
6. Esperá a que GitHub Pages publique el sitio. La dirección temporal será `https://TU-USUARIO.github.io/cyberfixcr/`.

## Conectar el dominio www.cyberfix.cr
Primero registrá el dominio y verificá que esté bajo tu control. En GitHub Pages, agregá `www.cyberfix.cr` en **Settings → Pages → Custom domain**. GitHub indicará la configuración requerida y creará/actualizará el archivo CNAME al guardar.

En el administrador DNS de tu dominio, configurá el registro CNAME para `www` apuntando al dominio `TU-USUARIO.github.io` (sin la ruta del repositorio). Para el dominio raíz `cyberfix.cr`, podés configurar los registros A/AAAA que GitHub documenta, y luego establecer la redirección deseada. Seguí siempre los valores vigentes de la documentación oficial de GitHub Pages.

Activá **Enforce HTTPS** cuando GitHub lo habilite. No cambies los nameservers ni borres registros de correo existentes sin revisar antes su uso.

## Antes de publicar comercialmente
- Reemplazá los textos de contacto pendientes con correo y WhatsApp reales.
- El formulario de contacto principal todavía es una demostración. El portal de clientes requiere completar la configuración de Supabase que sigue.
- Revisá los textos legales con asesoría adecuada para Costa Rica.
- Ajustá el catálogo para ofrecer únicamente servicios que realmente podás prestar con tu preparación, herramientas y autorización del cliente.
- No publiques estadísticas, certificaciones, testimonios ni clientes ficticios.
- Añadí fotos y datos empresariales propios cuando estén disponibles.

## Seguridad
GitHub Pages sirve archivos estáticos. No guardés contraseñas, datos de clientes ni claves secretas en este repositorio. La clave publicable de Supabase puede ir en `supabase-config.js` (nunca una clave `service_role`); debe acompañarse de las políticas RLS del esquema.

## Configurar cuentas y seguimiento con Supabase
1. Creá un proyecto en [Supabase](https://supabase.com/) y guardá de forma privada la contraseña de la base de datos.
2. En **Project Settings → API**, copiá la **Project URL** y la **publishable key** (o la antigua clave `anon`) en `supabase-config.js`. Esa clave pública se puede usar en el navegador solo porque las políticas RLS restringen el acceso.
3. En **SQL Editor**, ejecutá una vez el contenido de `supabase-schema.sql`. La tabla `service_requests` tiene RLS: cada usuario solo puede consultar sus propias solicitudes; las cuentas de clientes no pueden cambiar estados ni borrar filas.
4. En **Authentication → URL Configuration**, configurá **Site URL** como `https://cyberfixcr.github.io/` y agregá a **Redirect URLs** `https://cyberfixcr.github.io/portal.html`. Para pruebas locales, agregá también `http://127.0.0.1:4175/portal.html`.
5. Mantené habilitada la confirmación de correo y configurá un proveedor SMTP propio antes de abrir el registro al público; el envío predeterminado de prueba de Supabase tiene límites.
6. Probá registro, confirmación por correo, inicio de sesión, recuperación de contraseña y envío/lectura de solicitudes en el sitio publicado con HTTPS.
7. Para actualizar un estado, iniciá sesión en el panel de Supabase con una cuenta administrativa y editá solo la fila correcta en **Table Editor → service_requests**. Nunca pongás la clave `service_role` en archivos web: permite saltarse RLS.

El portal no ofrece panel administrativo ni recibe archivos. Las consultas creadas desde el portal sí se guardan en Supabase; el formulario de contacto de la página principal sigue sin enviar datos. Antes de abrirlo al público, revisá el aviso de privacidad, la retención/eliminación de datos, la protección contra abuso y la configuración de autenticación con asesoría apropiada.
