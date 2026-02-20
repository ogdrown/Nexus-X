<div align="center">
  <img src="public/logosf.png" alt="Nexus X Logo" width="200"/>
  <h1>Nexus X</h1>
  <p><strong>Premium Windows System Optimizer — Tauri + React</strong></p>
  <p>
    <img alt="Version" src="https://img.shields.io/badge/version-0.2.0-8b5cf6?style=flat-square"/>
    <img alt="Platform" src="https://img.shields.io/badge/platform-Windows-blue?style=flat-square"/>
    <img alt="Built with Tauri" src="https://img.shields.io/badge/built_with-Tauri_v2-24C8D8?style=flat-square"/>
  </p>
</div>

---

## Sobre o Projeto

**Nexus X** é um aplicativo de desktop moderno exclusivo para Windows que automatiza otimizações de desempenho do sistema com um único clique. Com backend em Rust via [Tauri v2](https://tauri.app/), a aplicação se comunica diretamente com a API nativa do Windows para resultados reais — sem scripts PowerShell nem gambiarras.

Na versão **0.2.0**, o app ganhou otimizador dedicado para jogos (League of Legends), otimizador de rede/ping, redesign completo da interface e muito mais.

---

## Funcionalidades — v0.2.0

### Otimizar RAM
- Liberacao profunda de memoria via `EmptyWorkingSet` (Win32 API) em todos os processos ativos
- Exibe percentual e uso atual em tempo real (atualiza a cada 3s)
- Retorna quantos MB/GB foram efetivamente liberados

### Limpar Cache
- Remove arquivos temporarios de `%TEMP%`, `Windows\Temp` e Prefetch
- Calcula o tamanho do lixo antes e depois da limpeza
- Exibe espaco liberado em disco

### Otimizar Jogos (League of Legends)
- Selecao de jogo com icone dedicado
- 3 modos de desempenho: **Maximo FPS (720p)**, **Balanceado (900p)**, **Competitivo (1024x768)**
- Modificacao automatica do `game.cfg` com backup antes de qualquer alteracao
- Configuracoes aplicadas: resolucao, sombras, efeitos, VSync, antialiasing, iluminacao por pixel e mais
- Ativacao do plano de energia Alto Desempenho
- Desativacao do Xbox Game Bar e Game DVR
- Prioridade de CPU definida como Alta via registro IFEO
- Botao de restauracao que reverte tudo para o estado original

### Otimizar Rede
- Flush do cache DNS (`ipconfig /flushdns`)
- Ativacao do Direct Cache Access (DCA) via `netsh`
- Desativacao do throttling de rede (`NetworkThrottlingIndex = 0xFFFFFFFF`)
- Reducao do `SystemResponsiveness` para priorizar jogos
- Desativacao do algoritmo de Nagle (TCPNoDelay) para menor latencia TCP

### Interface
- Design inspirado no ExitLag — minimalista, dark mode profundo
- Tipografia Inter com hierarquia limpa
- Icones Lucide (sem emojis)
- Sidebar com secoes separadas e pills de navegacao
- Barra de progresso animada em tempo real via eventos Tauri
- Toast de status no canto inferior direito

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| UI | React 19 + TypeScript + Vite |
| Estilos | Vanilla CSS (design system proprio) |
| Icones | Lucide React |
| Backend | Rust + Tauri v2 |
| Sistema | windows-rs (Win32 API), winreg, sysinfo |

---

## Rodando Localmente

### Pre-requisitos
- [Node.js](https://nodejs.org/)
- [Rust & Cargo](https://rustup.rs/) + C++ Build Tools do Visual Studio
- [Tauri CLI prerequisites](https://tauri.app/guides/prerequisites)

### Comandos

```bash
# Instalar dependencias
npm install

# Iniciar em modo dev
npm run tauri dev

# Gerar instalador .exe (NSIS)
npm run tauri build
```

> O instalador gerado estara em `src-tauri/target/release/bundle/nsis/`.

---

## Aviso Legal

Este aplicativo interage diretamente com o gerenciamento de memoria, registro e arquivos de sistema do Windows. O uso e fornecido **"como esta"**. Sempre crie backups dos seus dados importantes. O autor nao se responsabiliza por instabilidades causadas pelo uso do software.

---

## Licenca
Distribuido sob EULA interno com bases compativeis com MIT.

<div align="center">
  <sub>Criado por Drown &middot; v0.2.0</sub>
</div>
