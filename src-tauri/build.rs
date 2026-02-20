fn main() {
    // Copia o ícone para um caminho sem apóstrofo antes de compilar.
    // O RC.EXE do Windows não suporta o caractere ' no caminho do arquivo.
    let icon_src = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("icons")
        .join("icon.ico");
    let icon_clean = std::path::PathBuf::from("C:\\nexusx-icon.ico");

    if icon_src.exists() && !icon_clean.exists() {
        let _ = std::fs::copy(&icon_src, &icon_clean);
    }

    // Usa o caminho limpo (sem apóstrofo) para o ícone da janela no Windows.
    let windows_attrs =
        tauri_build::WindowsAttributes::new().window_icon_path("C:\\nexusx-icon.ico");

    let attrs = tauri_build::Attributes::new().windows_attributes(windows_attrs);

    tauri_build::try_build(attrs).expect("Falha ao compilar recursos do Tauri");
}
