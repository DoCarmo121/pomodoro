import React from 'react';
import './App.css';

export const App: React.FC = () => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Gestão de Foco (Pomodoro)</h1>
      </header>

      <main className="app-main-layout">
        <section className="temporizador-secao" aria-label="Temporizador de Foco">
          <h2>Temporizador</h2>
          <p>Ambiente configurado com sucesso. Pronto para a Fase 1.</p>
        </section>

        <aside className="tarefas-secao" aria-label="Painel de Tarefas">
          <h2>Tarefas</h2>
          <p>Painel de tarefas lateral em desktop.</p>
        </aside>
      </main>
    </div>
  );
};

export default App;

