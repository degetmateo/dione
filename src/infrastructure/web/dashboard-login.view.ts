import { DashboardStylesView } from './dashboard-styles.view';

export class DashboardLoginView {
    public static render(defaultUsername: string, usingCustomPassword: boolean): string {
        const safeUser = defaultUsername.replace(/["<>]/g, '');
        const hint = usingCustomPassword
            ? 'Ingresa la contraseña configurada en ADMIN_PASSWORD para acceder al panel.'
            : 'Ingresa el usuario y la contraseña de inicio de sesión del equipo donde se aloja Dione.';

        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dione — Autenticación de Red Local</title>
    <style>${DashboardStylesView.render()}
    .login-wrap { min-height: 82vh; display: flex; align-items: center; justify-content: center; }
    .login-card { width: 100%; max-width: 410px; }
    .err { color: var(--danger); font-size: 0.85rem; min-height: 1.2em; }
    </style>
</head>
<body>
    <div class="login-wrap">
        <form class="card login-card" id="loginForm">
            <h2>🔒 Dione — Acceso Red Local</h2>
            <p class="hint">${hint}</p>
            <div>
                <label for="userInp">Usuario del equipo</label>
                <input id="userInp" autocomplete="username" value="${safeUser}" required />
            </div>
            <div>
                <label for="passInp">Contraseña</label>
                <input id="passInp" type="password" autocomplete="current-password" placeholder="••••••••" required autofocus />
            </div>
            <p class="err" id="errMsg"></p>
            <button type="submit" class="btn" id="loginBtn">Iniciar Sesión</button>
        </form>
    </div>
    <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('loginBtn');
        const err = document.getElementById('errMsg');
        err.textContent = ''; btn.disabled = true; btn.textContent = 'Verificando...';
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: document.getElementById('userInp').value,
                    password: document.getElementById('passInp').value
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Credenciales inválidas');
            location.reload();
        } catch (ex) {
            err.textContent = ex.message;
            btn.disabled = false; btn.textContent = 'Iniciar Sesión';
        }
    });
    </script>
</body>
</html>`;
    }
}

