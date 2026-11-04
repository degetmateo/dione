import { DashboardStylesView } from './dashboard-styles.view';
import { DashboardScriptView } from './dashboard-script.view';

export class DashboardHtmlView {
    public static render(): string {
        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dione — Panel de Control Local</title>
    <style>${DashboardStylesView.render()}</style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🌌 Dione — Panel de Administración Local</h1>
            <span id="stateBadge" class="badge">Cargando...</span>
        </header>

        <div class="stats-bar">
            <div class="stat"><span>Cuenta Bot</span><strong id="botTag">—</strong></div>
            <div class="stat"><span>Servidores</span><strong id="guildsCount">0</strong></div>
            <div class="stat"><span>Tiempo Activo</span><strong id="uptime">0 min</strong></div>
            <div class="stat"><span>Failovers API (Últ. Uso)</span><strong id="failovers">0</strong></div>
        </div>

        <div class="grid">
            <div class="card">
                <h2>📡 Proveedor de API (/anime y /manga)</h2>
                <p class="hint">En modo Automático usa AniList y conmuta a MyAnimeList API v2 si AniList cae.</p>
                <div class="seg">
                    <button data-mode="auto" onclick="setProvider('auto')">Automático</button>
                    <button data-mode="anilist" onclick="setProvider('anilist')">Solo AniList</button>
                    <button data-mode="mal" onclick="setProvider('mal')">Solo MyAnimeList</button>
                </div>

                <h2 style="margin-top:8px;">🛠️ Modo Mantenimiento</h2>
                <div class="row">
                    <input type="checkbox" id="maintCheck" style="width:auto;" />
                    <label for="maintCheck" style="margin:0;color:var(--text);">Activar modo mantenimiento global</label>
                </div>
                <div>
                    <label>Motivo público (opcional)</label>
                    <input id="maintReason" placeholder="Ej: Actualizando base de datos, volvemos en 10 min." />
                </div>
                <button class="btn warn" onclick="saveMaintenance()">Guardar Mantenimiento</button>

                <h2 style="margin-top:8px;">🎲 Economía y Gacha</h2>
                <div class="row">
                    <div style="flex:1;"><label>Renas por Reclaim</label><input type="number" id="renasInput" min="0" /></div>
                    <div style="flex:1;"><label>Claim Cooldown (seg)</label><input type="number" id="cccInput" min="0" /></div>
                </div>
                <button class="btn" onclick="saveGacha()">Actualizar Parámetros</button>
            </div>

            <div class="card">
                <h2>📢 Enviar Avisos a Servidores</h2>
                <div>
                    <label>Alcance del Aviso</label>
                    <select id="targetSelect">
                        <option value="channel">Canal específico de un servidor</option>
                        <option value="broadcast">Difusión global (todos los servidores)</option>
                    </select>
                </div>
                <div id="channelPickers">
                    <label>Servidor</label>
                    <select id="guildSelect" style="margin-bottom:10px;"></select>
                    <label>Canal de Texto</label>
                    <select id="channelSelect"></select>
                </div>
                <div>
                    <label>Estilo</label>
                    <select id="styleSelect">
                        <option value="info">Informativo (Azul)</option>
                        <option value="maintenance">Mantenimiento (Naranja)</option>
                        <option value="warning">Advertencia (Dorado)</option>
                        <option value="success">Novedad / Éxito (Verde)</option>
                    </select>
                </div>
                <div><label>Título</label><input id="noticeTitle" placeholder="📢 Aviso Oficial de Dione" /></div>
                <div><label>Mensaje (soporta Markdown)</label><textarea id="noticeMsg" placeholder="Escribe el comunicado aquí..."></textarea></div>
                <button class="btn" onclick="sendNotice()">Enviar Comunicado</button>
            </div>
        </div>
    </div>
    <div id="toast"></div>
    <script>${DashboardScriptView.render()}</script>
</body>
</html>`;
    }
}

