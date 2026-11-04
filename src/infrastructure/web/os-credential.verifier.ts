import os from 'node:os';
import { execFile } from 'node:child_process';

const WIN32_AUTH_SCRIPT = `
Add-Type -Namespace Win32 -Name NativeAuth -MemberDefinition @"
[DllImport("advapi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
public static extern bool LogonUser(string u, string d, string p, int t, int prv, out IntPtr tok);
[DllImport("kernel32.dll", SetLastError = true)]
public static extern bool CloseHandle(IntPtr h);
"@
$tok = [IntPtr]::Zero
$ok = [Win32.NativeAuth]::LogonUser($env:DIONE_AUTH_USER, ".", $env:DIONE_AUTH_PASS, 3, 0, [ref]$tok)
if (-not $ok) {
    $ok = [Win32.NativeAuth]::LogonUser($env:DIONE_AUTH_USER, $null, $env:DIONE_AUTH_PASS, 2, 0, [ref]$tok)
}
if ($tok -ne [IntPtr]::Zero) { [void][Win32.NativeAuth]::CloseHandle($tok) }
Write-Output "RESULT:$ok"
`.trim();

export class OsCredentialVerifier {
    public getDefaultUsername(): string {
        try {
            return os.userInfo().username || 'admin';
        } catch {
            return process.env.USERNAME || process.env.USER || 'admin';
        }
    }

    public verify(username: string, password: string): Promise<boolean> {
        if (!username?.trim() || !password) return Promise.resolve(false);
        if (process.platform !== 'win32') return Promise.resolve(false);

        return new Promise(resolve => {
            execFile(
                'powershell.exe',
                ['-NoProfile', '-NonInteractive', '-Command', WIN32_AUTH_SCRIPT],
                {
                    timeout: 7000,
                    windowsHide: true,
                    env: {
                        ...process.env,
                        DIONE_AUTH_USER: username.trim(),
                        DIONE_AUTH_PASS: password,
                    },
                },
                (err, stdout) => {
                    if (err) return resolve(false);
                    resolve(String(stdout).includes('RESULT:True'));
                }
            );
        });
    }
}

