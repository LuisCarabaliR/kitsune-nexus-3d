# Kitsune Nexus Guided Rooms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir salas 3D guiadas y navegables desde el Nexus Central.

**Architecture:** Un modelo puro define el estado `nexus`/`room` y el contenido específico de cada estación. `App` conecta el modelo con los controles HTML y `NexusScene` alterna el hub existente con una nueva escena `NexusRoom` de primitivas animadas.

**Tech Stack:** React, TypeScript, Vite, React Three Fiber, Drei, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-17-kitsune-nexus-guided-rooms-design.md`

## Global Constraints

- No añadir dependencias ni recursos externos.
- Conservar los tres portales y los enlaces publicados.
- Los controles HTML deben permitir navegar sin depender de clics sobre WebGL.

## Review Focus

- Una estación desconocida debe volver de forma segura al Nexus; se cubre en la prueba del modelo de navegación.
- Salir de una sala debe conservar la última estación elegida; se cubre en la prueba del modelo.
- Cada sala debe tener información distinta; se cubre en la prueba de datos de sala.
- Los controles de entrada y regreso deben ser localizables por nombre; se cubre en `App.test.tsx`.
- El bundle no debe romper el despliegue bajo la base de GitHub Pages; se cubre con `npm run build` usando `GITHUB_ACTIONS=true`.

---

### Task 1: Modelo de navegación y contenido de salas

**Files:**
- Create: `src/components/nexusNavigation.ts`
- Create: `src/components/nexusNavigation.test.ts`
- Modify: `src/data/stations.ts`

**Interfaces:**
- Produces: `ExperienceMode`, `enterRoom`, `returnToNexus` y `roomDetails(station)`.

- [ ] **Step 1: Write the failing test** para que `enterRoom('neon')` produzca modo `room`, y `returnToNexus` vuelva a `nexus` sin cambiar la estación.
- [ ] **Step 2: Run the focused test** con `npm test -- --run src/components/nexusNavigation.test.ts`; esperado: falla porque el módulo no existe.
- [ ] **Step 3: Implement the pure model** y añade a cada estación título de sala, misión y tres puntos de aprendizaje.
- [ ] **Step 4: Run the focused test**; esperado: pasa.
- [ ] **Step 5: Commit** con `feat: add guided room navigation model`.

### Task 2: Escena 3D de sala y controles de interfaz

**Files:**
- Create: `src/components/NexusRoom.tsx`
- Modify: `src/components/NexusScene.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `ExperienceMode`, `roomDetails`, estación elegida y callbacks de Task 1.
- Produces: vista hub/sala con acciones `Entrar a la sala` y `Volver al Nexus`.

- [ ] **Step 1: Write the failing UI test** que verifica que el botón de entrar muestra el regreso y el nombre de la sala tras hacer clic.
- [ ] **Step 2: Run the focused test** con `npm test -- --run src/App.test.tsx`; esperado: falla porque no existe el botón.
- [ ] **Step 3: Implement `NexusRoom`** con arquitectura anime-futurista construida con primitivas, luces, partículas y animación; conecta el modo de escena y los paneles HTML.
- [ ] **Step 4: Run the focused test and full suite**; esperado: pasan.
- [ ] **Step 5: Commit** con `feat: add explorable guided rooms`.

### Task 3: Verificación de producción

**Files:**
- Modify: `README.md` si requiere una línea de controles.

- [ ] **Step 1: Run all tests** con `npm test -- --run`; esperado: todas pasan.
- [ ] **Step 2: Build for Pages** con `$env:GITHUB_ACTIONS='true'; npm run build`; esperado: termina con código 0.
- [ ] **Step 3: Commit document changes if needed** con `docs: describe guided room controls`.
