const materias = document.querySelectorAll(".materia");
const dificuldades = document.querySelectorAll(".dif");
const botaoComecar = document.querySelector(".final button");

// Guarda as escolhas do usuário
let materiaSelecionada = null;
let dificuldadeSelecionada = null;

// Seleção da matéria
materias.forEach((materia) => {
    materia.addEventListener("click", () => {
        // Remove a seleção anterior
        materias.forEach((item) => {
            item.classList.remove("selecionada");
        });

        // Seleciona a matéria clicada
        materia.classList.add("selecionada");

        // Guarda o nome da matéria
        materiaSelecionada = materia.querySelector("h2").textContent.trim();
    });
});

// Seleção da dificuldade
dificuldades.forEach((dificuldade) => {
    dificuldade.addEventListener("click", () => {
        // Remove a seleção anterior
        dificuldades.forEach((item) => {
            item.classList.remove("selecionada");
        });

        // Seleciona a dificuldade clicada
        dificuldade.classList.add("selecionada");

        // Guarda o nível escolhido
        dificuldadeSelecionada =
            dificuldade.querySelector("h2").textContent.trim();
    });
});

// Botão Começar Quiz
botaoComecar.addEventListener("click", () => {
    // Verifica se as duas escolhas foram feitas
    if (!materiaSelecionada || !dificuldadeSelecionada) {
        alert("Selecione uma matéria e uma dificuldade antes de começar!");
        return;
    }

    // Guarda as escolhas para a próxima página
    sessionStorage.setItem("materiaSelecionada", materiaSelecionada);
    sessionStorage.setItem("dificuldadeSelecionada", dificuldadeSelecionada);

    // Abre a tela das perguntas
    window.location.href = "perguntas.html";
});
