# Aplicación de la Ley de Miller en UI-Monitoring

Este proyecto demuestra la aplicación práctica de la Ley de Miller en interfaces de usuario, específicamente en el módulo UI-Monitoring de nuestra plataforma de microservicios.

## ¿Qué es la Ley de Miller?

La Ley de Miller, propuesta por el psicólogo George Miller en 1956, establece que una persona puede recordar aproximadamente 7 (±2) elementos de información simultáneamente en su memoria de trabajo. Este principio tiene importantes implicaciones en el diseño de interfaces de usuario, donde limitar el número de opciones o elementos visuales puede mejorar significativamente la experiencia del usuario.

## Implementación en este proyecto

Hemos implementado un botón de alternancia que permite cambiar entre dos versiones de la interfaz:

1. **Interfaz sin aplicar la Ley de Miller**: Muestra todas las opciones y elementos disponibles.
2. **Interfaz con la Ley de Miller aplicada**: Reduce las opciones a un máximo de 7±2 elementos, facilitando la comprensión y uso de la interfaz.

## Componentes donde se implementa

### 1. Menú de navegación (Sidebar)

- La versión sin Ley de Miller muestra todos los elementos de navegación (15+ opciones).
- La versión con Ley de Miller muestra solo 7±2 opciones más importantes.

### 2. Página de configuración (Settings)

- La versión sin Ley de Miller muestra todas las opciones de configuración disponibles.
- La versión con Ley de Miller prioriza y muestra solo las opciones más relevantes.

## Beneficios de aplicar la Ley de Miller

- Reducción de la carga cognitiva del usuario
- Mejora en la usabilidad al limitar las opciones a un número manejable
- Facilita la toma de decisiones al reducir la complejidad visual
- Aumenta la probabilidad de que el usuario recuerde las opciones disponibles

## Cómo probar la implementación

1. Navega por la aplicación y observa el botón de alternancia "Con/Sin Ley de Miller" en la parte superior del menú lateral.
2. Cambia entre las dos versiones y observa cómo se simplifica la interfaz al aplicar la Ley de Miller.
3. Visita la página de Configuración para ver una explicación detallada y otro ejemplo de implementación.

## Conclusión

La implementación de la Ley de Miller en nuestra interfaz demuestra cómo los principios de la psicología cognitiva pueden aplicarse al diseño de interfaces para mejorar la experiencia del usuario. Al limitar el número de opciones visibles en un momento dado, facilitamos que los usuarios comprendan y utilicen nuestra aplicación de manera más eficiente. 