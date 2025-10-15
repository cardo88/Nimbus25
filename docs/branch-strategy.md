# Estrategia de ramas

* **`main` (estable/revisada)**
  Siempre la **última versión que verán/corregirán los profesores**. Solo se actualiza desde un PR de `pre-release` cuando el equipo decide “congelar” una entrega.

  * Protegida: no commits directos, 1–2 reviews

* **`pre-release`**
  Donde se **mergean todas las actualizaciones** (features, fixes). Es el “ staging ” del curso. Cuando está estable → PR a `main`.

* **Ramas de trabajo (de corta vida)**

  * `feature/<algo>` para nuevas funcionalidades
  * `fix/<algo>` para bugs
  * `refactor/<algo>` para reestructura (ej.: `refactor/restructure-project-folders`)
    Se crean desde `pre-release` y vuelven a `pre-release` por PR.

* **Hotfixes urgentes**
  Si encontrás un error crítico en lo ya entregado: `hotfix/<algo>` desde `main`, merge a `main` y back-merge a `pre-release`.

## Flujo recomendado

1. Commits + PR hacia `pre-release`

```bash
git push -u origin refactor/restructure-project-folders
# Abrir PR -> base: pre-release
```

2. Cuando `pre-release` está estable para entrega → **PR a `main`**

```bash
# En GitHub: abrir PR pre-release -> main
# Al mergear, crear tag:
git checkout main
git pull
git tag -a v0.3.0 -m "Entrega UT2 - revisión profesores"
git push origin v0.3.0
```

## Protecciones (GitHub)

* **`main`**

  * Require pull request + al menos 1 review.
  * Bloquear “force push” y commits directos.
  * Requerir que el branch esté actualizado con base antes de merge.

* **`pre-release`**

  * Un review.


## Convenciones de nombres (resumen)

* `feature/…`, `fix/…`, `refactor/…`, `hotfix/…`, `docs/…`, `chore/…`
* kebab-case: `feature/add-blue-green-deploy`
* ver documento /docs/branch-naming.md.

## Diagrama

```
feature/*      fix/*      refactor/*
     \            |            /
      \-----------v-----------/         hotfix/*
                  |                         \
             pre-release ------------------> main
                     \______________________^
                           (PR + tag)
```
