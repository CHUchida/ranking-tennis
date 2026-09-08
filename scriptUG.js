// =============================================
// split.js - Utilitários e Gerenciamento de Dados
// =============================================

const ARQUIVO_DADOS = 'jogadores_ranking.json';

// Utilitários de conversão
const Utilitarios = {
    converterInt: (valor, padrao = 0) => {
        if (valor === undefined || valor === null || valor === '') return padrao;
        const num = Number(valor);
        return isNaN(num) ? padrao : Math.floor(num);
    },
    
    converterFloat: (valor, padrao = 0) => {
        if (valor === undefined || valor === null || valor === '') return padrao;
        let str = String(valor).replace(',', '.');
        const num = parseFloat(str);
        return isNaN(num) ? padrao : num;
    },
    
    validarPositivo: (valor, nomeCampo) => {
        if (valor < 0) {
            throw new Error(`${nomeCampo} não pode ser negativo!`);
        }
        return valor;
    }
};

// Gerenciador de Dados
class GerenciadorDados {
    constructor() {
        this.jogadores = [];
        this.carregarDados();
    }

    carregarDados() {
        const dadosSalvos = localStorage.getItem(ARQUIVO_DADOS);
        if (dadosSalvos) {
            try {
                this.jogadores = JSON.parse(dadosSalvos);
                return;
            } catch (e) {
                console.warn('Erro ao carregar dados:', e);
            }
        }
        // Dados de exemplo
        this.jogadores = [
            { nome: 'João Silva', v: 12, d: 5, pontos: 37, aces: 45.5, duplas: 8.2, quebras: 15.3, saque: 68.5, salvos: 72.0 },
            { nome: 'Pedro Santos', v: 10, d: 7, pontos: 30, aces: 38.0, duplas: 12.1, quebras: 10.5, saque: 62.0, salvos: 65.5 },
            { nome: 'Carlos Lima', v: 8, d: 9, pontos: 24, aces: 30.2, duplas: 15.0, quebras: 8.7, saque: 55.0, salvos: 58.0 },
            { nome: 'Rafael Costa', v: 15, d: 3, pontos: 45, aces: 52.3, duplas: 5.5, quebras: 20.1, saque: 75.0, salvos: 80.5 },
            { nome: 'Lucas Oliveira', v: 6, d: 11, pontos: 18, aces: 25.0, duplas: 18.3, quebras: 6.2, saque: 48.0, salvos: 50.0 }
        ];
        this.salvarDados();
    }

    salvarDados() {
        try {
            localStorage.setItem(ARQUIVO_DADOS, JSON.stringify(this.jogadores));
        } catch (e) {
            console.error('Erro ao salvar:', e);
        }
    }

    obterJogadores() {
        return [...this.jogadores];
    }

    adicionar(jogador) {
        // Verifica duplicidade
        if (this.jogadores.some(j => j.nome.toLowerCase() === jogador.nome.toLowerCase())) {
            throw new Error(`'${jogador.nome}' já existe!`);
        }
        this.jogadores.push(jogador);
        this.salvarDados();
        return jogador;
    }

    atualizar(nomeOriginal, dados) {
        const index = this.jogadores.findIndex(j => j.nome === nomeOriginal);
        if (index === -1) {
            throw new Error(`Jogador '${nomeOriginal}' não encontrado!`);
        }
        
        // Verifica duplicidade se o nome mudou
        if (dados.nome.toLowerCase() !== nomeOriginal.toLowerCase()) {
            if (this.jogadores.some((j, i) => i !== index && j.nome.toLowerCase() === dados.nome.toLowerCase())) {
                throw new Error(`'${dados.nome}' já existe!`);
            }
        }
        
        this.jogadores[index] = { ...dados };
        this.salvarDados();
        return this.jogadores[index];
    }

    remover(nome) {
        this.jogadores = this.jogadores.filter(j => j.nome !== nome);
        this.salvarDados();
    }

    buscar(termo) {
        const termoLower = termo.toLowerCase();
        return this.jogadores
            .map((j, i) => ({ ...j, posicao: i + 1 }))
            .filter(j => j.nome.toLowerCase().includes(termoLower));
    }

    getTop(quantidade = 3) {
        return [...this.jogadores]
            .sort((a, b) => b.pontos - a.pontos)
            .slice(0, quantidade);
    }

    getEstatisticas() {
        if (this.jogadores.length === 0) return null;
        
        const totalV = this.jogadores.reduce((s, j) => s + j.v, 0);
        const totalD = this.jogadores.reduce((s, j) => s + j.d, 0);
        const totalPts = this.jogadores.reduce((s, j) => s + j.pontos, 0);
        const mediaPts = totalPts / this.jogadores.length;
        const melhor = this.jogadores.reduce((a, b) => a.pontos > b.pontos ? a : b);
        const maisVitorias = this.jogadores.reduce((a, b) => a.v > b.v ? a : b);
        
        return {
            totalJogadores: this.jogadores.length,
            partidasDisputadas: totalV + totalD,
            mediaPontos: mediaPts,
            lider: melhor,
            maisVitorias: maisVitorias
        };
    }

    // Para exportação CSV
    getDadosOrdenados() {
        return [...this.jogadores].sort((a, b) => b.pontos - a.pontos);
    }
}

// Exporta para uso global
window.Utilitarios = Utilitarios;
window.GerenciadorDados = GerenciadorDados;
window.ARQUIVO_DADOS = ARQUIVO_DADOS;