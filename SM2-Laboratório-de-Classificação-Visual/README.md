# # Laboratório de Classificação Visual — Inteligência Artificial e Ética

Este repositório contém a documentação, os registros práticos e a análise crítica desenvolvidos durante o **"Laboratório de Classificação Visual"**. 
O objetivo do projeto é analisar o funcionamento de algoritmos de visão computacional utilizando a ferramenta **Teachable Machine (Google)**, identificando como escolhas na curadoria de dados podem induzir vieses e discutindo
os impactos éticos dessas tecnologias na sociedade.

---

## 📁 Estrutura da Pasta

* **`README.md`**: Este guia de navegação e contextualização da atividade.
* **`Laboratório+de+Classificação+Visual.pdf`**: Relatório técnico completo
contendo os testes práticos de inferência do modelo e o Memorial de Impacto e Ética.

---

## 🏎️ Metodologia do Projeto

O experimento está estruturado em duas etapas complementares que interligam a prática técnica à responsabilidade social:

### Parte 1: Simulação Técnica do Viés
O modelo de classificação de imagens foi treinado com duas categorias distintas utilizando uma base de dados (*dataset*) intencionalmente restrita ou estereotipada. 
O teste de inferência em tempo real comprova as limitações do algoritmo, registrando falhas operacionais e classificações incorretas (como falsos positivos) quando o sistema é exposto a indivíduos fora do padrão de treinamento.

### Parte 2: Memorial de Impacto e Ética
* **Mecanismo do Viés:** A seleção restrita de dados corrompe a lógica do algoritmo porque ele não possui a capacidade intrínseca de diferenciar microexpressões ou contextos complexos. Isso limita o aprendizado do sistema, gerando uma visão totalmente distorcida da realidade.
* **Consequência Social:** O erro de classificação resulta em um grande impacto negativo. Sistemas que operam de forma enviesada falham em reconhecer adequadamente as pessoas, gerando profundo desconforto, desconfiança e marginalização em situações do cotidiano ou em ambientes profissionais.
* **Ação Mitigadora (Human-in-the-loop):** Como intervenção ética, um grupo diverso de avaliadores humanos realiza a análise e validação das expressões faciais antes do treinamento do modelo. Esses revisores garantem a variedade do conjunto de dados (incluindo diferentes idades, gêneros, etnias e contextos culturais). 
Dados inconsistentes são corrigidos ou removidos, e especialistas continuam auditando amostras das previsões da IA mesmo após a implementação.

---

## 🏆 Critérios de Avaliação
* **Diagnóstico Crítico:** Capacidade de identificar falhas lógicas e distorções causadas por dados enviesados.
* **Rigor Gramatical:** Aplicação obrigatória de verbos no presente do indicativo na fundamentação do memorial ético.
* **Intervenção Prática:** Proposta de mecanismos de curadoria humana para assegurar a equidade e a mitigação de danos em sistemas automatizados.

Autor: Kayk Ferreira Cândido
