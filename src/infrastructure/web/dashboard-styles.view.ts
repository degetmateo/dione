export class DashboardStylesView {
    public static render(): string {
        return `
:root {
    --bg: #0b0f19; --card: #131a2a; --border: #23304c; --text: #e6edf3;
    --muted: #8b9bb4; --accent: #6366f1; --accent-hover: #4f46e5;
    --success: #10b981; --warn: #f59e0b; --danger: #ef4444;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); padding: 24px; line-height: 1.5; }
.container { max-width: 1080px; margin: 0 auto; }
header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
h1 { font-size: 1.5rem; font-weight: 700; display: flex; align-items: center; gap: 10px; }
.badge { padding: 4px 12px; border-radius: 999px; font-size: 0.8rem; font-weight: 600; background: #1e293b; border: 1px solid var(--border); }
.badge.online { color: var(--success); border-color: rgba(16,185,129,0.4); }
.badge.maint { color: var(--warn); border-color: rgba(245,158,11,0.4); }
.stats-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px; }
.stat { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; }
.stat span { display: block; font-size: 0.78rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
.stat strong { font-size: 1.15rem; margin-top: 4px; display: block; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.card h2 { font-size: 1.08rem; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
.hint { font-size: 0.84rem; color: var(--muted); }
label { display: block; font-size: 0.85rem; color: var(--muted); margin-bottom: 4px; }
input, select, textarea { width: 100%; background: #0d1321; color: var(--text); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; font-size: 0.92rem; }
textarea { min-height: 92px; resize: vertical; }
.seg { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.seg button { background: #0d1321; color: var(--muted); border: 1px solid var(--border); border-radius: 8px; padding: 10px 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: 0.15s; }
.seg button.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.btn { background: var(--accent); color: #fff; border: none; border-radius: 8px; padding: 10px 16px; font-weight: 600; cursor: pointer; transition: 0.15s; }
.btn:hover { background: var(--accent-hover); }
.btn.warn { background: var(--warn); color: #111; }
.row { display: flex; gap: 10px; align-items: center; }
#toast { position: fixed; bottom: 20px; right: 20px; background: #1e293b; border: 1px solid var(--accent); color: #fff; padding: 12px 18px; border-radius: 10px; display: none; box-shadow: 0 8px 24px rgba(0,0,0,0.45); }
        `.trim();
    }
}

