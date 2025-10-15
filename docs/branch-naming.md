# Convenciones de nombres para ramas en Git

Para mantener un flujo de trabajo ordenado y entendible, usamos **naming conventions** en las ramas.  
Esto ayuda a identificar rápidamente el propósito de cada rama y facilita la colaboración.

---

## Prefijos principales

### `feature/`

Se utiliza para el desarrollo de **nuevas funcionalidades**.

**Ejemplo:**  

``` bash
feature/login-ui
feature/export-report
```

---

### `fix/`

Se utiliza para **correcciones de errores** no críticos.

**Ejemplo:**  

``` bash
fix/dockerfile-permissions
fix/typo-readme
```

---

### `hotfix/`

Se utiliza para **parches urgentes en producción**.

**Ejemplo:**  

``` bash
hotfix/api-timeout
hotfix/security-patch
```

---

### `release/`

Se utiliza para preparar **versiones antes de publicarlas**.

**Ejemplo:**  

``` bash
release/v1.2.0
release/2025-09
```

---

### `refactor/`

Para **refactorizaciones de código o estructura** sin cambiar funcionalidad.

**Ejemplo:**

``` bash
refactor/reorganize-folders
```

---

### `chore/`

Se utiliza para **tareas de mantenimiento** que no afectan directamente la lógica de negocio.

**Ejemplo:**  

``` bash
chore/update-ci
chore/dependency-bump
```

---

### `docs/`

Se utiliza para cambios en **documentación**.

**Ejemplo:**  

``` bash
docs/readme-update
docs/add-contributing
```

---

### `test/`

Se utiliza para **experimentos o pruebas temporales**.

**Ejemplo:**  

``` bash
test/new-build-pipeline
test/k8s-scaling
```

---

## Buenas prácticas

- Usar **kebab-case** (`palabra-palabra`) en lugar de espacios o mayúsculas.  
- El nombre debe ser **corto pero descriptivo**.  
- El prefijo indica el **propósito de la rama**, y lo que sigue debe describir la tarea.  
- Evitar caracteres especiales o acentos.  

---

## Ejemplo de flujo típico

1. Crear una rama desde `main` o `develop`:  

    ```bash
    git checkout -b feature/login-ui
    ````

2. Trabajar en los cambios y hacer commits.
3. Abrir un Pull Request para integrar la rama.
4. Una vez mergeada, borrar la rama.

---
