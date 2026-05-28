# Setup local

## Requisitos

- Java 17
- Maven 3.9+
- Node.js 20+ recomendado (18+ compatible)
- npm

## 1) Backend (Spring Boot)

```bash
mvn -f backend/pom.xml -pl hivefive-api-app spring-boot:run
```

API disponible en:

- `http://localhost:8080/api` (prefijo)
- `http://localhost:8080/api/v1` (endpoints funcionales)

## 2) Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

App disponible en:

- `http://localhost:5173`

## 3) Verificacion funcional rapida

- Abrir login (`/login`) y autenticar con un usuario valido.
- Crear cuenta desde registro (`/register`) y validar redireccion a login.
- Cambiar idioma ES/EN con el selector global (arriba a la derecha).
- Entrar en dashboard y crear un tablero.
- Abrir detalle de tablero y crear/editar/mover/eliminar tarjetas.
- Abrir subtareas en una tarjeta y comprobar create/update/delete.

## 4) Tests frontend

```bash
cd frontend
npm run lint
npm run build
npm test
```

## 5) Tests backend

```bash
mvn -f backend/pom.xml test
```

Tests contra base de datos real:

```bash
mvn -f backend/pom.xml -pl hivefive-api-app -DrunRealDbTests=true -Dtest="*RealDbIntegrationTest" test
```

Detalle de pruebas backend:

- `backend/hivefive-api-app/TESTING.md`
- `backend/README.md` (modulos Maven)

