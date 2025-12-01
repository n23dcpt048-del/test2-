document.addEventListener('DOMContentLoaded', function() {
    // modal tạo
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const createOrgForm = document.getElementById('createOrgForm');

    // modal chỉnh sửa
    const closeEditModalBtn = document.getElementById('closeEditModalBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editModalOverlay = document.getElementById('editModalOverlay');
    const editOrgForm = document.getElementById('editOrgForm');
    const editButtons = document.querySelectorAll('.edit');

    // modal xác nhận (thêm mới)
    const confirmModalOverlay = document.getElementById('confirmModalOverlay');
    const closeConfirmBtn = document.querySelector('.close-confirm-btn');
    const cancelConfirmBtn = document.querySelector('.cancel-confirm-btn');
    const confirmBtn = document.querySelector('.confirm-btn');
    const confirmMessage = document.getElementById('confirmMessage');
    let currentAction = null;
    let currentCard = null;

    // Mở modal tạo
    openModalBtn.addEventListener('click', () => {
        modalOverlay.classList.add('active');
    });

    // Đóng modal tạo
    function closeModal() {
        modalOverlay.classList.remove('active');
        createOrgForm.reset();
    }

    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Đóng modal tạo khi click bên ngoài 
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Mở modal chỉnh sửa
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const orgId = button.getAttribute('data-org-id');
            const orgName = button.getAttribute('data-org-name');
            const orgLink = button.getAttribute('data-org-link');
            
            console.log('Edit button clicked:', { orgId, orgName, orgLink });
            
            // Điền dữ liệu vào form chỉnh sửa
            document.getElementById('editOrgId').value = orgId;
            document.getElementById('editOrgName').value = orgName;
            document.getElementById('editOrgLink').value = orgLink;
            
            editModalOverlay.classList.add('active');
        });
    });

    // Đóng modal chỉnh sửa
    function closeEditModal() {
        editModalOverlay.classList.remove('active');
        editOrgForm.reset();
    }

    closeEditModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);

    // Đóng modal chỉnh sửa khi click bên ngoài
    editModalOverlay.addEventListener('click', (e) => {
        if (e.target === editModalOverlay) {
            closeEditModal();
        }
    });

    // Xử lý submit form tạo
    createOrgForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Lấy dữ liệu form
        const name = document.getElementById('orgName').value;
        const link = document.getElementById('orgLink').value;
        
        // Tạo card mới
        createNewSocialMediaCard(name, link);
        
        alert('Tạo social media thành công!');
        closeModal();
    });

    // Xử lý submit form chỉnh sửa
    editOrgForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Lấy dữ liệu form
        const id = document.getElementById('editOrgId').value;
        const name = document.getElementById('editOrgName').value;
        const link = document.getElementById('editOrgLink').value;
        
        // Cập nhật card
        updateSocialMediaCard(id, name, link);
        
        alert('Cập nhật social media thành công!');
        closeEditModal();
    });

    // Xử lý nút xóa - SỬA LẠI để dùng modal xác nhận
    document.querySelectorAll('.delete').forEach(button => {
        button.addEventListener('click', function() {
            currentCard = this.closest('.card');
            showConfirmModal('Bạn có chắc chắn muốn xóa social media này?', 'delete');
        });
    });

    // Hàm hiển thị modal xác nhận
    function showConfirmModal(message, action) {
        confirmMessage.textContent = message;
        currentAction = action;
        confirmModalOverlay.classList.add('active');
    }

    // Hàm ẩn modal xác nhận
    function hideConfirmModal() {
        confirmModalOverlay.classList.remove('active');
        currentAction = null;
        currentCard = null;
    }

    // Event listeners cho modal xác nhận
    if (closeConfirmBtn && cancelConfirmBtn && confirmBtn) {
        closeConfirmBtn.addEventListener('click', hideConfirmModal);
        cancelConfirmBtn.addEventListener('click', hideConfirmModal);

        confirmBtn.addEventListener('click', function() {
            if (currentAction && currentCard) {
                switch (currentAction) {
                    case 'delete':
                        currentCard.remove();
                        alert('Đã xóa social media!');
                        break;
                }
            }
            hideConfirmModal();
        });

        // Đóng modal xác nhận khi click bên ngoài
        confirmModalOverlay.addEventListener('click', (e) => {
            if (e.target === confirmModalOverlay) {
                hideConfirmModal();
            }
        });
    }

    // Hàm tạo card mới
    function createNewSocialMediaCard(name, link) {
        const cardsContainer = document.querySelector('.cards');
        const newCard = document.createElement('div');
        newCard.className = 'card';
        
        // Tạo ID mới
        const newId = Date.now();
        
        newCard.innerHTML = `
            <h3>${name}</h3>
            <a class="web" href="${link}">${link}</a>
            <div class="actions">
                <button class="edit" data-org-id="${newId}" data-org-name="${name}" data-org-link="${link}">Sửa</button>
                <button class="delete">Xóa</button>
            </div>
        `;
        
        // Thêm event listeners cho card mới
        addEventListenersToCard(newCard);
        
        cardsContainer.appendChild(newCard);
    }

    // Hàm cập nhật card
    function updateSocialMediaCard(id, name, link) {
        const card = document.querySelector(`.edit[data-org-id="${id}"]`).closest('.card');
        if (card) {
            card.querySelector('h3').textContent = name;
            card.querySelector('.web').textContent = link;
            card.querySelector('.web').href = link;
            
            // Cập nhật data attributes
            const editBtn = card.querySelector('.edit');
            editBtn.setAttribute('data-org-name', name);
            editBtn.setAttribute('data-org-link', link);
        }
    }

    // Hàm thêm event listeners cho card
    function addEventListenersToCard(card) {
        const editBtn = card.querySelector('.edit');
        const deleteBtn = card.querySelector('.delete');
        
        // Event listener cho nút sửa
        editBtn.addEventListener('click', function() {
            const orgId = this.getAttribute('data-org-id');
            const orgName = this.getAttribute('data-org-name');
            const orgLink = this.getAttribute('data-org-link');
            
            document.getElementById('editOrgId').value = orgId;
            document.getElementById('editOrgName').value = orgName;
            document.getElementById('editOrgLink').value = orgLink;
            
            editModalOverlay.classList.add('active');
        });
        
        // Event listener cho nút xóa - SỬA LẠI để dùng modal xác nhận
        deleteBtn.addEventListener('click', function() {
            currentCard = this.closest('.card');
            showConfirmModal('Bạn có chắc chắn muốn xóa social media này?', 'delete');
        });
    }

    // Đóng modal bằng phím ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modalOverlay.classList.contains('active')) {
                closeModal();
            }
            if (editModalOverlay.classList.contains('active')) {
                closeEditModal();
            }
            if (confirmModalOverlay.classList.contains('active')) {
                hideConfirmModal();
            }
        }
    });
});

document.querySelector('.logout-btn').addEventListener('click', function() {
    localStorage.clear();
    window.location.href = 'index.html';
});
