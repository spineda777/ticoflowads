
## Fase 1 — Base de datos y autenticación
- Crear todas las tablas (tenants, subscriptions, tenant_settings, staff_members, businesses, ads, notifications) con RLS
- Implementar auth (login/signup) con creación automática de tenant
- Copiar el logo al proyecto y agregarlo al navbar

## Fase 2 — Onboarding y Dashboard
- Ruta `/onboarding` con wizard inteligente
- Dashboard principal con métricas y lista de anuncios
- Layout con sidebar para navegación del dashboard

## Fase 3 — Funcionalidades core
- Crear anuncio con IA (Edge Function usando Lovable AI, no Anthropic directamente)
- Gestión de anuncios (listar, ver, publicar simulado)
- Configuración del negocio y perfil
- Gestión de equipo (staff/roles)

## Fase 4 — Pagos y notificaciones
- Integración Stripe (checkout, suscripciones, billing page)
- Sistema de notificaciones en tiempo real
- Validación de límites por plan

## Fase 5 — Admin panel y extras
- Panel admin (`/admin`) con métricas globales
- Preparar para WhatsApp/Resend (Edge Functions)

### Notas importantes:
- **IA**: Usaré Lovable AI (ya configurado) en lugar de Anthropic Claude directamente — misma funcionalidad sin necesidad de API key adicional
- **Stripe**: Se habilitará con la herramienta nativa de Lovable
- **Landing**: No se tocará, solo se agrega el logo al navbar
- **Cada fase se implementará y verificará antes de pasar a la siguiente**

¿Apruebas este plan para comenzar con la Fase 1?
