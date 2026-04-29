import { auth, db } from "./firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, addDoc, Timestamp } from "firebase/firestore";
// Import removido para separação visual: import { initCursor } from "./cursor";
// initCursor();

const postArticle = document.getElementById("postArticle") as HTMLElement;

async function loadSinglePost(postId: string, isShared: boolean = false) {
    try {
        let docRef;

        if (isShared) {
            // Busca na coleção temporária share 
            docRef = doc(db, "shared_posts", postId);
        } else {
            // Busca na coleção oficial, só pra logados
            docRef = doc(db, "posts", postId);
        }

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // Formatar data
            let dateString = "Recentemente";
            if (data.createdAt) {
                const dateObj = data.createdAt.toDate();
                dateString = dateObj.toLocaleDateString('pt-BR', { 
                    day: '2-digit', month: 'long', year: 'numeric' 
                });
            }

            // [Visitante ou Logado] - Cria view limpa
            let htmlPayload = `
                <div class="post-header-area">
                    <div class="post-article-meta">${isShared ? '⭐ ACESSO TEMPORÁRIO | ' : ''}<span class="category">${data.category || 'Geral'}</span> • Publicado em ${dateString}</div>
                    <h1 class="post-article-title">${data.title}</h1>
                    <p class="post-article-desc">${data.desc}</p>
                </div>
                <div class="post-article-body">
                    ${data.content}
                </div>
            `;

            // [Somente Logado] - Se for o Admin vendo o post oficial, mostrar botão de Gerar Link Temporário
            if (!isShared) {
                htmlPayload += `
                <div class="blog-admin-panel">
                    <p style="margin-bottom: 1rem; opacity: 0.8; font-size: 1.1rem;">Você é o Administrador. Deseja disponibilizar esta página externamente?</p>
                    <button id="btnGenerateLink" class="blog-btn-share">🔗 GERAR LINK PÚBLICO (Expira em 24h)</button>
                    <p id="shareStatus" style="color:var(--blog-accent); margin-top:1.5rem; font-weight:bold;"></p>
                </div>
                `;
            }

            postArticle.innerHTML = htmlPayload;

            // Atrela o evento de Gerar Link ao botão injetado pra Admins
            if (!isShared) {
                const btnGenerateLink = document.getElementById("btnGenerateLink");
                if (btnGenerateLink) {
                    btnGenerateLink.addEventListener("click", () => handleGenerateShareLink(data));
                }
            }

        } else {
            postArticle.innerHTML = `
                <h2 style='text-align:center'>404: Link expirado ou excluído.</h2>
                ${isShared ? "<p style='text-align:center; opacity:0.6; margin-top:2rem'>O tempo de leitura deste artigo exclusivo pode ter acabado.</p>" : ""}
            `;
        }
    } catch (error) {
        console.error("Erro ao carregar Post Unico:", error);
        postArticle.innerHTML = "<h2 style='text-align:center; color:#ff4757;'>Ocorreu um erro no servidor. Tente mais tarde.</h2>";
    }
}


// Função auxiliar envia as cópia do Post para fila e bota +24h
async function handleGenerateShareLink(originalData: any) {
    const btn = document.getElementById("btnGenerateLink") as HTMLButtonElement;
    const status = document.getElementById("shareStatus") as HTMLElement;

    btn.disabled = true;
    btn.innerText = "Gerando Link Seguro...";

    try {
        // Obter timestamp daqui 24 horas
        const umDiaMilissegundos = 24 * 60 * 60 * 1000;
        const expiracaoDate = new Date(Date.now() + umDiaMilissegundos);
        const expiracaoTimestamp = Timestamp.fromDate(expiracaoDate);

        // Clona os dados preenchendo o 'expiresAt' do Firebase Timestamp nativo
        const novoId = await addDoc(collection(db, "shared_posts"), {
            ...originalData,
            originalTitle: originalData.title,
            expiresAt: expiracaoTimestamp
        });

        // Retorna a URL customizada
        const shareUrl = `${window.location.origin}/post?share=${novoId.id}`;
        
        // Copia a url pro clipboard invisivelmente
        navigator.clipboard.writeText(shareUrl);
        
        status.innerHTML = `✅ Link gerado e copiado! (Expira em 1 Dia)<br><br><span style="user-select:all; border-bottom:1px solid #3b82f6;">${shareUrl}</span>`;

    } catch(err) {
        status.style.color = "#ff4757";
        status.innerText = "Falha ao gravar no Firebase. Regras de Segurança negaram.";
    } finally {
        btn.innerText = "Gerar Novo Link Reservado";
        btn.disabled = false;
    }
}


// INÍCIO DO CICLO DA PÁGINA
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    const shareId = urlParams.get('share');

    // 1. Visitante usando o link gerado pelo Adm (?share=xxx)
    if (shareId && !postId) {
        loadSinglePost(shareId, true); 
        return; 
    }

    // 2. Administrador acessando o banco principal (?id=xxx)
    if (postId && !shareId) {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // Ta logado de verdade, libera 
                loadSinglePost(postId, false);
            } else {
                window.location.href = "/admin"; // Chuta invasor fora 
            }
        });
        return;
    }

    // Se a pessoa entrou na raiz do /post nua
    postArticle.innerHTML = "<h2 style='text-align:center'>URL Inválida.</h2>";

});

// Scroll Events (Progress Bar e Back-to-top)
window.addEventListener("scroll", () => {
    // Cálculo do progresso de leitura
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    
    const progressBar = document.getElementById("progressBar");
    if (progressBar) progressBar.style.width = progress + "%";

    // Mostra/oculta botão Voltar ao Topo (se scrollar mais que 300px)
    const backBtn = document.getElementById("backToTop");
    if (backBtn) {
        if (scrollTop > 300) {
            backBtn.classList.add("visible");
        } else {
            backBtn.classList.remove("visible");
        }
    }
});

// Ação de clique do Voltar ao Topo
const topBtn = document.getElementById("backToTop");
if(topBtn) {
    topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}
