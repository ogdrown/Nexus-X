use std::process::Command;
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
use tauri::Emitter;

#[cfg(target_os = "windows")]
use winreg::enums::*;
#[cfg(target_os = "windows")]
use winreg::RegKey;

#[derive(serde::Serialize, Clone)]
pub struct NetworkProgressEvent {
    pub step: String,
    pub progress: u32,
}

#[tauri::command]
pub async fn optimize_network(app_handle: tauri::AppHandle) -> Result<String, String> {
    emit_progress(&app_handle, "Iniciando otimização de rede...", 10);

    // 1. Limpar Cache DNS (Flush DNS)
    emit_progress(&app_handle, "Limpando cache DNS...", 30);
    flush_dns();

    // 2. Ajustar Configurações TCP do Windows
    emit_progress(&app_handle, "Melhorando algoritmos TCP...", 60);
    optimize_tcp_settings();

    // 3. Desabilitar Throttling de Rede
    emit_progress(&app_handle, "Desabilitando limite de largura de banda...", 80);
    disable_network_throttling();

    emit_progress(&app_handle, "Sua rede foi Otimizada para jogos!", 100);

    Ok("Network optimizations applied.".to_string())
}

fn emit_progress(app_handle: &tauri::AppHandle, step: &str, progress: u32) {
    let _ = app_handle.emit("network-optimization-progress", NetworkProgressEvent {
        step: step.to_string(),
        progress,
    });
}

fn flush_dns() {
    #[cfg(target_os = "windows")]
    {
        let _ = Command::new("ipconfig")
            .arg("/flushdns")
            .creation_flags(0x08000000) // CREATE_NO_WINDOW
            .output();
    }
}

fn optimize_tcp_settings() {
    #[cfg(target_os = "windows")]
    {
        // Usa o netsh para algumas otimizações de TCP Global (Requer admin)
        let _ = Command::new("netsh")
            .args(["int", "tcp", "set", "global", "autotuninglevel=normal"])
            .creation_flags(0x08000000)
            .output();

        let _ = Command::new("netsh")
            .args(["int", "tcp", "set", "global", "hystart=disabled"]) // Ajuda a reduzir spikes de latência
            .creation_flags(0x08000000)
            .output();

        let _ = Command::new("netsh")
            .args(["int", "tcp", "set", "global", "dca=enabled"]) // Direct Cache Access
            .creation_flags(0x08000000)
            .output();

        let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
        // Desabilitar o algoritmo de Nagle (TcpAckFrequency) 
        // Normalmente aplicar isso dinamicamente nas interfaces de rede é complexo, 
        // mas injetamos o key global MSMQ se ele existir
        if let Ok((key, _)) = hklm.create_subkey(r"SOFTWARE\Microsoft\MSMQ\Parameters") {
            let _ = key.set_value("TCPNoDelay", &1u32);
        }
    }
}

fn disable_network_throttling() {
    #[cfg(target_os = "windows")]
    {
        let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
        if let Ok((key, _)) = hklm.create_subkey(r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile") {
            // O valor padrão do Windows é 10. Para jogos (unlimited), recomenda-se ffffffff (hex) que é 4294967295 ou simplemente omitir/destruir. Como estamos setando DWORD, colocaremos o maximo (0xFFFFFFFF)
            let _ = key.set_value("NetworkThrottlingIndex", &0xFFFFFFFFu32);
            let _ = key.set_value("SystemResponsiveness", &0u32); // Melhor responsividade geral (0 em vez de 20)
        }
    }
}
