document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const fileId = urlParams.get('id');
    const editForm = document.getElementById('edit-form');
    const docText = document.getElementById('doc-text');
    const logicText = document.getElementById('logic-text');
    const editCategory = document.getElementById('edit-category');

    if (!fileId) {
        alert("ID de archivo no proporcionado");
        window.location.href = "/";
        return;
    }

    // Load categories
    try {
        const catRes = await fetch('/categories');
        const categories = await catRes.json();
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            editCategory.appendChild(opt);
        });
    } catch (e) { console.error(e); }

    // Load current data
    try {
        const response = await fetch(`/files/${fileId}`);
        if (!response.ok) throw new Error("Archivo no encontrado");
        const file = await response.json();

        docText.value = file.documentation;
        logicText.value = file.business_logic;
        if (file.category_id) editCategory.value = file.category_id;
    } catch (error) {
        console.error('Error fetching file data:', error);
        alert("Error al cargar los datos del archivo");
        window.location.href = "/";
    }

    // Handle form submission
    editForm.onsubmit = async (e) => {
        e.preventDefault();

        const category_val = editCategory.value;
        const updateData = {
            documentation: docText.value,
            business_logic: logicText.value,
            category_id: (category_val && category_val !== "") ? parseInt(category_val) : null
        };

        try {
            const response = await fetch(`/files/${fileId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                alert("Cambios guardados con éxito");
                window.location.href = "/";
            } else {
                throw new Error("Error al guardar los cambios");
            }
        } catch (error) {
            console.error('Error updating file:', error);
            alert("Error al guardar los cambios");
        }
    };

    const deleteBtn = document.getElementById('delete-btn');
    const deleteModal = document.getElementById('delete-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');

    if (deleteBtn && deleteModal) {
        deleteBtn.onclick = () => {
            deleteModal.style.display = "block";
        };

        cancelDeleteBtn.onclick = () => {
            deleteModal.style.display = "none";
        };

        window.onclick = (event) => {
            if (event.target == deleteModal) {
                deleteModal.style.display = "none";
            }
        };

        confirmDeleteBtn.onclick = async () => {
            try {
                const response = await fetch(`/files/${fileId}`, { method: 'DELETE' });
                if (response.ok) {
                    deleteModal.style.display = "none";
                    window.location.href = "/";
                } else {
                    alert("Error al eliminar el registro");
                }
            } catch (error) {
                console.error('Error deleting file:', error);
            }
        };
    }
});
