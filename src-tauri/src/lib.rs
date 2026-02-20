use std::fs;
use std::path::PathBuf;
use sysinfo::System;

#[tauri::command]
fn get_system_memory() -> (u64, u64) {
    let mut sys = System::new_all();
    sys.refresh_memory();
    (sys.total_memory(), sys.used_memory())
}

#[tauri::command]
fn get_cache_size() -> u64 {
    let temp_dir = std::env::temp_dir();
    calculate_dir_size(&temp_dir)
}

#[tauri::command]
fn clean_cache() -> Result<u64, String> {
    let temp_dir = std::env::temp_dir();
    let initial_size = calculate_dir_size(&temp_dir);

    // Tenta limpar o diretório temporário recursivamente, ignorando erros para arquivos em uso
    let _ = clean_dir_recursive(&temp_dir);

    let final_size = calculate_dir_size(&temp_dir);
    Ok(initial_size.saturating_sub(final_size))
}

fn calculate_dir_size(path: &PathBuf) -> u64 {
    let mut size = 0;
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            if let Ok(metadata) = entry.metadata() {
                if metadata.is_dir() {
                    size += calculate_dir_size(&entry.path());
                } else {
                    size += metadata.len();
                }
            }
        }
    }
    size
}

fn clean_dir_recursive(path: &PathBuf) -> std::io::Result<()> {
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let _ = clean_dir_recursive(&path);
                let _ = fs::remove_dir(&path);
            } else {
                let _ = fs::remove_file(&path);
            }
        }
    }
    Ok(())
}

#[cfg(target_os = "windows")]
use windows::Win32::Foundation::{CloseHandle, HANDLE};
#[cfg(target_os = "windows")]
use windows::Win32::System::ProcessStatus::EmptyWorkingSet;
#[cfg(target_os = "windows")]
use windows::Win32::System::Threading::{
    GetCurrentProcess, OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_SET_QUOTA,
};

#[tauri::command]
fn clean_ram() -> Result<u64, String> {
    let mut sys = System::new_all();
    sys.refresh_memory();
    let initial_used = sys.used_memory();

    #[cfg(target_os = "windows")]
    {
        unsafe {
            // Limpa o Working Set do próprio otimizador
            let _ = EmptyWorkingSet(GetCurrentProcess());

            // Tenta limpar o Working Set de todos os processos do sistema
            // Nota: Só funciona completamente se o app estiver rodando como Administrador
            use sysinfo::ProcessesToUpdate;
            sys.refresh_processes(ProcessesToUpdate::All, true);
            for (pid, _) in sys.processes() {
                let process_handle = OpenProcess(
                    PROCESS_QUERY_INFORMATION | PROCESS_SET_QUOTA,
                    false,
                    pid.as_u32(),
                );

                if let Ok(handle) = process_handle {
                    let _ = EmptyWorkingSet(handle);
                    let _ = CloseHandle(handle);
                }
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        // Fallback genérico para outros sistemas:
        let memory_to_allocate = (sys.free_memory() as f64 * 0.4) as usize;
        if memory_to_allocate > 1024 * 1024 {
            let mut _sink = Vec::<u8>::with_capacity(memory_to_allocate);
            for i in (0..memory_to_allocate).step_by(4096) {
                _sink.push(0);
            }
        }
    }

    std::thread::sleep(std::time::Duration::from_millis(800)); // Tempo para o SO processar

    sys.refresh_memory();
    let final_used = sys.used_memory();
    Ok(initial_used.saturating_sub(final_used))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_system_memory,
            get_cache_size,
            clean_cache,
            clean_ram
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
