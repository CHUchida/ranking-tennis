// =============================================
// script.js - Interface e Controle da Aplicação
// =============================================

(function() {
    'use strict';

    // Instância do gerenciador de dados
    const dados = new GerenciadorDados();
    let jogadorEmEdicao = null;
    let linhaSelecionada = null;

    // Referências DOM
    const DOM = {
        corpoTabela: document.getElementById('corpo-tabela'),
        status: document.getElementById('status'),
        form: document.getElementById('form-jogador'),
        
        // Campos
        nome: document.getElementById('entry_nome'),
        v: document.getElementById('entry_v'),
        d: document.getElementById('entry_d'),
        pontos: document.getElementById('entry_pontos'),
        aces: document.getElementById('entry_aces'),
        duplas: document.getElementById('entry_duplas'),
        quebras: document.getElementById('entry_quebras'),
        saque: document.getElementById('entry_saque'),
        salvos: document.getElementById('entry_salvos'),
        
        // Botões
        btnAdicionar: document.getElementById('btn-adicionar'),
        btnLimpar: document.getElementById('btn-limpar'),
        btnEditar: document.getElementById('btn-editar'),
        btnRemover: document.getElementById('btn-remover'),
        btnReordenar: document.getElementById('btn-reordenar'),
        btnStats: document.getElementById('btn-stats'),
        btnGraficos: document.getElementById('btn-graficos'),
        btnTop3: document.getElementById('btn-top3'),
        btnBuscar: document.getElementById('btn-buscar'),
        btnExportar: document.getElementById('btn-exportar'),
        btnSalvar: document.getElementById('btn-salvar'),
        
        // Status edição
        statusEdicao: document.getElementById('status-edicao'),
        labelEdicao: document.getElementById('label-edicao'),
        btnCancelarEdicao: document.getElementById('btn-cancelar-edicao'),
        
        // Modais
        modalStats: document.getElementById('modal-stats'),
        modalGraficos: document.getElementById('modal-graficos'),
        modalTop3: document.getElementById('modal-top3'),
        modalBusca: document.getElementById('modal-busca'),
        
        statsConteudo: document.getElementById('stats-conteudo'),
        top3Conteudo: document.getElementById('top3-conteudo'),
        inputBusca: document.getElementById('input-busca'),
        btnBuscarExecutar: document.getElementById('btn-buscar-executar'),
        buscaResultados: document.getElementById('busca-resultados'),
        
        // Gráficos
        graficoPontos: document.getElementById('grafico-pontos'),
        graficoVitorias: document.getElementById('grafico-vitorias')
    };

    // ========== Funções Auxiliares ==========

    function obterDadosFormulario() {
        const nome = DOM.nome.value.trim();
        if (!nome) {
            throw new Error('Nome é obrigatório!');
        }

        const dadosJogador = {
            nome: nome,
            v: Utilitarios.converterInt(DOM.v.value),
            d: Utilitarios.converterInt(DOM.d.value),
            pontos: Utilitarios.converterInt(DOM.pontos.value),
            aces: Utilitarios.converterFloat(DOM.aces.value),
            duplas: Utilitarios.converterFloat(DOM.duplas.value),
            quebras: Utilitarios.converterFloat(DOM.quebras.value),
            saque: Utilitarios.converterFloat(DOM.saque.value),
            salvos: Utilitarios.converterFloat(DOM.salvos.value)
        };

        // Validações
        Utilitarios.validarPositivo(dadosJogador.v, 'Vitórias');
        Utilitarios.validarPositivo(dadosJogador.d, 'Derrotas');
        Utilitarios.validarPositivo(dadosJogador.pontos, 'Pontos');
        Utilitarios.validarPositivo(dadosJogador.aces, 'Aces');
        Utilitarios.validarPositivo(dadosJogador.duplas, 'Duplas');
        Utilitarios.validarPositivo(dadosJogador.quebras, 'Quebras');
        Utilitarios.validarPositivo(dadosJogador.saque, '% Saque');
        Utilitarios.validarPositivo(dadosJogador.salvos, '% Salvos');

        return dadosJogador;
    }

    function limparFormulario() {
        DOM.nome.value = '';
        DOM.v.value = '0';
        DOM.d.value = '0';
        DOM.pontos.value = '0';
        DOM.aces.value = '0';
        DOM.duplas.value = '0';
        DOM.quebras.value = '0';
        DOM.saque.value = '0';
        DOM.salvos.value = '0';
        cancelarEdicao();
        DOM.status.textContent = 'Formulário limpo';
    }

    function cancelarEdicao() {
        jogadorEmEdicao = null;
        DOM.statusEdicao.style.display = 'none';
        DOM.btnAdicionar.textContent = '+ ADICIONAR';
        // Remove seleção da tabela
        document.querySelectorAll('#corpo-tabela tr').forEach(tr => {
            tr.classList.remove('selecionado');
        });
        linhaSelecionada = null;
    }

    function carregarJogadorParaEdicao(jogador) {
        jogadorEmEdicao = jogador;
        DOM.nome.value = jogador.nome;
        DOM.v.value = jogador.v;
        DOM.d.value = jogador.d;
        DOM.pontos.value = jogador.pontos;
        DOM.aces.value = jogador.aces;
        DOM.duplas.value = jogador.duplas;
        DOM.quebras.value = jogador.quebras;
        DOM.saque.value = jogador.saque;
        DOM.salvos.value = jogador.salvos;
        
        DOM.statusEdicao.style.display = 'flex';
        DOM.labelEdicao.textContent = `✎ Editando: ${jogador.nome}`;
        DOM.btnAdicionar.textContent = '✓ ATUALIZAR';
        DOM.status.textContent = `Editando: ${jogador.nome}`;
    }

    // ========== Renderização da Tabela ==========

    function renderizarTabela() {
        const jogadores = dados.getDadosOrdenados();
        DOM.corpoTabela.innerHTML = '';

        if (jogadores.length === 0) {
            DOM.corpoTabela.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:20px;color:#666;">Nenhum jogador cadastrado</td></tr>`;
            DOM.status.textContent = 'Nenhum jogador cadastrado';
            return;
        }

        jogadores.forEach((j, i) => {
            const tr = document.createElement('tr');
            tr.dataset.nome = j.nome;
            tr.innerHTML = `
                <td>${i + 1}</td>
                <td>${j.nome}</td>
                <td>${j.v}</td>
                <td>${j.d}</td>
                <td>${j.pontos}</td>
                <td>${j.aces}</td>
                <td>${j.duplas}</td>
                <td>${j.quebras}</td>
                <td>${j.saque}</td>
                <td>${j.salvos}</td>
            `;
            
            tr.addEventListener('click', function() {
                // Remove seleção anterior
                document.querySelectorAll('#corpo-tabela tr').forEach(r => r.classList.remove('selecionado'));
                this.classList.add('selecionado');
                linhaSelecionada = this;
                
                const nome = this.dataset.nome;
                const jogador = dados.jogadores.find(j => j.nome === nome);
                if (jogador) {
                    carregarJogadorParaEdicao(jogador);
                }
            });

            DOM.corpoTabela.appendChild(tr);
        });

        DOM.status.textContent = `Total: ${jogadores.length} jogadores`;
    }

    // ========== Modais ==========

    function abrirModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = 'block';
    }

    function fecharModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = 'none';
    }

    // Fechar modais ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });

    document.querySelectorAll('.modal-fechar').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // ========== Estatísticas ==========

    function mostrarEstatisticas() {
        const stats = dados.getEstatisticas();
        if (!stats) {
            alert('Nenhum jogador cadastrado!');
            return;
        }

        DOM.statsConteudo.innerHTML = `
            <p><strong>Total de Jogadores:</strong> ${stats.totalJogadores}</p>
            <p><strong>Partidas Disputadas:</strong> ${stats.partidasDisputadas}</p>
            <p><strong>Média de Pontos:</strong> ${stats.mediaPontos.toFixed(1)}</p>
            <p><strong>Líder de Pontos:</strong> ${stats.lider.nome} (${stats.lider.pontos} pts)</p>
            <p><strong>Mais Vitórias:</strong> ${stats.maisVitorias.nome} (${stats.maisVitorias.v} V)</p>
        `;
        abrirModal('modal-stats');
    }

    // ========== Top 3 ==========

    function mostrarTop3() {
        const top = dados.getTop(3);
        if (top.length === 0) {
            alert('Nenhum jogador cadastrado!');
            return;
        }

        let html = '';
        top.forEach((j, i) => {
            html += `<p><strong>${i+1}º.</strong> ${j.nome} - ${j.pontos} pts (V: ${j.v} | D: ${j.d})</p>`;
        });
        DOM.top3Conteudo.innerHTML = html;
        abrirModal('modal-top3');
    }

    // ========== Busca ==========

    function abrirBusca() {
        DOM.inputBusca.value = '';
        DOM.buscaResultados.innerHTML = '';
        abrirModal('modal-busca');
        setTimeout(() => DOM.inputBusca.focus(), 100);
    }

    function executarBusca() {
        const termo = DOM.inputBusca.value.trim();
        if (!termo) {
            DOM.buscaResultados.innerHTML = '<p style="color:#888;">Digite um nome para buscar</p>';
            return;
        }

        const resultados = dados.buscar(termo);
        if (resultados.length === 0) {
            DOM.buscaResultados.innerHTML = `<p style="color:#e94560;">Nenhum jogador contém "${termo}"</p>`;
            return;
        }

        DOM.buscaResultados.innerHTML = resultados.map(r => 
            `<p>${r.posicao}º. ${r.nome} - ${r.pontos} pts (V/D: ${r.v}-${r.d})</p>`
        ).join('');
    }

    // ========== Gráficos ==========

    let chartPontos = null;
    let chartVitorias = null;

    function mostrarGraficos() {
        const jogadores = dados.getDadosOrdenados();
        if (jogadores.length === 0) {
            alert('Nenhum jogador para gerar gráficos!');
            return;
        }

        const top = jogadores.slice(0, 10);
        const nomes = top.map(j => j.nome);
        const pontos = top.map(j => j.pontos);
        const vitorias = top.map(j => j.v);
        const derrotas = top.map(j => j.d);

        abrirModal('modal-graficos');

        // Destroi gráficos anteriores
        if (chartPontos) { chartPontos.destroy(); chartPontos = null; }
        if (chartVitorias) { chartVitorias.d