document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. ELEMENTOS DA PÁGINA
    // ==========================================

    const elementoPontuacao = document.getElementById("pontuacao");
    const elementoAcertos = document.getElementById("acertos");
    const elementoErros = document.getElementById("erros");

    const areaRespostas = document.querySelector(".resp");
    const areaConteudos = document.querySelector(".conteudos");

    // Recupera o resultado salvo pelo perguntas.js
    const dadosSalvos = localStorage.getItem("quizResultado");

    if (!dadosSalvos) {
        console.warn("Nenhum resultado foi encontrado.");

        if (elementoPontuacao) elementoPontuacao.textContent = "0";
        if (elementoAcertos) elementoAcertos.textContent = "0";
        if (elementoErros) elementoErros.textContent = "0";

        if (areaRespostas) {
            areaRespostas.innerHTML =
                "<p>Você ainda não finalizou um quiz. Responda às questões para ver seu resultado.</p>";
        }

        return;
    }

    // ==========================================
    // 2. LÊ OS DADOS SALVOS
    // ==========================================

    let resultado;

    try {
        resultado = JSON.parse(dadosSalvos);
    } catch (erro) {
        console.error("Erro ao ler o resultado:", erro);
        return;
    }

    // O perguntas.js salva um objeto, não um array diretamente.
    if (!resultado || typeof resultado !== "object") {
        console.error("O formato do resultado é inválido.");
        return;
    }

    const questoes = resultado.questoes;

    if (!Array.isArray(questoes) || questoes.length === 0) {
        console.error("Não foi encontrada a lista de questões respondidas.");

        if (areaRespostas) {
            areaRespostas.innerHTML =
                "<p>Não foi possível carregar a revisão das respostas. Finalize um novo quiz e tente novamente.</p>";
        }

        // Ainda exibe os totais salvos, se estiverem disponíveis.
        if (elementoPontuacao) {
            elementoPontuacao.textContent = resultado.pontuacao ?? 0;
        }

        if (elementoAcertos) {
            elementoAcertos.textContent = resultado.acertos ?? 0;
        }

        if (elementoErros) {
            elementoErros.textContent = resultado.erros ?? 0;
        }

        return;
    }

    // ==========================================
    // 3. CALCULA A NOTA E OS TOTAIS
    // ==========================================

    const totalQuestoes = questoes.length;

    const acertos = questoes.filter(questao =>
        questao.acertou === true ||
        questao.respostaUsuario === questao.respostaCorreta
    ).length;

    const erros = totalQuestoes - acertos;

    const pontuacao = Math.round(
        (acertos / totalQuestoes) * 100
    );

    // Atualiza os valores na tela.
    if (elementoPontuacao) {
        elementoPontuacao.textContent = pontuacao;
    }

    if (elementoAcertos) {
        elementoAcertos.textContent = acertos;
    }

    if (elementoErros) {
        elementoErros.textContent = erros;
    }

    // ==========================================
    // 4. ATUALIZA MATÉRIA E DIFICULDADE
    // ==========================================

    const cabecalhoResultado = document.querySelector(".mc");

    if (cabecalhoResultado) {
        const tituloMateria = cabecalhoResultado.querySelector("h2");

        if (tituloMateria) {
            const materia = resultado.materia || "Matéria";
            const dificuldade = resultado.dificuldade || "Não informada";

            tituloMateria.textContent =
                materia + " - Nível " + dificuldade;
        }

        const mensagemResultado = cabecalhoResultado.querySelector("h1");

        if (mensagemResultado) {
            if (pontuacao >= 90) {
                mensagemResultado.textContent = "Excelente trabalho!";
            } else if (pontuacao >= 70) {
                mensagemResultado.textContent = "Bom trabalho!";
            } else if (pontuacao >= 50) {
                mensagemResultado.textContent = "Você está evoluindo!";
            } else {
                mensagemResultado.textContent = "Vamos praticar mais!";
            }
        }

        const textos = cabecalhoResultado.querySelectorAll("h2");

        if (textos.length > 1) {
            if (pontuacao >= 70) {
                textos[1].textContent =
                    "Você está no caminho certo. Revise alguns tópicos para avançar ainda mais.";
            } else {
                textos[1].textContent =
                    "Revise as respostas abaixo e pratique os tópicos em que teve dificuldade.";
            }
        }
    }

    // ==========================================
    // 5. ATUALIZA A LEGENDA DE ACERTOS E ERROS
    // ==========================================

    const legendaAcertos = document.querySelector(".vd");
    const legendaErros = document.querySelector(".vml");

    if (legendaAcertos) {
        legendaAcertos.textContent = acertos + " acertos";
    }

    if (legendaErros) {
        legendaErros.textContent = erros + " erros";
    }

    // ==========================================
    // 6. MONTA A REVISÃO DAS RESPOSTAS
    // ==========================================

    if (areaRespostas) {
        areaRespostas.innerHTML = "";

        questoes.forEach((questao, indice) => {
            const acertou =
                questao.acertou === true ||
                questao.respostaUsuario === questao.respostaCorreta;

            const alternativaUsuario =
                questao.textoRespostaUsuario ??
                questao.alternativas?.[questao.respostaUsuario] ??
                "Não informada";

            const alternativaCorreta =
                questao.textoRespostaCorreta ??
                questao.alternativas?.[questao.respostaCorreta] ??
                "Não informada";

            const cartao = document.createElement("div");

            cartao.className = acertou
                ? "resp-certa"
                : "resp-errada";

            const linhaCabecalho = document.createElement("div");
            linhaCabecalho.className = "rc";

            const imagem = document.createElement("img");
            imagem.src = acertou
                ? "../../assets/images/acertou-removebg-preview.png"
                : "../../assets/images/errou-removebg-preview.png";

            imagem.alt = acertou ? "Resposta correta" : "Resposta incorreta";

            const numero = document.createElement("h1");
            numero.className = "n";
            numero.textContent = (indice + 1) + ".";

            const pergunta = document.createElement("h1");
            pergunta.className = "perg";
            pergunta.textContent = questao.pergunta || "Questão";

            const status = document.createElement("div");
            status.className = acertou ? "acertou" : "errou";

            const textoStatus = document.createElement("h2");
            textoStatus.textContent = acertou ? "Acertou" : "Errou";

            status.appendChild(textoStatus);

            linhaCabecalho.append(
                imagem,
                numero,
                pergunta,
                status
            );

            cartao.appendChild(linhaCabecalho);

            const linhaRespostas = document.createElement("div");
            linhaRespostas.className = acertou ? "rma" : "rme";

            const caixaUsuario = document.createElement("div");
            caixaUsuario.className = acertou ? "sra" : "sr";

            const tituloUsuario = document.createElement("h2");
            tituloUsuario.textContent = "SUA RESPOSTA";

            const textoUsuario = document.createElement("h1");
            textoUsuario.textContent = alternativaUsuario;

            caixaUsuario.append(tituloUsuario, textoUsuario);
            linhaRespostas.appendChild(caixaUsuario);

            if (!acertou) {
                const caixaCorreta = document.createElement("div");
                caixaCorreta.className = "src";

                const tituloCorreta = document.createElement("h2");
                tituloCorreta.textContent = "RESPOSTA CORRETA";

                const textoCorreto = document.createElement("h1");
                textoCorreto.textContent = alternativaCorreta;

                caixaCorreta.append(tituloCorreta, textoCorreto);
                linhaRespostas.appendChild(caixaCorreta);
            }

            cartao.appendChild(linhaRespostas);

            const topico = document.createElement("p");
            topico.textContent =
                "Tópico: " + (questao.topico || "Não informado");

            cartao.appendChild(topico);
            areaRespostas.appendChild(cartao);
        });
    }

    // ==========================================
    // 7. ATUALIZA O DESEMPENHO POR TÓPICO
    // ==========================================

    if (areaConteudos) {
        const desempenho = {};

        questoes.forEach(questao => {
            const topico = questao.topico || "Outros tópicos";

            if (!desempenho[topico]) {
                desempenho[topico] = {
                    total: 0,
                    acertos: 0
                };
            }

            desempenho[topico].total++;

            if (
                questao.acertou === true ||
                questao.respostaUsuario === questao.respostaCorreta
            ) {
                desempenho[topico].acertos++;
            }
        });

        areaConteudos.innerHTML = "";

        Object.entries(desempenho).forEach(([topico, dados]) => {
            const porcentagem = Math.round(
                (dados.acertos / dados.total) * 100
            );

            const cartao = document.createElement("div");
            cartao.className = "conteudo";

            const linhaTitulo = document.createElement("div");
            linhaTitulo.className = "cc";

            const titulo = document.createElement("h1");
            titulo.textContent = topico;

            const indicador = document.createElement("div");
            indicador.className = "porc";

            const textoPorcentagem = document.createElement("h1");
            textoPorcentagem.textContent = porcentagem + "%";

            indicador.appendChild(textoPorcentagem);
            linhaTitulo.append(titulo, indicador);

            const fundoBarra = document.createElement("div");
            fundoBarra.className = "barra-fundo";

            const barra = document.createElement("div");
            barra.className = "barraProgressoTopico";
            barra.style.width = porcentagem + "%";

            fundoBarra.appendChild(barra);

            const descricao = document.createElement("p");

            if (porcentagem === 100) {
                descricao.textContent = "Ótimo trabalho! Você acertou todas as questões deste tópico.";
            } else if (porcentagem >= 70) {
                descricao.textContent = "Bom desempenho! Continue praticando para melhorar ainda mais.";
            } else {
                descricao.textContent = "Revise os conceitos e pratique mais questões.";
            }

            cartao.append(linhaTitulo, fundoBarra, descricao);
            areaConteudos.appendChild(cartao);
        });
    }

    // ==========================================
    // 8. REGISTRA O RESULTADO ATUALIZADO
    // ==========================================

    resultado.totalQuestoes = totalQuestoes;
    resultado.acertos = acertos;
    resultado.erros = erros;
    resultado.pontuacao = pontuacao;

    localStorage.setItem("quizResultado", JSON.stringify(resultado));

});