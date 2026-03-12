import { auth, db } from "./firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { initCursor } from "./cursor";

initCursor();

// Elementos da DOM
const feed = document.getElementById("feed") as HTMLElement;

// Função assíncrona para puxar as matérias do Firestore
async function fetchPosts() {
    try {
        // Exibe loader
        feed.innerHTML = "<p style='text-align:center; opacity:0.5;'>Carregando posts do servidor...</p>";

        // Cria a Query: Puxe os posts do mais novo para o mais velho (Data 'createdAt' declinante)
        const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(postsQuery);

        // Limpa Carregamento
        feed.innerHTML = "";

        if (snapshot.empty) {
            feed.innerHTML = "<p style='text-align:center; opacity:0.5;'>Nenhuma publicação encontrada. Você deve postar algo em breve no painel!</p>";
            return;
        }

        // Loop e Pintura no DOM
        snapshot.forEach((doc) => {
            const data = doc.data();
            const postId = doc.id; // O ID nativo do objeto no Banco

            // Parse Date
            let dateString = "Recente";
            if (data.createdAt) {
                // Firebase timestamp to JS Date convert
                const dateObj = data.createdAt.toDate();
                // Format ex: 10 DEZ 2025
                dateString = dateObj.toLocaleDateString('pt-BR', { 
                    day: '2-digit', month: 'short', year: 'numeric' 
                }).toUpperCase();
            }

            const article = document.createElement("article");
            article.className = "post-card";
            
            // Define o clique na URL enviando parâmetro ID pelo GET 
            article.onclick = () => window.location.href = `/post?id=${postId}`;

            article.innerHTML = `
                <div class="post-meta">${data.category || 'Geral'} • ${dateString}</div>
                <h2 class="post-title">${data.title}</h2>
                <p class="post-excerpt">${data.desc}</p>
            `;

            feed.appendChild(article);
        });

    } catch (error) {
        console.error("Houve um erro ao resgatar posts:", error);
        feed.innerHTML = "<p style='text-align:center; color:#ff4757;'>Não foi possível conectar ao banco de dados.</p>";
    }
}

// Inicia escutando a Autenticação
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // O usuário tem permissão, chama os posts.
            fetchPosts();
        } else {
            // Usuário cru não logado: chuta pro painel admin.
            window.location.href = "/admin";
        }
    });
});
