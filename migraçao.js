// migracao.js - Script para migrar artistas locais para Firebase e Cloudinary

const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// --- 1. CONFIGURAÇÃO (PREENCHA SUAS INFORMAÇÕES AQUI!) ---

// Chave do Firebase (o arquivo que você baixou)
const serviceAccount = require('./serviceAccountKey.json');

// Suas chaves do Cloudinary (encontre-as no Dashboard do Cloudinary)
cloudinary.config({ 
  cloud_name: 'dj053fl2q', // SEU CLOUD NAME
  api_key: '491821262649412', // ENCONTRE NO DASHBOARD
  api_secret: 'g3FKC1txbgJ1F1txlktyDz6Sm4I' // ENCONTRE NO DASHBOARD
});

// Caminho para a pasta de imagens dos artistas
const galleriesPath = path.join(__dirname, 'imagens');
// Pastas a ignorar
const foldersToIgnore = ['LOGO', 'backgrounds', 'uploads']; 
// --------------------------------------------------------------------


// --- 2. INICIALIZAÇÃO DO FIREBASE ADMIN ---
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
console.log('Firebase Admin inicializado com sucesso.');
// -------------------------------------------


// --- 3. FUNÇÃO PRINCIPAL DE MIGRAÇÃO ---
async function migrarArtistas() {
  console.log('Iniciando migração...');

  // Lê as pastas dos artistas
  const artistFolders = fs.readdirSync(galleriesPath).filter(file => {
    return fs.statSync(path.join(galleriesPath, file)).isDirectory() && !foldersToIgnore.includes(file);
  });

  if (artistFolders.length === 0) {
    console.log("Nenhuma pasta de artista encontrada para migrar.");
    return;
  }
  
  console.log(`Encontrados ${artistFolders.length} artistas. Processando um por um...`);

  // Loop para processar cada artista
  for (const artistName of artistFolders) {
    console.log(`\n--- Processando Artista: ${artistName} ---`);
    const artistFolderPath = path.join(galleriesPath, artistName);
    const imageFiles = fs.readdirSync(artistFolderPath)
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

    if (imageFiles.length === 0) {
      console.log(`Nenhuma imagem encontrada para ${artistName}. Pulando.`);
      continue;
    }

    const uploadedImageUrls = [];
    
    // Faz o upload de cada imagem para o Cloudinary
    for (const fileName of imageFiles) {
      const filePath = path.join(artistFolderPath, fileName);
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: `artistas/${artistName}` // Organiza as imagens em pastas no Cloudinary
        });
        uploadedImageUrls.push(result.secure_url);
        console.log(`- Imagem ${fileName} enviada com sucesso.`);
      } catch (error) {
        console.error(`- Erro ao enviar a imagem ${fileName}:`, error.message);
      }
    }

    if (uploadedImageUrls.length === 0) {
        console.log(`Nenhuma imagem foi enviada com sucesso para ${artistName}. Pulando salvamento no Firestore.`);
        continue;
    }

    // Prepara o documento para o Firestore
    const artistaDoc = {
      nome: artistName,
      imageUrl: uploadedImageUrls[0], // Usa a primeira imagem como principal
      instagramHandle: `@${artistName.toLowerCase()}`,
      instagramLink: `https://www.instagram.com/${artistName.toLowerCase()}`,
      categoria: [], // Adicione categorias padrão se quiser, ex: ["pixo"]
      imagens: uploadedImageUrls, // Array com todas as URLs do Cloudinary
      userId: null // Deixamos nulo pois não há um usuário dono (migração do admin)
    };

    // Salva no Firestore
    try {
      await db.collection('artistas').add(artistaDoc);
      console.log(`>>> Artista ${artistName} salvo no Firestore com ${uploadedImageUrls.length} imagens!`);
    } catch (error) {
      console.error(`>>> Erro ao salvar ${artistName} no Firestore:`, error.message);
    }
  }

  console.log('\n--- Migração Concluída! ---');
}

// Roda a função
migrarArtistas();