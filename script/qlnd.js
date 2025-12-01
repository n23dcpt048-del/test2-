// Tab functionality
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.getAttribute('data-tab');
    
    // Remove active class from all tabs and contents
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    // Add active class to current tab and content
    btn.classList.add('active');
    document.getElementById(`${tabId}-content`).classList.add('active');
  });
});

// Modal functionality
const modalOverlay = document.getElementById('modalOverlay');
const closeBtn = document.querySelector('.close-btn');
const cancelBtn = document.querySelector('.cancel-btn');
const confirmBtn = document.querySelector('.confirm-btn');
let currentAction = null;
let currentCard = null;

// Kiểm tra xem modal có tồn tại không
if (modalOverlay && closeBtn && cancelBtn && confirmBtn) {
    // Approve buttons
    document.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        currentCard = this.closest('.content-card');
        showModal('Bạn có chắc chắn muốn duyệt nội dung này?', 'approve');
      });
    });

    // Reject buttons
    document.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        currentCard = this.closest('.content-card');
        showModal('Bạn có chắc chắn muốn từ chối nội dung này?', 'reject');
      });
    });

    // Delete buttons
    document.querySelectorAll('.archive-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        currentCard = this.closest('.content-card');
        showModal('Bạn có chắc chắn muốn xóa nội dung này?', 'archive');
      });
    });

    function showModal(message, action) {
      const modalMessage = document.getElementById('modalMessage');
      if (modalMessage) {
        modalMessage.textContent = message;
      }
      currentAction = action;
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Ngăn scroll khi modal mở
    }

    function hideModal() {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = 'auto'; // Cho phép scroll lại
      currentAction = null;
      currentCard = null;
    }

    closeBtn.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);

    // Confirm button
    confirmBtn.addEventListener('click', function() {
      if (currentAction && currentCard) {
        switch (currentAction) {
          case 'approve':
            // Move card to approved section
            moveCardToApproved(currentCard);
            updateBadge('pending', -1);
            updateBadge('approved', 1);
            alert('Nội dung đã được duyệt!');
            break;
          case 'reject':
            currentCard.remove();
            updateBadge('pending', -1);
            alert('Nội dung đã bị từ chối!');
            break;
          case 'archive':
            currentCard.remove();
            updateBadge('approved', -1);
            alert('Nội dung đã được xóa!');
            break;
        }
      }
      hideModal();
    });

    // Close modal when clicking outside
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) {
        hideModal();
      }
    });

    // Đóng modal bằng phím ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        hideModal();
      }
    });
}

// Hàm di chuyển card sang tab đã duyệt
function moveCardToApproved(card) {
  const approvedContent = document.getElementById('approved-content');
  if (!approvedContent) return;
  
  const contentGrid = approvedContent.querySelector('.content-grid');
  if (!contentGrid) return;
  
  // Clone card và thay đổi thành phiên bản đã duyệt
  const approvedCard = card.cloneNode(true);
  
  // Thay đổi class và nội dung
  approvedCard.classList.add('approved');
  
  // Thêm badge đã duyệt
  const contentImage = approvedCard.querySelector('.content-image');
  if (contentImage) {
    const statusBadge = document.createElement('div');
    statusBadge.className = 'status-badge approved';
    statusBadge.textContent = 'Đã duyệt';
    contentImage.appendChild(statusBadge);
  }
  
  // Thay đổi nút hành động
  const actions = approvedCard.querySelector('.actions');
  if (actions) {
    actions.innerHTML = '<button class="archive-btn">Xóa</button>';
    
    // Thêm event listener cho nút xóa mới
    const newArchiveBtn = approvedCard.querySelector('.archive-btn');
    if (newArchiveBtn) {
      newArchiveBtn.addEventListener('click', function() {
        currentCard = this.closest('.content-card');
        showModal('Bạn có chắc chắn muốn xóa nội dung này?', 'archive');
      });
    }
  }
  
  // Thêm card vào tab đã duyệt
  contentGrid.appendChild(approvedCard);
  
  // Xóa card khỏi tab chờ duyệt
  card.remove();
}

// Update badge counts
function updateBadge(tab, change) {
  const tabBtn = document.querySelector(`[data-tab="${tab}"]`);
  if (tabBtn) {
    const badge = tabBtn.querySelector('.badge');
    if (badge) {
      // Lấy số hiện tại từ text (loại bỏ dấu ngoặc)
      let currentText = badge.textContent;
      let currentCount = parseInt(currentText.replace(/[()]/g, '')) || 0;
      
      // Cập nhật số lượng
      currentCount += change;
      
      // Đảm bảo không âm
      if (currentCount < 0) currentCount = 0;
      
      // Cập nhật text
      badge.textContent = `(${currentCount})`;
      
      // Ẩn badge nếu count là 0
      if (currentCount === 0) {
        badge.style.display = 'none';
      } else {
        badge.style.display = 'inline';
      }
    }
  }
}

// Khởi tạo event listeners cho các nút archive ban đầu
document.querySelectorAll('.archive-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    currentCard = this.closest('.content-card');
    showModal('Bạn có chắc chắn muốn xóa nội dung này?', 'archive');
  });
});

document.querySelector('.logout-btn').addEventListener('click', function() {
    localStorage.clear();
    window.location.href = 'index.html';
});
