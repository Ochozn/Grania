
# Script para Automatizar Cloudflare Tunnel + Webhook Telegram
# Este script reinicia o túnel automaticamente e atualiza o Webhook do Telegram sempre que a URL muda.

$ErrorActionPreference = "Stop"

# --- CONFIGURAÇÃO ---
# Lê o token do arquivo .env
$EnvContent = Get-Content "$PSScriptRoot\supabase\functions\telegram-webhook\.env" -Raw
$TelegramBotToken = $null
if ($EnvContent -match "TELEGRAM_BOT_TOKEN=(.+)") {
    $TelegramBotToken = $Matches[1].Trim()
} else {
    Write-Error "Token do Telegram não encontrado no .env!"
    exit 1
}
$LocalPort = "54321"
$FunctionPath = "/functions/v1/telegram-webhook"
$CloudflaredUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
$ExePath = "$PSScriptRoot\cloudflared.exe"

# --- 1. BAIXAR CLOUDFLARED (Se não existir) ---
if (-not (Test-Path $ExePath)) {
    Write-Host "📥 Baixando cloudflared..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $CloudflaredUrl -OutFile $ExePath
    Write-Host "✅ Cloudflared baixado!" -ForegroundColor Green
}

# --- LOOP INFINITO DE EXECUÇÃO ---
while ($true) {
    Write-Host "`n🚀 Iniciando Túnel Cloudflare..." -ForegroundColor Cyan
    
    # Inicia o cloudflared e redireciona stderr para stdout para podermos ler a URL
    $ProcessInfo = New-Object System.Diagnostics.ProcessStartInfo
    $ProcessInfo.FileName = $ExePath
    $ProcessInfo.Arguments = "tunnel --url http://127.0.0.1:$LocalPort"
    $ProcessInfo.RedirectStandardOutput = $true
    $ProcessInfo.RedirectStandardError = $true
    $ProcessInfo.UseShellExecute = $false
    $ProcessInfo.CreateNoWindow = $true

    $Process = New-Object System.Diagnostics.Process
    $Process.StartInfo = $ProcessInfo
    $Process.Start() | Out-Null

    # Variável para guardar a URL
    $TunnelUrl = $null

    # Lê o output linha por linha até achar a URL
    while (-not $Process.HasExited) {
        $Line = $Process.StandardError.ReadLine()
        if ($Line -match "https://[a-zA-Z0-9-]+\.trycloudflare\.com") {
            $TunnelUrl = $Matches[0]
            Write-Host "🌍 URL do Túnel encontrada: $TunnelUrl" -ForegroundColor Green
            break
        }
    }

    if ($TunnelUrl) {
        # --- 2. ATUALIZAR TELEGRAM WEBHOOK ---
        $WebhookUrl = "$TunnelUrl$FunctionPath"
        Write-Host "🔄 Atualizando Webhook no Telegram para: $WebhookUrl" -ForegroundColor Yellow
        
        try {
            $ApiUrl = "https://api.telegram.org/bot$TelegramBotToken/setWebhook?url=$WebhookUrl"
            $Response = Invoke-RestMethod -Uri $ApiUrl -Method Get
            
            if ($Response.ok) {
                Write-Host "✅ Webhook atualizado com SUCESSO!" -ForegroundColor Green
            } else {
                Write-Host "❌ Erro ao atualizar Webhook: $($Response.description)" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Falha na requisição ao Telegram: $_" -ForegroundColor Red
        }

        # Monitora o processo até ele fechar
        while (-not $Process.HasExited) {
            Start-Sleep -Seconds 2
        }
    } else {
        Write-Host "❌ Não foi possível obter a URL do túnel." -ForegroundColor Red
    }

    # Limpeza antes de reiniciar
    if (-not $Process.HasExited) {
        $Process.Kill()
    }
    
    Write-Host "⚠️ O túnel caiu! Reiniciando em 5 segundos..." -ForegroundColor Red
    Start-Sleep -Seconds 5
}
