Crea una pantalla de Login moderna, limpia y llamativa para la empresa “Hennesy - Agencia de Marketing y Desarrollo de Software”.

STACK y restricciones:
- Frontend: React + TypeScript (TSX) con Vite.
- Estilos: TailwindCSS (usar clases, sin CSS pesado; evitar librerías grandes).
- Animaciones: Framer Motion opcional pero mínimo (si no se usa, usar solo CSS transitions). Debe ser suave y de bajo costo (opacity/transform).
- Performance: evitar sombras exageradas, evitar blur pesado; usar animaciones solo en transform/opacity; sin re-render innecesario.
- Accesibilidad: labels reales, focus visible, navegación por teclado, mensajes de error claros, aria-* correcto.

PALETA (usar SOLO estos colores):
- Brand/CTA: #0A6B38 (primary), #053D1B (primary dark), #2BA761 (primary bright), #7CC09C (primary soft)
- Neutrales: #040404 (deep), #484848 (border), #3C4C44 (text muted), #5D7467, #709484
- Superficies claras: #FFFFFF, #E9F2ED, #D2E4DB, #BCD7C9, #A6C9B7, #90BCA5
- Invertidos (solo para detalles muy puntuales, no como primario): #F594C7, #FAC2E4, #D4589E, #1A1216, #833F63, #8F6B7B, #A28B98, #C3B3BB, #B7B7B7, #FBFBFB

BRANDING:
- Incluir el logo de Hennesy (circular) arriba a la izquierda dentro de la tarjeta o centrado arriba (según se vea más premium).
- Título: “Bienvenido a Hennesy”
- Subtítulo: “Inicia sesión para administrar clientes y proyectos”

DISEÑO (visual):
- Tema oscuro premium: fondo #040404 con un gradiente sutil radial hacia #02130A / #031D0F.
- Card principal (login): superficie oscura ligeramente elevada (ej. #010A05) con borde 1px #484848 y sombra suave.
- Un acento verde elegante: línea, glow muy sutil o borde en #0A6B38 (sin exagerar).
- Inputs: altura cómoda, borde #484848, fondo #010A05, texto claro; al focus: ring fino #2BA761.
- Botón CTA “Entrar”: background #0A6B38, hover #2BA761, active #053D1B, texto blanco.
- Link “¿Olvidaste tu contraseña?” en #7CC09C y hover a #2BA761.
- Mostrar validación: error en texto claro con contraste; no usar rojo chillón, preferir tono suave (puede ser #B7B7B7 con borde sutil y un ícono).
- Layout responsive: 1 columna móvil; en desktop, card centrada con una columna lateral opcional con mensaje/beneficios (no pesada).

MICROINTERACCIONES (ligeras):
- Animación al cargar: la card aparece con fade + translateY (8–12px) y duration 250–350ms.
- Hover del botón: leve elevación (translateY -1) y cambio de tono.
- Focus: outline/ring visible.
- Loading: spinner simple o texto “Entrando…” sin bloquear layout.

FUNCIONALIDAD:
- Campos: Email y Contraseña.
- Checkbox “Recordarme”.
- Botón submit.
- Estados: idle, loading, error.
- Validaciones mínimas: email formato, contraseña requerida.
- Preparar para integración con backend (endpoint /auth/login). No implementar backend aquí, solo mock del request con async/await.

ENTREGABLE:
- Genera el componente completo en TSX: LoginPage.tsx
- Incluye componentes internos si hace falta (Input, Button) dentro del mismo archivo para simplicidad.
- No uses librerías extra salvo React y (opcional) Framer Motion.
- Código limpio, escalable y listo para producción.
