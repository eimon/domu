# JWT con Refresh Tokens — FastAPI + React / React Native

Guía de implementación del sistema de autenticación con access tokens de corta duración y refresh tokens opacos de larga duración.

---

## Conceptos

| Token | Duración | Dónde vive | Para qué |
|---|---|---|---|
| Access token (JWT) | 30 min | Memoria (Zustand) + SecureStore | Autenticar cada request |
| Refresh token (opaco) | 60 días | SecureStore | Obtener nuevos access tokens |

**Por qué dos tokens:**
- El access token expira rápido → ventana de ataque pequeña si se compromete
- El refresh token dura meses → el usuario no necesita re-autenticarse
- El refresh token es opaco (no JWT) → solo es válido consultando la DB, lo que permite revocación real

**Por qué el refresh token no es un JWT:**
Un JWT puede ser verificado sin consultar la DB (solo con la clave secreta). Eso hace imposible la revocación inmediata. Un token opaco es solo un string aleatorio de alta entropía — la DB es la única fuente de verdad sobre su validez.

---

## Backend — FastAPI

### Modelo de datos

```python
# models/refresh_token.py
class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id         = Column(UUID, primary_key=True, default=uuid.uuid4)
    token_hash = Column(String(64), nullable=False, unique=True, index=True)  # SHA-256
    user_id    = Column(UUID, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)   # NULL = activo
    replaced_by = Column(UUID, ForeignKey("refresh_tokens.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    device_hint = Column(String(200), nullable=True)  # User-Agent truncado
```

El token viaja al cliente en texto plano. En DB se guarda solo su **hash SHA-256**. Si la base de datos se filtra, los tokens almacenados son inútiles.

`replaced_by` permite trazar la cadena de rotaciones y detectar replay attacks.

### Generación de tokens

```python
# core/security.py
import hashlib, secrets

def generate_refresh_token() -> tuple[str, str]:
    """Retorna (token_opaco, hash_sha256)."""
    token = secrets.token_urlsafe(48)  # 384 bits de entropía
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    return token, token_hash

def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()
```

`secrets.token_urlsafe(48)` produce 64 caracteres base64url. Es prácticamente imposible de fuerza bruta.

### Configuración

```python
# core/config.py
ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
REFRESH_TOKEN_EXPIRE_DAYS: int = 60
```

### Endpoints

#### `POST /auth/login`

Devuelve par de tokens al autenticarse correctamente.

```python
# Response
{
  "access_token": "<JWT>",
  "refresh_token": "<token_opaco>",
  "token_type": "bearer"
}
```

El `device_hint` se extrae del header `User-Agent` y se guarda junto al refresh token (solo informativo, para auditoría).

#### `POST /auth/refresh`

No requiere access token. El refresh token ES la credencial.

```python
# Body
{ "refresh_token": "<token_opaco>" }

# Response
{
  "access_token": "<nuevo JWT>",
  "refresh_token": "<nuevo token_opaco>",
  "token_type": "bearer"
}
```

Lógica interna:

1. Calcular `SHA-256(refresh_token)` y buscar en DB
2. Si no existe → `401`
3. Si `revoked_at IS NOT NULL` → **replay attack**: revocar todos los tokens activos del usuario → `401`
4. Si `expires_at < now()` → `401`
5. Verificar que el usuario exista y esté activo
6. Crear nuevo par de tokens
7. Marcar el token anterior como `revoked_at = now()`, `replaced_by = nuevo_id`
8. Retornar el nuevo par

El paso 3 es la protección contra replay: si alguien roba el refresh token y lo usa antes que el usuario legítimo, cuando el usuario intente usarlo la API detecta que ya fue rotado y cierra **todas** las sesiones activas del usuario.

#### `POST /auth/logout`

Requiere access token válido.

```python
# Body
{ "refresh_token": "<token_opaco>" }
```

Marca el refresh token como `revoked_at = now()`. Idempotente: si ya estaba revocado, retorna `200` igual.

### Repositorio

```python
# repositories/refresh_token_repository.py
class RefreshTokenRepository:
    async def create(self, token_hash, user_id, expires_at, device_hint=None) -> RefreshToken
    async def get_by_hash(self, token_hash: str) -> RefreshToken | None
    async def revoke(self, token: RefreshToken, replaced_by_id=None) -> None
    async def revoke_all_by_user(self, user_id: UUID) -> None
```

Sigue el patrón del proyecto: `flush()` tras escribir, nunca `commit()`.

### Clientes permitidos

En lugar de un par único `CLIENT_ID`/`CLIENT_SECRET`, la API valida contra un dict configurable:

```python
# core/config.py
ALLOWED_CLIENTS: dict[str, str] = {}

@field_validator("ALLOWED_CLIENTS", mode="before")
@classmethod
def parse_allowed_clients(cls, v):
    if isinstance(v, str):
        return json.loads(v)
    return v
```

```yaml
# docker-compose.yml
ALLOWED_CLIENTS: '{"domu-app":"secreto1","domu-web":"secreto2"}'
```

La validación vive en una dependencia reutilizable, no inline en el router:

```python
# dependencies/auth.py
def verify_client(form_data: OAuth2PasswordRequestForm = Depends()) -> OAuth2PasswordRequestForm:
    expected = settings.ALLOWED_CLIENTS.get(form_data.client_id or "")
    if expected is None or expected != (form_data.client_secret or ""):
        raise UnauthorizedException("Cliente no autorizado")
    return form_data
```

