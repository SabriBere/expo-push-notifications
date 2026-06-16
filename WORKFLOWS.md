# Workflows

Este repositorio separa las responsabilidades entre GitHub Actions y Expo/EAS para evitar builds duplicados.

## Flujo principal

1. Una rama de trabajo se mergea hacia `develop`.
2. `develop` se valida en GitHub Actions.
3. `develop` se mergea hacia `main`.
4. El push resultante en `main` dispara el workflow de EAS.
5. EAS valida el proyecto, ejecuta el prebuild Android y genera el APK.

## GitHub Actions

### `.github/workflows/deploy.yml`

Aunque el archivo se llama `deploy.yml`, su workflow se llama `Validate` y solo valida el proyecto. No genera APK y no llama a EAS.

Corre en:

- `pull_request` hacia `main`
- `pull_request` hacia `develop`
- `push` hacia `develop`

Ejecuta:

```bash
npm ci
npm run lint
npm run typecheck
```

Su funcion es detectar errores de lint o TypeScript antes de integrar cambios.

### `.github/workflows/branch-modeling.yml`

Este workflow modela la politica de ramas.

Corre en:

- `pull_request` hacia `main`
- `pull_request` hacia `develop`
- eventos de borrado de ramas
- ejecucion manual con `workflow_dispatch`

Reglas:

- Solo permite PRs desde `develop` hacia `main`.
- Si otra rama intenta abrir PR directo hacia `main`, el check falla.
- Si se borra `main` o `develop`, el workflow falla y avisa que esas ramas deben protegerse con branch protection o rulesets.
- Limpia ramas temporales despues de mergear un PR hacia `main` o `develop`.

Borra la rama origen solo si:

- El PR fue mergeado.
- La rama origen pertenece al mismo repositorio.
- La rama origen no es `main`.
- La rama origen no es `develop`.

Ejemplos:

- `feature/login -> develop`: al mergear, borra `feature/login`.
- `bugFix/yml -> develop`: al mergear, borra `bugFix/yml`.
- `develop -> main`: al mergear, no borra `develop`.

Importante: GitHub Actions puede marcar esta politica como fallida, pero el bloqueo real de borrado o merge depende de configurar branch protection/rulesets en GitHub.

## Expo/EAS workflows

### `.eas/workflows/create-production-builds.yml`

Este es el unico workflow que genera el APK Android.

Corre en:

- `push` hacia `main`

Ejecuta primero:

```bash
npm run lint
npm run typecheck
npm run prebuild:android
```

Luego genera el build Android con:

- `platform: android`
- `profile: preview`

El profile `preview` esta configurado en `eas.json` para generar un APK.

## Resumen de responsabilidades

| Archivo | Plataforma | Cuando corre | Responsabilidad |
| --- | --- | --- | --- |
| `.github/workflows/deploy.yml` | GitHub Actions | PRs a `main`/`develop`, push a `develop` | Validar lint y TypeScript |
| `.github/workflows/branch-modeling.yml` | GitHub Actions | PRs a `main`/`develop`, delete, manual | Controlar la politica `develop -> main` y borrar ramas temporales mergeadas |
| `.eas/workflows/create-production-builds.yml` | Expo/EAS | push a `main` | Validar, prebuild Android y generar APK |

## Comandos relacionados

`package.json` expone estos comandos usados por los workflows:

```bash
npm run lint
npm run typecheck
npm run prebuild:android
npm run build:android:preview
```

El comando `npm run prebuild:android` ejecuta:

```bash
expo prebuild --platform android --clean
```

El comando `npm run build:android:preview` ejecuta un build Android con EAS usando el profile `preview`.
