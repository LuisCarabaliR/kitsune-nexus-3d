# Kitsune Nexus: salas 3D guiadas

## Intención

Convertir el Nexus Central en una experiencia que se sienta como un hub de videojuego: los portales deben invitar a entrar y conducir a una sala temática en vez de limitarse a cambiar texto informativo.

## Objetivos

- Conservar el Nexus Central, sus tres portales y la estética anime-futurista ya publicada.
- Añadir un estado explícito de navegación: `nexus` o `room`.
- Al abrir una estación, presentar una sala 3D con identidad propia y permitir desplazamiento con WASD/flechas.
- Mostrar controles claros para explorar cada sala y regresar al Nexus.
- Mantener el sitio ligero, responsive y accesible con controles de interfaz equivalentes a los clics 3D.
- Añadir un Archivo del Explorador con perfil, habilidades basadas en el proyecto y acceso al repositorio.

## Fuera de alcance

- No se incorporarán modelos descargados, autenticación, puntajes ni movimiento FPS libre.
- No se reemplazará el diseño publicado ni se modificarán los enlaces públicos existentes.

## Enfoques considerados

1. Movimiento libre tipo FPS: más parecido a videojuego, pero eleva la complejidad de controles, rendimiento y accesibilidad.
2. Recorrido guiado con cámara y salas seleccionables: conserva el aspecto 3D, comunica la experiencia rápidamente y funciona bien en escritorio y móvil.
3. Pantallas 2D independientes: simple, pero pierde el valor de la exploración Web 3D.

Se elige el enfoque 2 por ser el más presentable para el Sprint 2 y por aprovechar React Three Fiber sin dependencias nuevas.

## Diseño técnico

`App` administrará la estación elegida y el modo de experiencia. `NexusScene` recibirá ambos datos y alternará entre el hub con portales y una `NexusRoom` temática. Cada sala se construirá con primitivas Three.js, iluminación, partículas, elementos animados y navegación de teclado limitada al espacio de la sala; un panel HTML mantendrá un botón visible de entrada/regreso y una lista de puntos de aprendizaje. El Archivo del Explorador será una sección HTML independiente para no bloquear la experiencia 3D si se visualiza en móvil.

## Criterios de aceptación

- Al seleccionar una estación en el hub, aparece una acción "Entrar a la sala".
- Al entrar, el encabezado, la escena y los puntos de aprendizaje corresponden a la estación elegida.
- El usuario puede regresar al Nexus desde un botón visible.
- Dentro de una sala, WASD y las flechas desplazan la cámara en los límites del espacio.
- Las tres estaciones mantienen una ubicación y paleta distinta.
- El portafolio muestra el nombre de GitHub, habilidades técnicas reales y el enlace al repositorio, sin inventar datos de contacto.
- La navegación se cubre con pruebas puras y la aplicación compila y pasa su suite.
