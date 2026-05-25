import { auth, db } from "./firebase-config";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs, getDoc, query, orderBy } from "firebase/firestore";
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
const myNotesList = document.getElementById("myNotesList") as HTMLElement;
const btnCancelEdit = document.getElementById("btnCancelEdit") as HTMLButtonElement;

// Inicializar Quill JS
declare const Quill: any;
const quill = new Quill('#postContentEditor', {
    theme: 'snow',
    placeholder: 'Escreva sua anotação aqui...',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'clean']
        ]
    }
});

let editingNoteId: string | null = null;

// Estado
onAuthStateChanged(auth, async (user) => {
    if (user) {
        authPanel.classList.remove("active");
        dashboardPanel.classList.add("active");

        // Verifica se há pedido de edição na URL
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        if (editId) {
            // Limpa URL para não ficar preso no modo edit se der refresh
            window.history.replaceState({}, document.title, window.location.pathname);
            
            try {
                const docRef = doc(db, "posts", editId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const safeTitle = encodeURIComponent(data.title || "");
                    const safeCategory = encodeURIComponent(data.category || "");
                    const safeCustomDate = encodeURIComponent(data.customDate || "");
                    const safeDesc = encodeURIComponent(data.desc || "");
                    const safeContent = encodeURIComponent(data.content || "");
                    (window as any).editNote(docSnap.id, safeTitle, safeCategory, safeCustomDate, safeDesc, safeContent);
                }
            } catch (e) {
                console.error("Erro ao carregar nota via redirecionamento:", e);
            }
        }

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


// Criar ou Atualizar Novo Post
postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Validar se o editor está vazio (Quill às vezes deixa só <p><br></p>)
    const contentHtml = quill.root.innerHTML;
    if (quill.getText().trim().length === 0 && !contentHtml.includes('<img')) {
        postStatus.innerText = "O conteúdo da anotação não pode estar vazio.";
        postStatus.className = "status-msg error";
        return;
    }

    btnPublish.disabled = true;
    btnPublish.innerText = "Salvando...";
    postStatus.className = "status-msg";
    
    try {
        const postData = {
            title: (document.getElementById("postTitle") as HTMLInputElement).value,
            category: (document.getElementById("postCategory") as HTMLInputElement).value,
            customDate: (document.getElementById("postDate") as HTMLInputElement).value,
            desc: (document.getElementById("postDesc") as HTMLTextAreaElement).value,
            content: contentHtml,
            updatedAt: serverTimestamp()
        };

        if (editingNoteId) {
            // Atualizar
            await updateDoc(doc(db, "posts", editingNoteId), postData);
            postStatus.innerText = "Anotação atualizada com sucesso!";
        } else {
            // Criar Novo
            await addDoc(collection(db, "posts"), {
                ...postData,
                createdAt: serverTimestamp() // Apenas na criação
            });
            postStatus.innerText = "Anotação salva com sucesso no seu cofre privado!";
        }

        postForm.reset();
        quill.root.innerHTML = "";
        cancelEditMode();
        
        postStatus.className = "status-msg success";
        setTimeout(() => { postStatus.innerText = ""; }, 5000);

    } catch (error: any) {
        postStatus.innerText = "Erro ao enviar: " + error.message;
        postStatus.className = "status-msg error";
    } finally {
        btnPublish.disabled = false;
        btnPublish.innerText = editingNoteId ? "Atualizar Anotação" : "Salvar Anotação";
    }
});

function cancelEditMode() {
    editingNoteId = null;
    postForm.reset();
    (document.getElementById("postDate") as HTMLInputElement).value = "";
    quill.root.innerHTML = "";
    btnPublish.innerText = "Salvar Anotação";
    btnCancelEdit.style.display = "none";
    document.querySelector('#novo-post h2')!.textContent = "Escrever Anotação";
}

btnCancelEdit.addEventListener("click", cancelEditMode);

// Adicionando a função no escopo global para o onclick inline do HTML chamar (Tabs)
(window as any).fetchMyNotes = async function() {
    myNotesList.innerHTML = "<p style='text-align:center; opacity:0.5;'>Buscando suas anotações...</p>";
    try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        myNotesList.innerHTML = "";
        
        if (snapshot.empty) {
            myNotesList.innerHTML = "<p style='text-align:center; opacity:0.5;'>Nenhuma anotação encontrada.</p>";
            return;
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            let dateStr = "Desconhecida";
            if (data.customDate) {
                const parts = data.customDate.split('-');
                if(parts.length === 3) {
                    dateStr = new Date(parts[0], parts[1]-1, parts[2]).toLocaleDateString('pt-BR');
                }
            } else if (data.createdAt) {
                dateStr = data.createdAt.toDate().toLocaleDateString('pt-BR');
            }

            // Precisamos escapar os dados para passar no onclick
            const safeTitle = encodeURIComponent(data.title || "");
            const safeCategory = encodeURIComponent(data.category || "");
            const safeCustomDate = encodeURIComponent(data.customDate || "");
            const safeDesc = encodeURIComponent(data.desc || "");
            const safeContent = encodeURIComponent(data.content || "");
            
            myNotesList.innerHTML += `
                <div class="link-item">
                    <div class="link-item-info">
                        <strong>${data.title}</strong>
                        <span>Categoria: ${data.category || 'Geral'} • Criado em: ${dateStr}</span>
                    </div>
                    <button class="copy-btn" onclick="window.editNote('${doc.id}', '${safeTitle}', '${safeCategory}', '${safeCustomDate}', '${safeDesc}', '${safeContent}')">Editar</button>
                </div>
            `;
        });
    } catch (e: any) {
         myNotesList.innerHTML = "<p style='color:red;'>Erro ao buscar anotações.</p>";
    }
};

(window as any).editNote = function(id: string, safeTitle: string, safeCategory: string, safeCustomDate: string, safeDesc: string, safeContent: string) {
    editingNoteId = id;
    
    // Preencher campos
    (document.getElementById("postTitle") as HTMLInputElement).value = decodeURIComponent(safeTitle);
    (document.getElementById("postCategory") as HTMLInputElement).value = decodeURIComponent(safeCategory);
    (document.getElementById("postDate") as HTMLInputElement).value = decodeURIComponent(safeCustomDate);
    (document.getElementById("postDesc") as HTMLTextAreaElement).value = decodeURIComponent(safeDesc);
    
    // Preencher Quill
    const decodedContent = decodeURIComponent(safeContent);
    quill.root.innerHTML = decodedContent;
    
    // Mudar UI
    document.querySelector('#novo-post h2')!.textContent = "Editar Anotação";
    btnPublish.innerText = "Atualizar Anotação";
    btnCancelEdit.style.display = "inline-block";
    
    // Trocar aba
    const tabBtn = document.querySelector('.tabs button[onclick*="novo-post"]') as HTMLElement;
    if(tabBtn) tabBtn.click();
};

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
            const urlCompleta = `${window.location.origin}/nota?share=${doc.id}`;
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
                        <strong>Relativo a: ${data.originalTitle || 'Anotação Copiada'}</strong>
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
