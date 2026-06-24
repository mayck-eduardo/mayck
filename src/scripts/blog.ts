import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

const feed = document.getElementById("feed") as HTMLElement;

async function fetchPosts() {
    try {
        feed.innerHTML = "<p style='text-align:center; opacity:0.5;'>Carregando posts do servidor...</p>";

        const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(postsQuery);

        feed.innerHTML = "";

        if (snapshot.empty) {
            feed.innerHTML = "<p style='text-align:center; opacity:0.5;'>Nenhuma publicação encontrada. Você deve postar algo em breve no painel!</p>";
            return;
        }

        let delayIndex = 0;
        snapshot.forEach((doc) => {
            const data = doc.data();
            const postId = doc.id;

            let dateString = "Recente";
            if (data.createdAt) {
                const dateObj = data.createdAt.toDate();
                dateString = dateObj.toLocaleDateString('pt-BR', { 
                    day: '2-digit', month: 'short', year: 'numeric' 
                }).toUpperCase();
            }

            const article = document.createElement("article");
            article.className = "blog-post-card";
            article.style.animationDelay = `${delayIndex * 0.1}s`;
            delayIndex++;
            
            article.onclick = () => window.location.href = `/post?id=${postId}`;

            article.innerHTML = `
                <div class="blog-post-meta"><span class="category">${data.category || 'Geral'}</span> • ${dateString}</div>
                <h2 class="blog-post-title">${data.title}</h2>
                <p class="blog-post-excerpt">${data.desc}</p>
            `;

            feed.appendChild(article);
        });

    } catch (error) {
        console.error("Houve um erro ao resgatar posts:", error);
        feed.innerHTML = "<p style='text-align:center; color:#ff4757;'>Não foi possível conectar ao banco de dados.</p>";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            fetchPosts();
        } else {
            window.location.href = "/admin";
        }
    });
});
