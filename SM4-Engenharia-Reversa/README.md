# # Engenharia Reversa Assistida por IA — Descrição Lógica e Funcional

Este repositório contém os registros, análises críticas e respostas reflexivas desenvolvidos durante a atividade prática de **"Engenharia Reversa Assistida por IA"**. O objetivo do projeto é reconstruir aplicativos e interfaces funcionais focando na tradução de componentes visuais e regras de negócio para instruções lógicas, sem a visualização prévia do código-fonte original.

---

## 📁 Estrutura da Pasta

* **`README.md`**: Este guia de navegação e contextualização da atividade.
* **`SM4-Engenharia-Reversa.pdf`**: Relatório conceitual contendo o questionário técnico e a reflexão crítica sobre os impactos de mercado, competências profissionais e dilemas éticos envolvidos no desenvolvimento assistido por IA.

---

## 🏎️ Metodologia do Projeto

A atividade foi executada seguindo três etapas fundamentais de desenvolvimento lógico, transferindo o esforço da escrita sintática diretamente para o comportamento funcional:

### 1. Análise e Mapeamento
Exploração detalhada de uma aplicação de referência para mapear de forma externa os componentes visuais, hierarquia de interface (UI/UX) e regras de lógica de negócio implícitas nas interações do usuário.

### 2. Configuração de Instruções (System Instructions)
Definição do comportamento do modelo (Gemini) dentro do *Google AI Studio*. O modelo foi configurado para atuar como um desenvolvedor *Full-Stack*, recebendo descrições textuais precisas sobre as estruturas de arquivos necessárias (HTML, CSS e JS) e os fluxos de eventos esperados.

### 3. Construção, Validação e Auditoria
Geração do código da aplicação dentro do ambiente de testes. Esta etapa envolveu a comparação direta entre o comportamento do protótipo gerado e o sistema de referência, ajustando as instruções lógicas até obter equivalência funcional.

---

## 🎯 Reflexão Crítica e Fundamentação Teórica

O material analítico presente no repositório discute duas vertentes cruciais sobre a evolução do mercado de desenvolvimento:

* **Impacto na Formação do Desenvolvedor Júnior:** O avanço das ferramentas generativas (como o Gemini) muda o papel do engenheiro de software júnior. Como a IA trabalha com probabilidades e pode gerar alucinações ou vulnerabilidades ocultas, o profissional passa a atuar essencialmente como um **Auditor de Código**. Duas competências tornam-se indispensáveis:
  1. Capacidade de traduzir necessidades de negócio em arquitetura lógica complexa.
  2. Habilidade analítica para auditar, testar e mitigar falhas de segurança geradas por IA.

* **Dilema Ético e Propriedade Intelectual:** A facilidade de replicação assistida por IA levanta debates sobre plágio digital. O projeto conceitua que a engenharia reversa ultrapassa a linha da prototipagem e torna-se plágio quando deixa de ser uma ferramenta de estudo e passa a ser uma **substituição comercial direta, sem valor agregado**.
* **Diretriz de Proteção Proposta:** Como ação mitigadora para proteger a inovação de criadores originais, recomenda-se a inserção de um "DNA" de software: assinaturas lógicas discretas (como sequências específicas de chamadas de sistema, padrões intencionais de latência ou estruturas de dados não convencionais) que comprovem a autoria sem prejudicar a performance geral do sistema.

---

## 🏆 Critérios de Avaliação
* **Abstração Lógica:** Competência para descrever e reconstruir fluxos funcionais complexos sem dependência de código pronto.
* **Visão Crítica e Ética:** Capacidade de avaliar dilemas de direitos autorais e propor soluções de segurança em desenvolvimento automatizado.
* **Auditoria de Sistemas:** Rigor técnico no refinamento de *System Instructions* para mitigar alucinações das ferramentas generativas.

Autor: Kayk Ferreira Cândido
