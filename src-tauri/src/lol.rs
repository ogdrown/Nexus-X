use std::fs;
use std::path::PathBuf;
use std::process::Command;
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
use tauri::Emitter;

#[cfg(target_os = "windows")]
use winreg::enums::*;
#[cfg(target_os = "windows")]
use winreg::RegKey;

#[derive(serde::Deserialize)]
pub struct OptimizeOptions {
    pub mode: String, // "max_fps", "balanced", "competitive"
}

#[derive(serde::Serialize, Clone)]
pub struct ProgressEvent {
    pub step: String,
    pub progress: u32, // 0-100
}

#[tauri::command]
pub async fn optimize_league_of_legends(
    app_handle: tauri::AppHandle,
    options: OptimizeOptions,
) -> Result<String, String> {
    emit_progress(&app_handle, "Iniciando otimização...", 10);

    // 1. Limpeza de Temporários (Temp, Windows\Temp, Prefetch)
    emit_progress(&app_handle, "Limpando arquivos temporários...", 20);
    clean_specific_temp_folders();

    // 2. Modo Desempenho do Windows
    emit_progress(&app_handle, "Ativando modo de alto desempenho...", 40);
    set_high_performance_plan();

    // 3. Desativar Interferências e Priorizar Jogo (Apenas no Windows)
    emit_progress(&app_handle, "Configurando prioridade e overlays...", 60);
    #[cfg(target_os = "windows")]
    {
        let _ = disable_overlays();
        let _ = set_game_priority();
    }

    // 4. Modificar game.cfg
    emit_progress(&app_handle, "Ajustando configurações gráficas do jogo...", 80);
    let cfg_result = modify_game_cfg(&options.mode);

    emit_progress(&app_handle, "Otimização concluída!", 100);

    match cfg_result {
        Ok(_) => Ok("Configurações aplicadas com sucesso.".to_string()),
        Err(e) => Ok(format!("Otimizações do sistema aplicadas, mas houve erro no game.cfg: {}", e)),
    }
}

#[tauri::command]
pub async fn restore_league_of_legends() -> Result<String, String> {
    restore_game_cfg()
        .map(|_| "Configurações restauradas com sucesso.".to_string())
        .map_err(|e| e.to_string())
}

fn emit_progress(app_handle: &tauri::AppHandle, step: &str, progress: u32) {
    let _ = app_handle.emit("optimization-progress", ProgressEvent {
        step: step.to_string(),
        progress,
    });
}

fn clean_specific_temp_folders() {
    let folders = vec![
        std::env::temp_dir(),
        PathBuf::from(r"C:\Windows\Temp"),
        PathBuf::from(r"C:\Windows\Prefetch"),
    ];

    for folder in folders {
        if folder.exists() {
            let _ = crate::clean_dir_recursive(&folder); // Usa a função existente do lib.rs
        }
    }
}

fn set_high_performance_plan() {
    #[cfg(target_os = "windows")]
    {
        let _ = Command::new("powercfg")
            .args(["-setactive", "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c"])
            .creation_flags(0x08000000) // CREATE_NO_WINDOW
            .output();
        
        // Desativar efeitos visuais (PerformanceOptions)
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        if let Ok((key, _)) = hkcu.create_subkey(r"Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects") {
            let _ = key.set_value("VisualFXSetting", &2u32); // 2 = Adjust for best performance
        }
    }
}

#[cfg(target_os = "windows")]
fn disable_overlays() -> Result<(), std::io::Error> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    
    // Xbox Game Bar
    if let Ok((key, _)) = hkcu.create_subkey(r"Software\Microsoft\GameBar") {
        let _ = key.set_value("AutoGameModeEnabled", &1u32); // Game Mode ON
        let _ = key.set_value("AllowAutoGameMode", &1u32);
        let _ = key.set_value("ShowStartupPanel", &0u32);
    }
    
    if let Ok((key, _)) = hkcu.create_subkey(r"System\GameConfigStore") {
        let _ = key.set_value("GameDVR_Enabled", &0u32);
        let _ = key.set_value("GameDVR_FSEBehaviorMode", &2u32);
    }

    Ok(())
}

#[cfg(target_os = "windows")]
fn set_game_priority() -> Result<(), std::io::Error> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let path = r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\League of Legends.exe\PerfOptions";
    
    // Tentativa de criar subchave (Requer ADMIN para funcionar totalmente)
    if let Ok((key, _)) = hklm.create_subkey(path) {
        let _ = key.set_value("CpuPriorityClass", &3u32); // 3 = High Priority
    }
    
    Ok(())
}

fn get_game_cfg_path() -> PathBuf {
    PathBuf::from(r"C:\Riot Games\League of Legends\Config\game.cfg")
}

fn modify_game_cfg(mode: &str) -> std::io::Result<()> {
    let path = get_game_cfg_path();
    if !path.exists() {
        return Err(std::io::Error::new(std::io::ErrorKind::NotFound, "game.cfg não encontrado. O jogo já foi aberto pelo menos uma vez?"));
    }

    // Criar backup
    let backup_path = path.with_extension("cfg.backup");
    if !backup_path.exists() {
        fs::copy(&path, &backup_path)?;
    }

    let content = fs::read_to_string(&path)?;
    let mut new_content = String::new();

    let (width, height) = match mode {
        "max_fps" => ("1280", "720"),
        "competitive" => ("1024", "768"),
        "balanced" => ("1600", "900"),
        _ => ("1280", "720"),
    };

    let mut overrides: std::collections::HashMap<&str, &str> = [
        ("WindowMode", "0"), // Fullscreen
        ("Width", width),
        ("Height", height),
        ("Graphics", "0"),
        ("Shadows", "0"),
        ("EffectsQuality", "0"),
        ("EnvironmentQuality", "0"),
        ("CharacterQuality", "0"),
        ("CharacterInking", "0"),
        ("FrameCapType", "2"), // 2 generally é Uncapped
        ("WaitForVerticalSync", "0"),
        ("EnableParticleOptimizations", "1"),
        // Extreme Low End Options
        ("PerPixelPointLighting", "0"),
        ("AdvancedReflection", "0"),
        ("EnableHUDAnimations", "0"),
        ("DisableScreenShake", "1"),
        ("Antialiasing", "0"),
        ("SoftwareMouse", "0"),
    ]
    .iter()
    .cloned()
    .collect();

    for line in content.lines() {
        let mut appended = false;
        if let Some(eq_pos) = line.find('=') {
            let key = &line[0..eq_pos].trim();
            if let Some(new_val) = overrides.get(key) {
                new_content.push_str(&format!("{}={}\r\n", key, new_val));
                appended = true;
            }
        }
        
        if !appended {
            new_content.push_str(line);
            new_content.push_str("\r\n");
        }
    }

    fs::write(&path, new_content)?;
    Ok(())
}

fn restore_game_cfg() -> std::io::Result<()> {
    let path = get_game_cfg_path();
    let backup_path = path.with_extension("cfg.backup");
    
    if backup_path.exists() {
        fs::copy(&backup_path, &path)?;
        Ok(())
    } else {
        Err(std::io::Error::new(std::io::ErrorKind::NotFound, "Nenhum backup encontrado."))
    }
}
