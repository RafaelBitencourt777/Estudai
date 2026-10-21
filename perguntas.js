
document.addEventListener("DOMContentLoaded", async () => {

    // Recupera a matéria e a dificuldade selecionadas
    const materia = sessionStorage.getItem("materiaSelecionada");
    const dificuldade = sessionStorage.getItem("dificuldadeSelecionada");

    // Elementos do cabeçalho
    const nomeMateria = document.getElementById("nomeMateria");
    const nivelMateria = document.getElementById("nivelMateria");
    const imagemMateria = document.getElementById("imagemMateria");

    // Imagens das matérias
    const imagens = {
        "Matemática": "../../assets/images/matematica.png",
        "Português": "../../assets/images/portugues.png",
        "História": "../../assets/images/historia.png",
        "Geografia": "../../assets/images/geografia.png",
        "Ciências": "../../assets/images/ciencias.png",
        "Inglês": "../../assets/images/ingles.png"
    };

    // Exibe a matéria e a dificuldade
    if (nomeMateria && nivelMateria && imagemMateria) {
        nomeMateria.textContent = materia || "Matéria não informada";
        nivelMateria.textContent = "Nível " + (dificuldade || "não informado");
        imagemMateria.src = imagens[materia] || "";
        imagemMateria.alt = materia || "";
    }

    // Elementos da página
    const enunciadoQuestao = document.getElementById("enunciadoQuestao");
    const alternativas = document.querySelectorAll(".alternativas");
    const botaoProxima = document.querySelector(".pq");
    const botaoAnterior = document.querySelector(".qa");
    const elementoNumero = document.getElementById("numeroQuestao");
    const elementoPorcentagem = document.getElementById("porcentagem");
    const barraProgresso = document.getElementById("barraProgresso");

    // Confere se os elementos necessários existem
    if (
        !enunciadoQuestao ||
        alternativas.length !== 4 ||
        !botaoProxima ||
        !botaoAnterior ||
        !elementoNumero ||
        !elementoPorcentagem ||
        !barraProgresso
    ) {
        console.error(
            "Não foi possível iniciar o quiz. Confira os IDs e as classes do perguntas.html."
        );
        return;
    }

    // Impede avançar enquanto as perguntas são carregadas
    botaoProxima.disabled = true;
    botaoAnterior.disabled = true;
    enunciadoQuestao.textContent = "Gerando suas questões...";

    let questoes = [];

    try {
        // Solicita as questões à API Java
        const resposta = await fetch("http://localhost:8080/api/quiz/gerar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                materia: materia,
                dificuldade: dificuldade
            })
        });

        if (!resposta.ok) {
            throw new Error(
                "A API retornou o status HTTP " + resposta.status
            );
        }

        const dados = await resposta.json();

        // Confere se a API retornou uma lista de questões
        if (!Array.isArray(dados.questoes) || dados.questoes.length !== 10) {
            throw new Error("A API não retornou exatamente 10 questões.");
        }

        // Converte o formato da API para o formato usado pelo quiz
        questoes = dados.questoes.map((questao) => {
            const alternativasQuestao = questao.alternativas;

            if (
                typeof questao.pergunta !== "string" ||
                !Array.isArray(alternativasQuestao) ||
                alternativasQuestao.length !== 4 ||
                typeof questao.respostaCorreta !== "string" ||
                !alternativasQuestao.includes(questao.respostaCorreta)
            ) {
                throw new Error(
                    "Uma questão retornada pela API possui dados inválidos."
                );
            }

            return {
                enunciado: questao.pergunta,
                alternativas: alternativasQuestao,
                correta: alternativasQuestao.indexOf(
                    questao.respostaCorreta
                ),
                topico: questao.topico || "Geral"
            };
        });

    } catch (erro) {
        console.error("Erro ao carregar as questões:", erro);

        enunciadoQuestao.textContent =
            "Não foi possível carregar o quiz. Verifique se a API está funcionando e tente novamente.";

        botaoProxima.disabled = true;
        botaoAnterior.disabled = true;

        alert(
            "Não foi possível gerar o quiz. Confira se o backend Java está em execução e tente novamente."
        );

        return;
    }

    // Configuração do quiz
    const totalQuestoes = questoes.length;
    let questaoAtual = 0;

    // Guarda a resposta escolhida em cada questão
    const respostas = Array(totalQuestoes).fill(null);

    // Atualiza o indicador e a barra de progresso
    function atualizarProgresso() {
        const numeroExibido = questaoAtual + 1;
        const porcentagem = Math.round(
            (numeroExibido / totalQuestoes) * 100
        );

        elementoNumero.textContent = numeroExibido;
        elementoPorcentagem.textContent = porcentagem + "%";
        barraProgresso.style.width = porcentagem + "%";
    }

    // Exibe a questão atual e recupera uma resposta anterior
    function mostrarQuestao() {
        const questao = questoes[questaoAtual];

        enunciadoQuestao.textContent = questao.enunciado;

        alternativas.forEach((alternativa, indice) => {
            const textoAlternativa = alternativa.querySelector("h2");

            if (textoAlternativa) {
                textoAlternativa.textContent =
                    questao.alternativas[indice];
            }

            alternativa.classList.toggle(
                "selecionada",
                respostas[questaoAtual] === indice
            );
        });

        // Na primeira questão, não é possível voltar
        botaoAnterior.disabled = questaoAtual === 0;

        // Só permite avançar depois de selecionar uma resposta
        botaoProxima.disabled = respostas[questaoAtual] === null;

        // Altera o texto do botão na última questão
        const textoBotao = Array.from(botaoProxima.childNodes).find(
            node =>
                node.nodeType === Node.TEXT_NODE &&
                node.textContent.trim() !== ""
        );

        if (textoBotao) {
            textoBotao.textContent =
                questaoAtual === totalQuestoes - 1
                    ? " Finalizar Quiz "
                    : " Próxima Questão ";
        }

        atualizarProgresso();
    }

    // Permite selecionar uma alternativa
    alternativas.forEach((alternativa, indice) => {
        alternativa.addEventListener("click", () => {
            respostas[questaoAtual] = indice;
            mostrarQuestao();
        });
    });

    // Finaliza o quiz e salva os resultados
    function finalizarQuiz() {
        const acertos = questoes.reduce((total, questao, indice) => {
            return total + (
                respostas[indice] === questao.correta ? 1 : 0
            );
        }, 0);

        const erros = totalQuestoes - acertos;

        const pontuacao = Math.round(
            (acertos / totalQuestoes) * 100
        );

        // Salva as respostas para permitir a revisão
        const questoesRespondidas = questoes.map((questao, indice) => ({
            pergunta: questao.enunciado,
            alternativas: questao.alternativas,
            respostaUsuario: respostas[indice],
            textoRespostaUsuario:
                questao.alternativas[respostas[indice]],
            respostaCorreta: questao.correta,
            textoRespostaCorreta:
                questao.alternativas[questao.correta],
            acertou: respostas[indice] === questao.correta,
            topico: questao.topico
        }));

        const resultado = {
            materia: materia || "Não informada",
            dificuldade: dificuldade || "Não informada",
            totalQuestoes: totalQuestoes,
            acertos: acertos,
            erros: erros,
            pontuacao: pontuacao,
            questoes: questoesRespondidas
        };

        try {
            localStorage.setItem(
                "quizResultado",
                JSON.stringify(resultado)
            );

            // Abre resultado.html, que está na mesma pasta
            window.location.href = "resultado.html";

        } catch (erro) {
            console.error("Não foi possível salvar o resultado:", erro);
            alert(
                "Não foi possível salvar o resultado do quiz. Tente novamente."
            );
        }
    }

    // Avança ou finaliza o quiz
    botaoProxima.addEventListener("click", () => {
        if (respostas[questaoAtual] === null) {
            alert("Selecione uma alternativa antes de continuar!");
            return;
        }

        if (questaoAtual < totalQuestoes - 1) {
            questaoAtual++;
            mostrarQuestao();
        } else {
            finalizarQuiz();
        }
    });

    // Volta para a questão anterior
    botaoAnterior.addEventListener("click", () => {
        if (questaoAtual > 0) {
            questaoAtual--;
            mostrarQuestao();
        }
    });

    // Inicializa a primeira questão
    mostrarQuestao();

});
