# Workflows

This repository separates responsibilities between GitHub Actions and Expo/EAS to avoid duplicated build jobs.

## Main Flow

1. A work branch is merged into `develop`.
2. `develop` is validated in GitHub Actions.
3. `develop` is merged into `main`.
4. The resulting push to `main` triggers the EAS workflow.
5. EAS validates the project, runs the Android prebuild, and generates the APK.

## GitHub Actions

### `.github/workflows/deploy.yml`

Although the file is named `deploy.yml`, its workflow is named `Validate` and only validates the project. It does not generate an APK and does not call EAS.

It runs on:

- `pull_request` into `main`
- `pull_request` into `develop`
- `push` into `develop`

It runs:

```bash
npm ci
npm run lint
npm run typecheck
```

Its purpose is to catch lint or TypeScript errors before changes are integrated.

### `.github/workflows/branch-modeling.yml`

This workflow models the branch policy.

It runs on:

- `pull_request` into `main`
- `pull_request` into `develop`
- branch deletion events
- manual execution through `workflow_dispatch`

Rules:

- Only PRs from `develop` into `main` are allowed.
- If another branch tries to open a direct PR into `main`, the check fails.
- If `main` or `develop` is deleted, the workflow fails and warns that those branches must be protected with branch protection or rulesets.
- Temporary branches are deleted after a PR into `main` or `develop` is merged.

The source branch is deleted only if:

- The PR was merged.
- The source branch belongs to the same repository.
- The source branch is not `main`.
- The source branch is not `develop`.

Examples:

- `feature/login -> develop`: after merge, `feature/login` is deleted.
- `bugFix/yml -> develop`: after merge, `bugFix/yml` is deleted.
- `develop -> main`: after merge, `develop` is not deleted.

Important: GitHub Actions can mark this policy as failed, but real merge or deletion blocking depends on GitHub branch protection or rulesets.

## Expo/EAS Workflows

### `.eas/workflows/create-production-builds.yml`

This is the only workflow that generates the Android APK.

It runs on:

- `push` into `main`

It first runs:

```bash
npm run lint
npm run typecheck
npm run prebuild:android
```

Then it generates the Android build with:

- `platform: android`
- `profile: preview`

The `preview` profile is configured in `eas.json` to generate an APK.

## Responsibility Summary

### `.github/workflows/deploy.yml`

- Platform: GitHub Actions.
- Runs on: PRs into `main` or `develop`, and pushes into `develop`.
- Responsibility: validate lint and TypeScript.

### `.github/workflows/branch-modeling.yml`

- Platform: GitHub Actions.
- Runs on: PRs into `main` or `develop`, `delete` events, and manual execution.
- Responsibility: enforce the `develop -> main` policy and delete merged temporary branches.

### `.eas/workflows/create-production-builds.yml`

- Platform: Expo/EAS.
- Runs on: push into `main`.
- Responsibility: validate, run Android prebuild, and generate the APK.

## Related Commands

`package.json` exposes these commands used by the workflows:

```bash
npm run lint
npm run typecheck
npm run prebuild:android
npm run build:android:preview
npm run workflow:android:apk
```

The `npm run prebuild:android` command runs:

```bash
expo prebuild --platform android --clean
```

The `npm run build:android:preview` command starts an Android EAS build using the `preview` profile.

The `npm run workflow:android:apk` command runs the EAS workflow defined in `.eas/workflows/create-production-builds.yml`.
