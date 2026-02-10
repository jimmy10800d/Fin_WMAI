param(
    [string]$Model = "llama3.1:8b"
)

$ErrorActionPreference = "Stop"

function Test-Command {
    param([string]$Name)
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$prototypeDir = Join-Path $repoRoot "prototype"

if (!(Test-Command "node")) {
    Write-Error "Node.js is not available. Install Node.js 18+ and try again."
    exit 1
}

$startOllama = Test-Command "ollama"
if (-not $startOllama) {
    Write-Warning "Ollama is not available. Starting the prototype without Ollama."
}

$global:StopRequested = $false
$cancelSub = Register-ObjectEvent -InputObject ([console]) -EventName CancelKeyPress -SourceIdentifier "ConsoleCancel" -Action {
    $global:StopRequested = $true
    $Event.SourceEventArgs.Cancel = $true
}

$ollamaProcess = $null
$ollamaPull = $null
$nodeProcess = $null

try {
    if ($startOllama) {
        $ollamaProcess = Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Minimized -PassThru
        $ollamaPull = Start-Process -FilePath "ollama" -ArgumentList @("pull", $Model) -WindowStyle Minimized -PassThru
    }

    $nodeProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $prototypeDir -PassThru

    Write-Host "Prototype server: http://localhost:3000/portal.html"
    Write-Host "Press Ctrl+C to stop."

    while (-not $global:StopRequested -and -not $nodeProcess.HasExited) {
        Start-Sleep -Seconds 1
    }
}
finally {
    if ($nodeProcess -and -not $nodeProcess.HasExited) {
        Stop-Process -Id $nodeProcess.Id -Force
    }
    if ($ollamaProcess -and -not $ollamaProcess.HasExited) {
        Stop-Process -Id $ollamaProcess.Id -Force
    }
    if ($ollamaPull -and -not $ollamaPull.HasExited) {
        Stop-Process -Id $ollamaPull.Id -Force
    }

    Unregister-Event -SourceIdentifier "ConsoleCancel" -ErrorAction SilentlyContinue
    Remove-Job -Name "ConsoleCancel" -Force -ErrorAction SilentlyContinue
}
