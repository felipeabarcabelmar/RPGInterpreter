document.addEventListener('DOMContentLoaded', () => {
    // Variable Declarations
    const rpgUpload = document.getElementById('rpg-upload');
    const historyList = document.getElementById('history-list');
    const codeDisplay = document.getElementById('code-display');
    const docContent = document.getElementById('doc-content');
    const logicContent = document.getElementById('logic-content');
    const diagramContainer = document.getElementById('diagram-container');
    const currentFilename = document.getElementById('current-filename');
    const viewDiagramBtn = document.getElementById('view-diagram-btn');
    const diagramModal = document.getElementById('diagram-modal');
    const modalDiagramContainer = document.getElementById('modal-diagram-container');
    const closeModal = document.querySelector('.close-modal');
    const uploadCategorySelect = document.getElementById('upload-category');
    const analyzeBtn = document.getElementById('analyze-btn');
    const selectedFileName = document.getElementById('selected-file-name');

    let currentFile = null;

    // Initial Loads - Move to top
    loadHistory();
    loadCategoriesToSelect();

    let categoriesStore = [];

    function renderDiagram(container, html) {
        if (!html) {
            container.innerHTML = "<div style='color:var(--text-dim); text-align:center; padding:20px;'>Diagrama no disponible para este registro.</div>";
            return;
        }
        container.innerHTML = html;
        // No extra processing needed as it's raw HTML/SVG
    }

    async function loadCategoriesToSelect() {
        if (!uploadCategorySelect) return;
        try {
            const response = await fetch('/categories');
            if (!response.ok) throw new Error("Categories fetch failed");
            const categories = await response.json();
            categoriesStore = categories; // Store globally for menu use

            uploadCategorySelect.innerHTML = '';
            const defaultOpt = document.createElement('option');
            defaultOpt.value = "";
            defaultOpt.textContent = "Sin Categoría / Módulo";
            uploadCategorySelect.appendChild(defaultOpt);

            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id;
                opt.textContent = cat.name;
                uploadCategorySelect.appendChild(opt);
            });
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    // Load history
    async function loadHistory() {
        try {
            const response = await fetch('/files');
            if (!response.ok) throw new Error("Failed to fetch files");
            const files = await response.json();

            // Clear list cleanly
            while (historyList.firstChild) {
                historyList.removeChild(historyList.firstChild);
            }

            // Group files by category
            const grouped = {};
            files.forEach(file => {
                const catName = file.category_name || 'Sin Categoría';
                if (!grouped[catName]) grouped[catName] = [];
                grouped[catName].push(file);
            });

            // Sort categories (Sin Categoría last)
            const sortedGroupNames = Object.keys(grouped).sort((a, b) => {
                if (a === 'Sin Categoría') return 1;
                if (b === 'Sin Categoría') return -1;
                return a.localeCompare(b);
            });

            sortedGroupNames.forEach(groupName => {
                const groupHeader = document.createElement('div');
                groupHeader.className = 'history-group-header';
                groupHeader.textContent = groupName;
                historyList.appendChild(groupHeader);

                const groupList = document.createElement('ul');
                groupList.className = 'history-group-list';

                grouped[groupName].forEach(file => {
                    const li = document.createElement('li');
                    li.className = 'history-item';

                    const textContainer = document.createElement('div');
                    textContainer.className = 'file-info-container';
                    textContainer.onclick = () => displayFileData(file);

                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = file.filename;
                    nameSpan.className = 'file-name-link';

                    textContainer.appendChild(nameSpan);

                    // Options Menu
                    const optionsContainer = document.createElement('div');
                    optionsContainer.className = 'options-container';

                    const trigger = document.createElement('span');
                    trigger.className = 'options-trigger';
                    trigger.innerHTML = '&#8942;';
                    trigger.onclick = (e) => {
                        e.stopPropagation();
                        closeAllMenus(dropdown);
                        dropdown.classList.toggle('show');
                    };

                    const dropdown = document.createElement('div');
                    dropdown.className = 'options-dropdown';

                    // Menu Item: Categorizar
                    const categorizeItem = document.createElement('div');
                    categorizeItem.className = 'dropdown-item';
                    categorizeItem.textContent = 'Categorizar';
                    categorizeItem.onclick = (e) => {
                        e.stopPropagation();
                        showCategorizePrompt(file);
                        dropdown.classList.remove('show');
                    };

                    // Menu Item: Editar
                    const editItem = document.createElement('div');
                    editItem.className = 'dropdown-item';
                    editItem.textContent = 'Editar';
                    editItem.onclick = (e) => {
                        e.stopPropagation();
                        window.location.href = `/edit?id=${file.id}`;
                    };

                    dropdown.appendChild(categorizeItem);
                    dropdown.appendChild(editItem);
                    optionsContainer.appendChild(trigger);
                    optionsContainer.appendChild(dropdown);

                    li.appendChild(textContainer);
                    li.appendChild(optionsContainer);
                    groupList.appendChild(li);
                });

                historyList.appendChild(groupList);
            });
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }

    function closeAllMenus(except) {
        document.querySelectorAll('.options-dropdown').forEach(d => {
            if (d !== except) d.classList.remove('show');
        });
    }

    const categorizeModal = document.getElementById('categorize-modal');
    const modalCatSelect = document.getElementById('modal-category-select');
    const catFileName = document.getElementById('cat-file-name');
    const saveCatBtn = document.getElementById('save-cat-btn');
    const closeCatModal = document.getElementById('close-cat-modal');
    let fileToCategorize = null;

    async function showCategorizePrompt(file) {
        fileToCategorize = file;
        catFileName.textContent = `Archivo: ${file.filename}`;

        // Populate select
        while (modalCatSelect.firstChild) modalCatSelect.removeChild(modalCatSelect.firstChild);

        const defaultOpt = document.createElement('option');
        defaultOpt.value = "";
        defaultOpt.textContent = "Sin Categoría";
        modalCatSelect.appendChild(defaultOpt);

        categoriesStore.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            if (file.category_id === cat.id) opt.selected = true;
            modalCatSelect.appendChild(opt);
        });

        categorizeModal.style.display = "block";
    }

    if (saveCatBtn) {
        saveCatBtn.onclick = async () => {
            if (!fileToCategorize) return;
            const catId = modalCatSelect.value === "" ? null : parseInt(modalCatSelect.value);

            try {
                const response = await fetch(`/files/${fileToCategorize.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category_id: catId })
                });
                if (response.ok) {
                    categorizeModal.style.display = "none";
                    loadHistory();
                } else {
                    alert("Error al actualizar categoría");
                }
            } catch (error) {
                console.error('Error updating category:', error);
            }
        };
    }

    if (closeCatModal) {
        closeCatModal.onclick = () => categorizeModal.style.display = "none";
    }
    // Close menus on click outside
    window.addEventListener('click', (event) => {
        document.querySelectorAll('.options-dropdown').forEach(d => d.classList.remove('show'));
        // Also close categorize modal if clicked outside
        if (event.target == categorizeModal) {
            categorizeModal.style.display = "none";
        }
    });

    async function deleteFile(id) {
        try {
            const response = await fetch(`/files/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadHistory();
                if (currentFile && currentFile.id === id) {
                    resetDisplay();
                }
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }

    function resetDisplay() {
        currentFile = null;
        currentFilename.textContent = "Seleccione un archivo";
        codeDisplay.textContent = "Seleccione o cargue un archivo para comenzar...";
        docContent.textContent = "Esperando análisis...";
        logicContent.textContent = "Esperando análisis...";
        diagramContainer.innerHTML = "";
    }

    function displayFileData(file) {
        currentFile = file;
        currentFilename.textContent = file.filename;
        codeDisplay.textContent = file.content;
        docContent.textContent = file.documentation;
        logicContent.textContent = file.business_logic;
        renderDiagram(diagramContainer, file.mermaid_diagram);
    }

    function renderDiagram(container, code) {
        if (!code) {
            container.innerHTML = "Diagrama no disponible";
            return;
        }
        container.innerHTML = code;
        container.removeAttribute('data-processed');
        mermaid.contentLoaded();
    }

    // Modal Logic
    if (viewDiagramBtn) {
        viewDiagramBtn.onclick = async () => {
            if (!currentFile) return alert("Primero selecciona un archivo");

            diagramModal.style.display = "block";

            // If diagram doesn't exist, trigger generation
            if (!currentFile.mermaid_diagram || currentFile.mermaid_diagram.includes("graph TD")) {
                modalDiagramContainer.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--neon-blue);">
                        <div class="loader" style="width: 50px; height: 50px; border: 3px solid rgba(0,212,255,0.1); border-top: 3px solid var(--neon-blue); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                        <p style="font-family: 'Orbitron', sans-serif; letter-spacing: 2px;">GENERANDO DIAGRAMA DINÁMICO...</p>
                        <p style="font-size: 0.8rem; color: var(--text-dim); margin-top: 10px;">La IA está interpretando el flujo del programa</p>
                    </div>
                `;

                try {
                    const response = await fetch(`/files/${currentFile.id}/generate-diagram`, { method: 'POST' });
                    const data = await response.json();
                    if (data.html_diagram) {
                        currentFile.mermaid_diagram = data.html_diagram; // Update local state
                        renderDiagram(modalDiagramContainer, data.html_diagram);
                        // Also update dashboard diagram if it's the same file
                        renderDiagram(diagramContainer, data.html_diagram);
                    } else {
                        modalDiagramContainer.innerHTML = `<div style="color:#ff4d4d; border:1px solid #ff4d4d; padding:20px; border-radius:8px;">${data.detail || "Error al generar diagrama"}</div>`;
                    }
                    Riverside
                } catch (error) {
                    console.error("Error generating diagram:", error);
                    modalDiagramContainer.innerHTML = "Error de conexión";
                }
            } else {
                renderDiagram(modalDiagramContainer, currentFile.mermaid_diagram);
            }
        };
    }

    if (closeModal) {
        closeModal.onclick = () => {
            diagramModal.style.display = "none";
        };
    }

    window.onclick = (event) => {
        if (event.target == diagramModal) {
            diagramModal.style.display = "none";
        }
    };

    // Handle File Selection
    rpgUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedFileName.textContent = file.name;
            analyzeBtn.style.display = 'block';
        } else {
            selectedFileName.textContent = "Ningún archivo seleccionado";
            analyzeBtn.style.display = 'none';
        }
    });

    // Handle Manual Analysis
    analyzeBtn.addEventListener('click', async () => {
        const file = rpgUpload.files[0];
        if (!file) return;

        const categoryId = uploadCategorySelect.value;
        const formData = new FormData();
        formData.append('file', file);
        if (categoryId) formData.append('category_id', categoryId);

        analyzeBtn.disabled = true;
        analyzeBtn.textContent = "Analizando...";
        currentFilename.textContent = "Procesando Registro...";

        try {
            const response = await fetch('/upload' + (categoryId ? `?category_id=${categoryId}` : ''), {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error("Error en el servidor");

            const data = await response.json();
            displayFileData(data);
            loadHistory();

            // Success reset
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = "Analizar Registro";
            analyzeBtn.style.display = 'none';
            selectedFileName.textContent = "Archivo procesado con éxito";
            rpgUpload.value = ''; // Reset input
        } catch (error) {
            console.error('Error:', error);
            currentFilename.textContent = "Error al procesar el archivo";
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = "Reintentar Análisis";
        }
    });

});
