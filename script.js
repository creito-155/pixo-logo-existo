// ==========================================
//  LÓGICA PARA MONTAR A PÁGINA DE GALERIA INDIVIDUAL
// ==========================================
async function montarGaleria() {
    const galeriaContainer = document.getElementById('galeria-container');
    if (!galeriaContainer) {
        return; // Se não estiver na página da galeria, não faz nada.
    }

    try {
        const response = await fetch('/_data/artistas.json');
        if (!response.ok) {
            throw new Error('Rede respondeu com um erro.');
        }
        const data = await response.json();
        const artistas = data.lista_de_artistas; 

        const params = new URLSearchParams(window.location.href.split('?')[1]);
        const artistaId = params.get('artista');
        const artistaSelecionado = artistas.find(a => a.id.toLowerCase() === artistaId.toLowerCase());

        if (artistaSelecionado) {
            document.title = `Galeria - ${artistaSelecionado.nome}`;
            document.getElementById('artista-logo').src = artistaSelecionado.logo;
            document.getElementById('artista-logo').alt = `Logo de ${artistaSelecionado.nome}`;
            document.getElementById('artista-nome').textContent = artistaSelecionado.nome;
            
            const instagramLinkElement = document.getElementById('artista-instagram-link');
            instagramLinkElement.href = artistaSelecionado.instagramLink;
            instagramLinkElement.textContent = artistaSelecionado.instagramHandle;

            galeriaContainer.innerHTML = '';
            artistaSelecionado.imagens.forEach(urlImagem => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'gallery-item';

                const imgElement = document.createElement('img');
                imgElement.src = urlImagem;
                imgElement.alt = `Arte de ${artistaSelecionado.nome}`;
                imgElement.className = 'gallery-image';
                imgElement.loading = 'lazy';

                itemDiv.appendChild(imgElement);
                galeriaContainer.appendChild(itemDiv);
            });

        } else {
            document.querySelector('.creator-header').style.display = 'none';
            galeriaContainer.innerHTML = '<h1>Artista não encontrado.</h1>';
        }

    } catch (error) {
        console.error('Erro ao carregar dados da galeria:', error);
        galeriaContainer.innerHTML = '<h1>Ocorreu um erro ao carregar o conteúdo.</h1>';
    }
}

// ==========================================
//  LÓGICA PARA MONTAR A PÁGINA DE TODOS OS ARTISTAS
// ==========================================
async function montarPaginaDeArtistas() {
    const gridContainer = document.getElementById('todos-os-artistas-grid');
    // Esta verificação garante que o código só é executado na página artistas.html
    if (!gridContainer) {
        return;
    }

    try {
        // Busca os dados de todos os artistas
        const response = await fetch('/_data/artistas.json');
        const data = await response.json();
        const artistas = data.lista_de_artistas;

        gridContainer.innerHTML = ''; // Limpa a mensagem "A carregar..."

        // Cria um cartão para cada artista
        artistas.forEach(artista => {
            // Cria o link que envolve tudo
            const link = document.createElement('a');
            link.href = `galeria.html?artista=${artista.id}`;
            link.className = 'gallery-item'; // Reutilizamos o estilo da galeria

            // Cria a imagem do artista (o logo)
            const img = document.createElement('img');
            img.src = artista.logo;
            img.alt = `Logo do artista ${artista.nome}`;
            img.className = 'gallery-image'; // Reutilizamos o estilo
            img.loading = 'lazy';

            // Cria o parágrafo com o nome do artista
            const nome = document.createElement('p');
            nome.textContent = artista.nome;
            nome.className = 'artist-card-name'; // Uma classe nova para o nome

            // Monta o cartão, adicionando a imagem e o nome ao link
            link.appendChild(img);
            link.appendChild(nome);

            // Adiciona o cartão completo à grelha
            gridContainer.appendChild(link);
        });

    } catch (error) {
        console.error("Erro ao montar a página de artistas:", error);
        gridContainer.innerHTML = '<p>Ocorreu um erro ao carregar os artistas.</p>';
    }
}

// ==========================================
//  INICIALIZAÇÃO DOS SCRIPTS
// ==========================================
// Adiciona os "gatilhos" para as funções. Cada um só executa na página certa.
document.addEventListener('DOMContentLoaded', montarGaleria);
document.addEventListener('DOMContentLoaded', montarPaginaDeArtistas);
