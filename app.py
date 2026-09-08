import streamlit as st
import pandas as pd
import json
import os
import matplotlib.pyplot as plt

ARQUIVO_DADOS = "jogadores_ranking.json"

st.set_page_config(page_title="Ranking Tênis", page_icon="🎾", layout="wide")

# Funções de persistência
def carregar_dados():
    if os.path.exists(ARQUIVO_DADOS):
        try:
            with open(ARQUIVO_DADOS, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def salvar_dados(dados):
    with open(ARQUIVO_DADOS, "w", encoding="utf-8") as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)

if "jogadores" not in st.session_state:
    st.session_state.jogadores = carregar_dados()

st.title("🏆 Gerenciador de Ranking de Tênis")

# --- BARRA LATERAL: Formulário ---
with st.sidebar:
    st.header("📝 Adicionar / Atualizar Jogador")
    with st.form("form_jogador", clear_on_submit=True):
        nome = st.text_input("Nome do Jogador")
        col_v, col_d = st.columns(2)
        v = col_v.number_input("Vitórias (V)", min_value=0, step=1, value=0)
        d = col_d.number_input("Derrotas (D)", min_value=0, step=1, value=0)
        pontos = st.number_input("Pontos", min_value=0, step=1, value=0)
        
        col_a, col_dup = st.columns(2)
        aces = col_a.number_input("Aces", min_value=0.0, step=1.0, value=0.0)
        duplas = col_dup.number_input("Duplas Faltas", min_value=0.0, step=1.0, value=0.0)
        
        quebras = st.number_input("Quebras", min_value=0.0, step=1.0, value=0.0)
        
        col_sq, col_sv = st.columns(2)
        saque = col_sq.number_input("% 1º Saque", min_value=0.0, max_value=100.0, step=0.5, value=0.0)
        salvos = col_sv.number_input("% BP Salvos", min_value=0.0, max_value=100.0, step=0.5, value=0.0)
        
        btn_salvar = st.form_submit_button("💾 Salvar Jogador")

    if btn_salvar:
        if not nome.strip():
            st.error("O nome é obrigatório!")
        else:
            nome_limpo = nome.strip()
            # Atualiza se já existir ou adiciona novo
            jogadores_existentes = [j for j in st.session_state.jogadores if j["nome"].lower() != nome_limpo.lower()]
            novo = {
                "nome": nome_limpo, "v": int(v), "d": int(d), "pontos": int(pontos),
                "aces": float(aces), "duplas": float(duplas), "quebras": float(quebras),
                "saque": float(saque), "salvos": float(salvos)
            }
            jogadores_existentes.append(novo)
            st.session_state.jogadores = jogadores_existentes
            salvar_dados(st.session_state.jogadores)
            st.success(f"{nome_limpo} salvo com sucesso!")
            st.rerun()

    # Opção para remover jogador
    if st.session_state.jogadores:
        st.divider()
        st.subheader("🗑️ Remover Jogador")
        nomes = [j["nome"] for j in st.session_state.jogadores]
        escolha_remover = st.selectbox("Selecione para remover", nomes)
        if st.button("Remover"):
            st.session_state.jogadores = [j for j in st.session_state.jogadores if j["nome"] != escolha_remover]
            salvar_dados(st.session_state.jogadores)
            st.warning(f"{escolha_remover} removido!")
            st.rerun()

# --- CORPO PRINCIPAL ---
if not st.session_state.jogadores:
    st.info("Nenhum jogador cadastrado ainda. Use o menu lateral para adicionar!")
else:
    # Ordenação por pontos
    st.session_state.jogadores.sort(key=lambda x: x["pontos"], reverse=True)
    
    df = pd.DataFrame(st.session_state.jogadores)
    df.index = range(1, len(df) + 1)
    df.index.name = "Pos"
    df.rename(columns={
        "nome": "Jogador", "v": "V", "d": "D", "pontos": "Pts",
        "aces": "Aces", "duplas": "Dup", "quebras": "Qub",
        "saque": "% Sq", "salvos": "% Sv"
    }, inplace=True)

    # Tabela interativa
    st.subheader("📋 Tabela de Classificação")
    st.dataframe(df, use_container_width=True)

    # Botão de download do CSV
    csv_bytes = df.to_csv(sep=";", encoding="utf-8-sig").encode("utf-8-sig")
    st.download_button(
        label="📁 Baixar Ranking em CSV",
        data=csv_bytes,
        file_name="ranking_tenis.csv",
        mime="text/csv"
    )

    st.divider()

    # Métricas gerais
    total_jogadores = len(df)
    total_partidas = int(df["V"].sum() + df["D"].sum())
    lider = df.iloc[0]["Jogador"]
    pts_lider = df.iloc[0]["Pts"]

    m1, m2, m3 = st.columns(3)
    m1.metric("Total de Jogadores", total_jogadores)
    m2.metric("Partidas Disputadas", total_partidas)
    m3.metric("Líder Atual", f"{lider} ({pts_lider} pts)")

    # Gráficos de Desempenho
    st.subheader("📈 Gráficos de Desempenho (Top 10)")
    top10 = df.head(10).iloc[::-1]  # Inverte para o melhor ficar no topo do gráfico horizontal

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
    
    # Gráfico 1: Pontos
    ax1.barh(top10["Jogador"], top10["Pts"], color="#e94560")
    ax1.set_title("Pontuação")
    ax1.set_xlabel("Pontos")

    # Gráfico 2: Vitórias vs Derrotas
    ax2.bar(top10["Jogador"], top10["V"], label="Vitórias", color="#00adb5")
    ax2.bar(top10["Jogador"], top10["D"], bottom=top10["V"], label="Derrotas", color="#f38181")
    ax2.set_title("Vitórias / Derrotas")
    ax2.set_xticklabels(top10["Jogador"], rotation=40, ha="right")
    ax2.legend()

    plt.tight_layout()
    st.pyplot(fig)