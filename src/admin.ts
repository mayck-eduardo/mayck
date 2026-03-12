import { auth, db } from "./firebase-config";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { initCursor } from "./cursor";

initCursor();

// Elementos da DOM
const authPanel = document.getElementById("authPanel") as HTMLElement;
const dashboardPanel = document.getElementById("dashboardPanel") as HTMLElement;
const loginForm = document.getElementById("loginForm") as HTMLFormElement;
const txtEmail = document.getElementById("txtEmail") as HTMLInputElement;
const txtPassword = document.getElementById("txtPassword") as HTMLInputElement;
const loginStatus = document.getElementById("loginStatus") as HTMLElement;
const btnLogout = document.getElementById("btnLogout") as HTMLButtonElement;
const postForm = document.getElementById("postForm") as HTMLFormElement;
const btnPublish = document.getElementById("btnPublish") as HTMLButtonElement;
const postStatus = document.getElementById("postStatus") as HTMLElement;
const sharedList = document.getElementById("sharedList") as HTMLElement;

// Estado
onAuthStateChanged(auth, (user) => {
    if (user) {
        authPanel.classList.remove("active");
        dashboardPanel.classList.add("active");
    } else {
        dashboardPanel.classList.remove("active");
        authPanel.classList.add("active");
    }
});

// Login
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginStatus.innerText = "Verificando credenciais...";
    loginStatus.className = "status-msg";
    try {
        await signInWithEmailAndPassword(auth, txtEmail.value, txtPassword.value);
        loginStatus.innerText = "";
        txtPassword.value = "";
    } catch (error: any) {
        loginStatus.innerText = "Erro: " + error.message;
        loginStatus.className = "status-msg error";
    }
});

btnLogout.addEventListener("click", () => signOut(auth));


// Criar Novo Post
postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    btnPublish.disabled = true;
    btnPublish.innerText = "Publicando...";
    postStatus.className = "status-msg";
    
    try {
        await addDoc(collection(db, "posts"), {
            title: (document.getElementById("postTitle") as HTMLInputElement).value,
            category: (document.getElementById("postCategory") as HTMLInputElement).value,
            desc: (document.getElementById("postDesc") as HTMLTextAreaElement).value,
            content: (document.getElementById("postContent") as HTMLTextAreaElement).value,
            createdAt: serverTimestamp() // Firestore Server Time
        });

        postForm.reset();
        postStatus.innerText = "Artigo publicado com sucesso no banco fechado!";
        postStatus.className = "status-msg success";
        setTimeout(() => { postStatus.innerText = ""; }, 5000);

    } catch (error: any) {
        postStatus.innerText = "Erro ao enviar: " + error.message;
        postStatus.className = "status-msg error";
    } finally {
        btnPublish.disabled = false;
        btnPublish.innerText = "Publicar Oficialmente";
    }
});

// Adicionando a função no escopo global para o onclick inline do HTML chamar (Tabs)
(window as any).fetchSharedLinks = async function() {
    sharedList.innerHTML = "<p style='text-align:center; opacity:0.5;'>Buscando links no Firebase...</p>";
    try {
        // Puxamos a coleção temporária gerada
        const q = query(collection(db, "shared_posts"), orderBy("expiresAt", "desc"));
        const snapshot = await getDocs(q);

        sharedList.innerHTML = "";
        
        if (snapshot.empty) {
            sharedList.innerHTML = "<p style='text-align:center; opacity:0.5;'>Até agora, nenhum link temporário de 24h foi gerado por você.</p>";
            return;
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            const urlCompleta = `${window.location.origin}/post?share=${doc.id}`;
            const hoje = new Date();
            const expiraEmObj = data.expiresAt.toDate();
            const expirado = hoje > expiraEmObj;
            
            // Formatador visual de status
            const statusBadge = expirado 
                ? `<span style="color:#ff4757; border: 1px solid #ff4757; padding:2px 8px; border-radius:12px; font-size:0.7rem;">⚠️ Expirou</span>` 
                : `<span style="color:#2ed573; border: 1px solid #2ed573; padding:2px 8px; border-radius:12px; font-size:0.7rem;">✅ Online</span>`;

            sharedList.innerHTML += `
                <div class="link-item" style="${expirado ? 'opacity:0.4' : ''}">
                    <div class="link-item-info">
                        <strong>Relativo a: ${data.originalTitle || 'Artigo Copiado'}</strong>
                        <span>Expira(ou): ${expiraEmObj.toLocaleString('pt-BR')} ${statusBadge}</span>
                    </div>
                    ${!expirado ? `<button class="copy-btn" onclick="navigator.clipboard.writeText('${urlCompleta}'); alert('Copiado!')">Copiar URL</button>` : ''}
                </div>
            `;
        });
    } catch (e: any) {
         sharedList.innerHTML = "<p style='color:red;'>Erro de permissão ou de leitura.</p>";
    }
};