```python
# routers/auth.py
@router.post("/login", response_model=Token)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(verify_client),  # ← dependencia
    db: AsyncSession = Depends(get_db),
):
    ...
```

---

## Frontend — React / React Native (Expo)

### Almacenamiento

| Clave | Valor | Store |
|---|---|---|
| `domu_token` | Access token | SecureStore |
| `domu_refresh_token` | Refresh token | SecureStore |
| `domu_user` | JSON del usuario | SecureStore |

El access token también vive en el estado Zustand para acceso síncrono. El refresh token **solo** vive en SecureStore — no hace falta tenerlo en memoria.

`expo-secure-store` usa iOS Keychain y Android Keystore (hardware-backed). Nunca usar `AsyncStorage` para tokens.

### Store (Zustand)

```typescript
// store/authStore.ts

export const TOKEN_KEY = "domu_token";
export const REFRESH_TOKEN_KEY = "domu_refresh_token";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, refreshToken: string, user: AuthUser) => Promise<void>;
  setTokenSilent: (token: string) => void;  // solo actualiza memoria
  clearAuth: () => Promise<void>;
  // ...
}

setAuth: async (token, refreshToken, user) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  set({ token, user });
},

setTokenSilent: (token) => set({ token }),  // el interceptor ya guardó en SecureStore

clearAuth: async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
  set({ token: null, user: null });
},
```

`setTokenSilent` lo usa el interceptor para sincronizar el estado en memoria después de refrescar sin volver a escribir en SecureStore (ya lo hizo él).

### Interceptor de refresh (axios)

El interceptor captura los `401` y renueva el token de forma transparente. El resto de la app no sabe que el token expiró.

```typescript
// services/api.ts

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const is401 = error.response?.status === 401;
    const isRetry = originalRequest._retry;
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login");

    if (is401 && !isRetry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Encolar requests concurrentes que fallaron mientras se refrescaba
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (!refreshToken) throw new Error("Sin sesión activa");

        const { data } = await api.post("/auth/refresh", {
          refresh_token: refreshToken,
        });

        // Guardar nuevos tokens
        await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refresh_token);
        useAuthStore.getState().setTokenSilent(data.access_token);

        processQueue(null, data.access_token);

        // Reintentar la request original
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await useAuthStore.getState().clearAuth();  // sesión expirada → logout
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const mensaje = error.response?.data?.detail || error;
    return Promise.reject(new Error(mensaje));
  }
);
```

**Por qué la cola:** si al arrancar la app hay 3 requests en paralelo y todas reciben `401` (token expirado), sin la cola se lanzarían 3 refresh simultáneos. Con la cola, solo el primero hace el refresh; los otros dos esperan y se resuelven con el token nuevo.

### Hook de autenticación

```typescript
// hooks/useAuth.ts

const login = async (email: string, password: string) => {
  const tokenRes = await authApi.login(email, password);
  const { access_token, refresh_token } = tokenRes.data;

  // Llamada directa con el token recién obtenido (aún no está en SecureStore)
  const perfilRes = await api.get("/auth/perfil", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  await setAuth(access_token, refresh_token, perfilRes.data);
  return perfilRes.data;
};

const logout = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (refreshToken) await authApi.logout(refreshToken);  // invalidar en servidor
  } catch {
    // Si falla el servidor, igual cerramos sesión localmente
  }
  await clearAuth();
  router.replace("/(auth)/login");
};
```

### Flujo de arranque

`loadStoredAuth` carga el access token desde SecureStore. Si expiró, la primera request que se haga recibirá un `401` y el interceptor hará el refresh de forma transparente. No hace falta verificar expiración en el arranque.

```typescript
// _layout.tsx
useEffect(() => {
  loadStoredAuth();  // carga token + user desde SecureStore
}, []);
```

---

## Flujo completo

```
Primera vez:
  Login → API valida credenciales
        → Genera access token (30 min) + refresh token (60 días)
        → Cliente guarda ambos en SecureStore

Uso normal (token vigente):
  Request → interceptor adjunta access token → API responde 200

Token expirado:
  Request → API responde 401
          → Interceptor detecta 401
          → Lee refresh token de SecureStore
          → POST /auth/refresh → API valida, rota el token, devuelve par nuevo
          → Interceptor guarda nuevos tokens, reintenta request original
          → API responde 200 (el usuario no vio nada)

Logout:
  POST /auth/logout con refresh token → API marca como revocado
  clearAuth() → elimina tokens de SecureStore + estado Zustand

Sesión expirada (refresh token vencido o revocado):
  Interceptor llama /auth/refresh → API responde 401
  Interceptor llama clearAuth() → usuario va al login

Replay attack (token robado y usado):
  Atacante usa refresh token → API lo rota
  Usuario legítimo intenta usar el original (ya rotado) → API detecta token revocado
  API revoca TODOS los tokens activos del usuario
  Ambas sesiones quedan invalidadas → ambos van al login
```

---

## Mantenimiento

Los tokens expirados/revocados se acumulan en la tabla `refresh_tokens`. Ejecutar periódicamente (cron o background task):

```sql
DELETE FROM refresh_tokens WHERE expires_at < NOW() - INTERVAL '7 days';
```

El margen de 7 días es intencional: mantener tokens expirados recientes permite auditar intentos de replay.
