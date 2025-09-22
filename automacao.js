// automacao.js - O script de automação final

const fs = require('fs');
const path = require('path');

// --- CONFIGURAÇÃO ---
// CORREÇÃO: Aponta diretamente para a sua pasta 'imagens'
const galleriesPath = path.join(__dirname, 'imagens');
// Caminho onde o ficheiro de dados final será guardado
const outputPath = path.join(__dirname, '_data', 'artistas.json');
// Lista de pastas a ignorar dentro da pasta 'imagens'
const foldersToIgnore = ['LOGO', 'backgrounds', 'uploads'];
// --------------------

console.log('A iniciar a automação de galerias...');

// 1. Garante que as pastas necessárias existem
if (!fs.existsSync(galleriesPath)) {
    console.error(`ERRO: A pasta de base '${galleriesPath}' não foi encontrada.`);
    return;
}
if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath));
}

// 2. Lê todas as pastas de artistas dentro de 'imagens/'
const artistFolders = fs.readdirSync(galleriesPath).filter(file => {
    const isDirectory = fs.statSync(path.join(galleriesPath, file)).isDirectory();
    // Mantém apenas se for uma pasta E não estiver na lista para ignorar
    return isDirectory && !foldersToIgnore.includes(file);
});

if (artistFolders.length === 0) {
    console.log("Nenhuma pasta de artista encontrada em 'imagens/'. Nenhuma ação realizada.");
    return;
}

console.log(`Encontrados ${artistFolders.length} artistas. A processar...`);

// 3. Mapeia cada pasta de artista para um objeto JSON
const allArtists = artistFolders.map(artistName => {
    const artistFolderPath = path.join(galleriesPath, artistName);
    const imageFiles = fs.readdirSync(artistFolderPath);

    const imagePaths = imageFiles
        // Filtra para manter apenas ficheiros de imagem
        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
        // CORREÇÃO: Cria o caminho completo da imagem a partir da pasta 'imagens'
        .map(file => `imagens/${artistName}/${file}`);

    // Assume que a primeira imagem da lista é o logo
    const logoImage = imagePaths.length > 0 ? imagePaths[0] : '';

    // Cria o objeto para este artista com dados de exemplo
    return {
        id: artistName,
        nome: artistName,
        logo: logoImage,
        instagramLink: `https://www.instagram.com/${artistName.toLowerCase()}`,
        instagramHandle: `@${artistName.toLowerCase()}`,
        categoria: ["padrão"],
        imagens: imagePaths
    };
});

// 4. Cria a estrutura final do JSON e guarda-a no ficheiro
const finalJson = {
    lista_de_artistas: allArtists
};
fs.writeFileSync(outputPath, JSON.stringify(finalJson, null, 2));

console.log(`\nSUCESSO! O ficheiro artistas.json foi atualizado com ${allArtists.length} artistas.`);
console.log("Opcional: Abra o ficheiro para ajustar detalhes como Instagram ou categorias.");
console.log("Próximo passo: Faça o Commit e o Push das alterações no VS Code.");

