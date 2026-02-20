<div align="center">
  <img src="public/logosf.png" alt="Nexus X Logo" width="200"/>
  <h1>Nexus X</h1>
  <p><strong>A Premium System Windows Optimizer built with Tauri & React</strong></p>
</div>

---

## 🚀 Sobre o Projeto

**Nexus X** é uma aplicação de desktop moderna projetada exclusivamente para sistemas corporativos e pessoais Windows com o objetivo de realizar otimizações de Memória RAM e limpeza de Disco profundo com segurança e eficiência máxima. Aproveitando a força da linguagem Rust no backend através do framework [Tauri](https://tauri.app/), e uma interface de usuário super rápida utilizando **React, TypeScript e Vite**, ele entrega resultados reais na palma da sua mão.

Em vez de métodos convencionais, o Nexus X se comunica diretamente com a API Nativa do Windows (`windows-rs`) via chamadas diretas como `EmptyWorkingSet`, removendo com força bruta os processos dormentes ou vazamentos (leaks) retidos na Memória RAM Física por programas em segundo plano.

## ✨ Funcionalidades Principais

* ⚡ **Limpeza Profunda de RAM:** Liberação da memória nativa invocando despejos do *Working Set* em todos os processos ativos, resultando na devolução real de Gigabytes livres ao sistema.
* 🗑️ **Limpa Cache Avançado:** Remoção inteligente de arquivos temporários, despejos de sistema e lixeiras para liberação de Disco.
* 🎨 **UI Premium Moderna:** Uma interface *Dark Mode* desenvolvida em Vanilla CSS com temática Glassmorphism roxo e efeitos interativos de destaque.
* 🪶 **Alta Performance e Leveza:** Graças ao compilador em Rust (Tauri), o instalador empacotado consome muito menos memória e CPU em inatividade se comparado a aplicações convencionais feitas puramente em Node ou Electron.
* 📱 **Layout Totalmente Responsivo:** Redimensionamento inteligente do *Dashboard* e da Barra de Navegação para telas pequenas / modo compacto.

## 🛠️ Tecnologias Utilizadas

**Frontend:**
- [React 18](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Lucide Icons](https://lucide.dev/)
- Vanilla CSS 

**Backend:**
- [Rust](https://www.rust-lang.org/)
- [Tauri v2](https://v2.tauri.app/)
- [sysinfo](https://github.com/GuillaumeGomez/sysinfo) para métricas de performance do hardware. 
- [windows-rs crate](https://github.com/microsoft/windows-rs) (Win32 API) para comunicação privilegiada entre kernel/processos no módulo de limpeza.

## ⚙️ Compilando e Rodando Localmente

Para rodar este projeto na sua máquina e modificar o código fonte:

### Pré-requisitos
Certifique-se de ter os componentes de build instalados no seu Windows:
- [Node.js](https://nodejs.org/en)
- [Rust & Cargo](https://rustup.rs/) (Siga o guia incluindo C++ Build Tools do Visual Studio)
- [Tauri CLI requirements](https://tauri.app/v1/guides/getting-started/prerequisites)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/drown/nexus-x.git
cd nexus-x
```

2. Instale as dependências do Frontend (Javascript/React):
```bash
npm install
```

3. Inicie o Servidor de Desenvolvimento Local:
```bash
npm run tauri dev
```

4. *(Opcional)* Empacote a build final para distribuição `.exe` de Produção:
```bash
npm run tauri build
```
*(As builds compiladas serão geradas na pasta interna de empacotamento (`src-tauri/target/release` ou compilador manual em `installer`)).*


## ⚠️ Aviso Legal e Isenção de Responsabilidade

Este aplicativo interage diretamente com o gerenciamento de memória do sistema operacional Windows para otimizar a RAM e manipula arquivos em pastas assinaladas como temporárias. O seu uso é fornecido **"como está"** (As is). O autor não se responsabiliza pela estabilidade do sistema host ou potencial encerramento forçado de programas mal-comportados durante o uso do Otimizador. Sempre salve seus arquivos em andamento antes de ejetar o "Working Set".

## 📝 Licença
Distribuído nos termos definidos pelo EULA interno (*End User License Agreement*) com bases na licença MIT Open Source em camadas compatíveis.

<div align="center">
  <sub>Criado com ❤️ por Drown.</sub>
</div>
