export class DashboardScriptView {
    public static render(): string {
        return `
const secret = new URLSearchParams(location.search).get('token') || '';
const headers = () => ({ 'Content-Type': 'application/json', ...(secret ? { 'x-admin-secret': secret } : {}) });
let guildsData = [];

function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg; el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3200);
}

async function api(path, method = 'GET', body) {
    const res = await fetch(path, { method, headers: headers(), body: body ? JSON.stringify(body) : undefined });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en petición');
    return data;
}

async function loadStatus() {
    try {
        const d = await api('/api/status');
        document.getElementById('botTag').textContent = d.botTag;
        document.getElementById('guildsCount').textContent = d.guildsCount;
        document.getElementById('uptime').textContent = Math.floor(d.uptimeSeconds / 60) + ' min';
        document.getElementById('failovers').textContent = d.failover.failoverCount + (d.failover.lastProviderUsed ? ' (' + d.failover.lastProviderUsed + ')' : '');
        const badge = document.getElementById('stateBadge');
        badge.textContent = d.settings.maintenance ? 'En Mantenimiento' : (d.ready ? 'En Línea' : 'Iniciando');
        badge.className = 'badge ' + (d.settings.maintenance ? 'maint' : 'online');
        document.querySelectorAll('.seg button').forEach(b => b.classList.toggle('active', b.dataset.mode === d.settings.media_api_provider));
        document.getElementById('maintCheck').checked = Boolean(d.settings.maintenance);
        document.getElementById('maintReason').value = d.settings.maintenance_reason || '';
        document.getElementById('renasInput').value = d.settings.renas_per_reclaim;
        document.getElementById('cccInput').value = d.settings.character_claim_cooldown;
    } catch (e) { toast(e.message); }
}

async function loadGuilds() {
    try {
        const d = await api('/api/guilds');
        guildsData = d.guilds || [];
        const gSel = document.getElementById('guildSelect');
        gSel.innerHTML = guildsData.map(g => '<option value="' + g.id + '">' + g.name + ' (' + g.memberCount + ')</option>').join('');
        renderChannels();
    } catch (e) { toast(e.message); }
}

function renderChannels() {
    const gid = document.getElementById('guildSelect').value;
    const g = guildsData.find(x => x.id === gid);
    const cSel = document.getElementById('channelSelect');
    cSel.innerHTML = (g ? g.channels : []).map(c => '<option value="' + c.id + '">#' + c.name + '</option>').join('');
}

async function setProvider(mode) {
    await api('/api/settings', 'PATCH', { media_api_provider: mode });
    toast('Proveedor multimedia cambiado a: ' + mode.toUpperCase());
    loadStatus();
}

async function saveMaintenance() {
    const maintenance = document.getElementById('maintCheck').checked;
    const maintenance_reason = document.getElementById('maintReason').value;
    await api('/api/settings', 'PATCH', { maintenance, maintenance_reason });
    toast('Estado de mantenimiento guardado');
    loadStatus();
}

async function saveGacha() {
    const renas_per_reclaim = Number(document.getElementById('renasInput').value);
    const character_claim_cooldown = Number(document.getElementById('cccInput').value);
    await api('/api/settings', 'PATCH', { renas_per_reclaim, character_claim_cooldown });
    toast('Parámetros de Gacha actualizados');
    loadStatus();
}

async function sendNotice() {
    const target = document.getElementById('targetSelect').value;
    const channelId = document.getElementById('channelSelect').value;
    const style = document.getElementById('styleSelect').value;
    const title = document.getElementById('noticeTitle').value;
    const message = document.getElementById('noticeMsg').value;
    try {
        const r = await api('/api/announcements', 'POST', { target, channelId, style, title, message });
        toast('Aviso enviado (' + r.sent + ' enviados, ' + r.failed + ' fallidos)');
        document.getElementById('noticeMsg').value = '';
    } catch (e) { toast(e.message); }
}

document.getElementById('targetSelect').addEventListener('change', e => {
    document.getElementById('channelPickers').style.display = e.target.value === 'channel' ? 'block' : 'none';
});
document.getElementById('guildSelect').addEventListener('change', renderChannels);
loadStatus(); loadGuilds(); setInterval(loadStatus, 10000);
        `.trim();
    }
}

