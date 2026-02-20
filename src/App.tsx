import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Zap, Settings, Cpu, HardDrive, Trash2 } from "lucide-react";
import "./App.css";

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0.00 MB";
  const k = 1024;
  const mb = bytes / (k * k);
  if (mb >= 1024) {
    return (mb / 1024).toFixed(2) + " GB";
  }
  return mb.toFixed(2) + " MB";
};

function RamOptimizer() {
  const [ramTotal, setRamTotal] = useState<number>(0);
  const [ramUsed, setRamUsed] = useState<number>(0);
  const [isCleaningRam, setIsCleaningRam] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; show: boolean }>({ text: "", show: false });

  const fetchStats = async () => {
    try {
      const [total, used] = await invoke<[number, number]>("get_system_memory");
      setRamTotal(total);
      setRamUsed(used);
    } catch (error) {
      console.error("Error fetching RAM stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const showStatus = (text: string) => {
    setStatusMessage({ text, show: true });
    setTimeout(() => {
      setStatusMessage((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleCleanRam = async () => {
    setIsCleaningRam(true);
    try {
      const cleanedBytes = await invoke<number>("clean_ram");
      await fetchStats();
      if (cleanedBytes > 1024 * 1024) {
        showStatus(`⚡ Memória Otimizada! ${formatBytes(cleanedBytes)} reais liberados.`);
      } else {
        showStatus("⚡ Memória já estava em estado ideal.");
      }
    } catch (error) {
      console.error("Error cleaning RAM:", error);
      showStatus("Erro ao tentar limpar a Memória RAM.");
    } finally {
      setIsCleaningRam(false);
    }
  };

  const calculateRamPercentage = () => {
    if (ramTotal === 0) return 0;
    return Math.min(100, Math.round((ramUsed / ramTotal) * 100));
  };

  return (
    <div className="dashboard-view animate-fade-in">
      <header className="view-header">
        <h2>Otimizador de RAM</h2>
        <p>Acelere o sistema liberando memória física</p>
      </header>

      <div className="stats-grid single">
        <div className="stat-card">
          <div className="stat-header">
            <span className="icon-label ram"><Cpu size={16} /> RAM</span>
            <span className="stat-title">Memória em Uso</span>
          </div>
          <div className="stat-body">
            <div className="value">{calculateRamPercentage()}%</div>
            <div className="sub-value">
              {formatBytes(ramUsed)} / {formatBytes(ramTotal)}
            </div>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill ram"
              style={{ width: `${calculateRamPercentage()}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="actions">
        <button
          className={`btn btn-primary ${isCleaningRam ? 'loading' : ''}`}
          onClick={handleCleanRam}
          disabled={isCleaningRam}
        >
          <Zap size={18} />
          OTIMIZAR RAM
        </button>
      </div>

      <div className={`status-message ${statusMessage.show ? 'show' : 'hidden'}`}>
        {statusMessage.text}
      </div>
    </div>
  );
}

function CacheCleaner() {
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [isCleaningCache, setIsCleaningCache] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; show: boolean }>({ text: "", show: false });

  const fetchStats = async () => {
    try {
      const cache = await invoke<number>("get_cache_size");
      setCacheSize(cache);
    } catch (error) {
      console.error("Error fetching cache stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const showStatus = (text: string) => {
    setStatusMessage({ text, show: true });
    setTimeout(() => {
      setStatusMessage((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleCleanCache = async () => {
    setIsCleaningCache(true);
    try {
      const cleanedBytes = await invoke<number>("clean_cache");
      await fetchStats();
      if (cleanedBytes > 0) {
        showStatus(`🗑️ Cache Limpo! ${formatBytes(cleanedBytes)} de lixo removidos.`);
      } else {
        showStatus("🗑️ Sistema limpo. Nenhum lixo temporário encontrado.");
      }
    } catch (error) {
      console.error("Error cleaning cache:", error);
      showStatus("Erro ao tentar limpar o cache.");
    } finally {
      setIsCleaningCache(false);
    }
  };

  const calculateCachePercentage = () => {
    const maxCacheExpected = 5 * 1024 * 1024 * 1024;
    if (cacheSize === 0) return 0;
    let pct = (cacheSize / maxCacheExpected) * 100;
    if (pct < 2 && cacheSize > 0) pct = 2;
    return Math.min(100, pct);
  };

  return (
    <div className="dashboard-view animate-fade-in">
      <header className="view-header">
        <h2>Limpeza de Cache</h2>
        <p>Remova arquivos temporários desnecessários do disco</p>
      </header>

      <div className="stats-grid single">
        <div className="stat-card">
          <div className="stat-header">
            <span className="icon-label cache"><HardDrive size={16} /> CACHE</span>
            <span className="stat-title">Lixo Temporário</span>
          </div>
          <div className="stat-body">
            <div className="value">{formatBytes(cacheSize)}</div>
            <div className="sub-value">Ocupando o Disco</div>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill cache"
              style={{ width: `${calculateCachePercentage()}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="actions">
        <button
          className={`btn btn-secondary ${isCleaningCache ? 'loading' : ''}`}
          onClick={handleCleanCache}
          disabled={isCleaningCache}
        >
          <Trash2 size={18} />
          LIMPAR CACHE
        </button>
      </div>

      <div className={`status-message ${statusMessage.show ? 'show' : 'hidden'}`}>
        {statusMessage.text}
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="settings-view animate-fade-in">
      <header className="view-header">
        <h2>Configurações Adicionais</h2>
        <p>Prepare o sistema para novas funções avançadas futuras</p>
      </header>

      <div className="placeholder-content">
        <div className="placeholder-card">
          <Settings size={32} className="placeholder-icon" />
          <h3>Em Breve</h3>
          <p>Opções avançadas de otimização de rede e limpeza de registro estarão disponíveis nas próximas atualizações.</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<'ram' | 'cache' | 'settings'>('ram');

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="sidebar-brand">
          <img src="/logosf.png" alt="NEXUS X" className="brand-logo" />
        </div>

        <ul className="nav-links">
          <li>
            <button
              className={`nav-btn ${activeTab === 'ram' ? 'active' : ''}`}
              onClick={() => setActiveTab('ram')}
            >
              <Zap size={20} /> Otimizar RAM
            </button>
          </li>
          <li>
            <button
              className={`nav-btn ${activeTab === 'cache' ? 'active' : ''}`}
              onClick={() => setActiveTab('cache')}
            >
              <Trash2 size={20} /> Limpar Cache
            </button>
          </li>
          <li>
            <button
              className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={20} /> Configurações
            </button>
          </li>
        </ul>

        <div className="sidebar-footer">
          <span className="version">v0.1.0-beta by drown</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="bg-gradient"></div>
        <div className="content-container">
          {activeTab === 'ram' && <RamOptimizer />}
          {activeTab === 'cache' && <CacheCleaner />}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

export default App;
