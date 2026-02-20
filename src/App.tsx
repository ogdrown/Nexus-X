import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import {
  Zap, Trash2, Gamepad2, Wifi, Settings,
  Cpu, HardDrive, Check, RotateCcw, ChevronRight,
  Shield, Activity, Database
} from "lucide-react";
import "./App.css";

// ─── Utilities ────────────────────────────────────────────
const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? (mb / 1024).toFixed(2) + " GB" : mb.toFixed(0) + " MB";
};

// ─── RAM Optimizer ────────────────────────────────────────
function RamOptimizer() {
  const [ramTotal, setRamTotal] = useState(0);
  const [ramUsed, setRamUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ text: "", show: false });

  const fetchStats = async () => {
    try {
      const [total, used] = await invoke<[number, number]>("get_system_memory");
      setRamTotal(total);
      setRamUsed(used);
    } catch { }
  };

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 3000);
    return () => clearInterval(id);
  }, []);

  const pct = ramTotal > 0 ? Math.min(100, Math.round((ramUsed / ramTotal) * 100)) : 0;
  const isDanger = pct >= 80;

  const showToast = (text: string) => {
    setToast({ text, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const freed = await invoke<number>("clean_ram");
      await fetchStats();
      if (freed > 1024 * 1024) showToast(`Memória otimizada — ${formatBytes(freed)} liberados`);
      else showToast("Memória já estava em estado ideal");
    } catch {
      showToast("Erro ao otimizar a memória");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="view-header">
        <h2>Otimizador de RAM</h2>
        <p>Libere memória física e acelere o sistema</p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="stat-row">
          <div className="stat-label">
            <Cpu size={14} />
            Memória em uso
          </div>
          <div className={`stat-badge ${isDanger ? "danger" : ""}`}>
            <Activity size={11} />
            {pct}%
          </div>
        </div>

        <div className="stat-value">{formatBytes(ramUsed)}</div>
        <div className="stat-unit">de {formatBytes(ramTotal)} total</div>

        <div className="progress-track">
          <div className={`progress-fill ${isDanger ? "danger" : ""}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="actions">
        <button
          className={`btn btn-primary btn-full ${loading ? "loading" : ""}`}
          onClick={handleOptimize}
          disabled={loading}
        >
          {!loading && <Zap size={15} />}
          {loading ? "" : "Otimizar RAM"}
        </button>
      </div>

      <div className={`status-message ${toast.show ? "show" : ""}`}>{toast.text}</div>
    </div>
  );
}

// ─── Cache Cleaner ────────────────────────────────────────
function CacheCleaner() {
  const [cacheSize, setCacheSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ text: "", show: false });

  const fetchStats = async () => {
    try {
      const c = await invoke<number>("get_cache_size");
      setCacheSize(c);
    } catch { }
  };

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 3000);
    return () => clearInterval(id);
  }, []);

  const showToast = (text: string) => {
    setToast({ text, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };

  const handleClean = async () => {
    setLoading(true);
    try {
      const freed = await invoke<number>("clean_cache");
      await fetchStats();
      if (freed > 0) showToast(`Cache limpo — ${formatBytes(freed)} removidos`);
      else showToast("Nenhum arquivo temporário encontrado");
    } catch {
      showToast("Erro ao limpar cache");
    } finally {
      setLoading(false);
    }
  };

  const pct = Math.min(100, (cacheSize / (5 * 1024 * 1024 * 1024)) * 100);

  return (
    <div className="animate-fade-in">
      <div className="view-header">
        <h2>Limpeza de Cache</h2>
        <p>Remova arquivos temporários e libere espaço em disco</p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="stat-row">
          <div className="stat-label">
            <HardDrive size={14} />
            Arquivos temporários
          </div>
          <div className="stat-badge">
            <Database size={11} />
            Cache
          </div>
        </div>

        <div className="stat-value">{formatBytes(cacheSize)}</div>
        <div className="stat-unit">ocupando espaço em disco</div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="actions">
        <button
          className={`btn btn-primary btn-full ${loading ? "loading" : ""}`}
          onClick={handleClean}
          disabled={loading}
        >
          {!loading && <Trash2 size={15} />}
          {loading ? "" : "Limpar Cache"}
        </button>
      </div>

      <div className={`status-message ${toast.show ? "show" : ""}`}>{toast.text}</div>
    </div>
  );
}

// ─── Network Optimizer ────────────────────────────────────
function NetworkOptimizer() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    const setup = async () => {
      unlisten = await listen<{ step: string; progress: number }>(
        "network-optimization-progress",
        (e) => {
          setStatusText(e.payload.step);
          setProgress(e.payload.progress);
          if (e.payload.progress === 100) {
            setTimeout(() => { setIsOptimizing(false); setIsDone(true); }, 800);
          }
        }
      );
    };
    setup();
    return () => { if (unlisten) unlisten(); };
  }, []);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setIsDone(false);
    setProgress(0);
    setStatusText("Iniciando...");
    try {
      await invoke("optimize_network");
    } catch {
      setIsOptimizing(false);
    }
  };

  const features = [
    { icon: <Database size={14} />, title: "Flush DNS", desc: "Limpa o cache DNS desatualizado" },
    { icon: <Activity size={14} />, title: "TCP DCA", desc: "Ativa Direct Cache Access" },
    { icon: <Shield size={14} />, title: "Throttling", desc: "Remove limite de largura de banda" },
    { icon: <Zap size={14} />, title: "Responsividade", desc: "Prioriza rede sobre processos de fundo" },
    { icon: <Wifi size={14} />, title: "Nagle Desativado", desc: "Envia pacotes TCP imediatamente" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="view-header">
        <h2>Otimizar Rede</h2>
        <p>Reduza a latência e melhore a estabilidade da conexão</p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="stat-row">
          <div className="stat-label"><Wifi size={14} /> Otimizações de rede</div>
          <div className="stat-badge"><Shield size={11} /> {features.length} ajustes</div>
        </div>
        <div className="net-features">
          {features.map((f, i) => (
            <div className="net-feature-row" key={i}>
              <div className="net-feature-icon">{f.icon}</div>
              <div className="net-feature-info">
                <div className="net-feature-title">{f.title}</div>
                <div className="net-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="actions col">
        {isOptimizing ? (
          <div className="progress-container">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            <div className="progress-overlay-text">{statusText}</div>
          </div>
        ) : isDone ? (
          <div className="success-state animated-enter">
            <Check size={52} className="success-icon" />
            <h3>Rede otimizada!</h3>
            <p>Todos os ajustes de rede foram aplicados com sucesso.</p>
            <button className="btn btn-ghost" onClick={() => setIsDone(false)}>
              <RotateCcw size={14} /> Otimizar novamente
            </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-full" onClick={handleOptimize}>
            <Wifi size={15} /> Otimizar Rede
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Game Optimizer ───────────────────────────────────────
type GameStep = "selection" | "optimization" | "success";
type GameMode = "max_fps" | "balanced" | "competitive";

const MODES: { id: GameMode; label: string; sub: string }[] = [
  { id: "max_fps", label: "Maximo FPS", sub: "720p" },
  { id: "balanced", label: "Balanceado", sub: "900p" },
  { id: "competitive", label: "Competitivo", sub: "1024x768" },
];

function GameOptimizer() {
  const [step, setStep] = useState<GameStep>("selection");
  const [mode, setMode] = useState<GameMode>("max_fps");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [toast, setToast] = useState({ text: "", show: false });

  const showToast = (text: string) => {
    setToast({ text, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 4000);
  };

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    const setup = async () => {
      unlisten = await listen<{ step: string; progress: number }>(
        "optimization-progress",
        (e) => {
          setStatusText(e.payload.step);
          setProgress(e.payload.progress);
          if (e.payload.progress === 100) {
            setTimeout(() => { setIsOptimizing(false); setStep("success"); }, 800);
          }
        }
      );
    };
    setup();
    return () => { if (unlisten) unlisten(); };
  }, []);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setProgress(0);
    setStatusText("Iniciando...");
    try {
      await invoke("optimize_league_of_legends", { options: { mode } });
    } catch {
      setIsOptimizing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await invoke("restore_league_of_legends");
      showToast("Configuracoes restauradas com sucesso");
    } catch (e) {
      showToast(`Erro ao restaurar: ${e}`);
    } finally {
      setIsRestoring(false);
    }
  };

  const optimizationItems = [
    "Limpeza de cache temporário e Prefetch",
    "Ativacao de modo de alto desempenho",
    "Ajuste grafico no game.cfg",
    "Reducao de resolucao e sombras",
    "Processo priorizado (High Priority)",
    "Overlays desativados",
  ];

  return (
    <div className="animate-fade-in">
      <div className="view-header">
        <h2>Otimizar Jogos</h2>
        <p>Configure o sistema para maximo desempenho no jogo</p>
      </div>

      {step === "selection" && (
        <div className="animated-enter">
          <div className="game-card-grid">
            <div className="game-card selected" onClick={() => setStep("optimization")}>
              <div className="game-icon-wrapper">
                <img src="/lol.png" alt="League of Legends" className="game-icon-img" />
              </div>
              <div className="game-card-name">League of Legends</div>
              <div className="chip active">
                <ChevronRight size={11} /> Selecionar
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "optimization" && (
        <div className="animated-enter">
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="stat-row">
              <div className="stat-label"><Gamepad2 size={14} /> League of Legends</div>
            </div>
            <div className="mode-tabs">
              {MODES.map(m => (
                <button
                  key={m.id}
                  className={`mode-tab ${mode === m.id ? "active" : ""}`}
                  onClick={() => setMode(m.id)}
                  disabled={isOptimizing}
                >
                  {m.label}
                  <span className="mode-tab-label">{m.sub}</span>
                </button>
              ))}
            </div>
            <ul className="opt-list">
              {optimizationItems.map((item, i) => (
                <li key={i}>
                  <Check size={13} className="check-icon" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="actions col">
            {isOptimizing ? (
              <div className="progress-container">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
                <div className="progress-overlay-text">{statusText}</div>
              </div>
            ) : (
              <>
                <button className="btn btn-primary btn-full" onClick={handleOptimize}>
                  <Zap size={15} /> Otimizar Agora
                </button>
                <button
                  className="btn btn-ghost btn-full"
                  onClick={handleRestore}
                  disabled={isRestoring}
                >
                  <RotateCcw size={14} />
                  {isRestoring ? "Restaurando..." : "Restaurar configuracoes"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="success-state animated-enter">
          <Check size={56} className="success-icon" />
          <h3>Otimizacao concluida!</h3>
          <p>
            Configuracoes de {MODES.find(m => m.id === mode)?.label} aplicadas com sucesso.
            Seu jogo esta pronto para o maximo desempenho.
          </p>
          <button className="btn btn-ghost" onClick={() => setStep("selection")}>
            <RotateCcw size={14} /> Voltar
          </button>
        </div>
      )}

      <div className={`status-message ${toast.show ? "show" : ""}`}>{toast.text}</div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────
function SettingsView() {
  return (
    <div className="animate-fade-in">
      <div className="view-header">
        <h2>Configuracoes</h2>
        <p>Opcoes avancadas e preferencias do sistema</p>
      </div>
      <div className="placeholder-card">
        <Settings size={36} />
        <h3>Em breve</h3>
        <p>Opcoes avancadas de otimizacao de rede, limpeza de registro e mais estao chegando em proximas atualizacoes.</p>
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────
type Tab = "ram" | "cache" | "network" | "game" | "settings";

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "ram", label: "Otimizar RAM", icon: <Zap size={16} /> },
  { id: "cache", label: "Limpar Cache", icon: <Trash2 size={16} /> },
  { id: "network", label: "Otimizar Rede", icon: <Wifi size={16} /> },
  { id: "game", label: "Otimizar Jogos", icon: <Gamepad2 size={16} /> },
];

function App() {
  const [tab, setTab] = useState<Tab>("ram");

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <img src="/logosf.png" alt="NEXUS X" className="brand-logo" />
        </div>

        <span className="nav-section-label">Ferramentas</span>
        <ul className="nav-links">
          {NAV_ITEMS.map(item => (
            <li key={item.id}>
              <button
                className={`nav-btn ${tab === item.id ? "active" : ""}`}
                onClick={() => setTab(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <span className="nav-section-label">Sistema</span>
        <ul className="nav-links">
          <li>
            <button
              className={`nav-btn ${tab === "settings" ? "active" : ""}`}
              onClick={() => setTab("settings")}
            >
              <span className="nav-icon"><Settings size={16} /></span>
              Configuracoes
            </button>
          </li>
        </ul>

        <div className="sidebar-footer">v0.2.0 &middot; by drown</div>
      </nav>

      <main className="main-content">
        <div className="content-container">
          {tab === "ram" && <RamOptimizer />}
          {tab === "cache" && <CacheCleaner />}
          {tab === "network" && <NetworkOptimizer />}
          {tab === "game" && <GameOptimizer />}
          {tab === "settings" && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

export default App;
