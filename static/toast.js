/**
 * 显示Toast提示
 * @param {string} message - 提示内容
 * @param {string} type - 提示类型：success/error/warning/info（默认info）
 * @param {number} duration - 自动关闭时间（毫秒，默认3000）
 */
function showToast(message, type = 'info', duration = 3000) {
  // 1. 创建Toast元素
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  // 2. 设置图标（依赖FontAwesome）
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };

  // 3. 填充内容
  toast.innerHTML = `
    <i class="toast-icon fa ${icons[type]}"></i>
    <p class="toast-message">${message}</p>
    <button class="toast-close">
      <i class="fa fa-times"></i>
    </button>
  `;

  // 4. 添加到容器
  const container = document.getElementById('toast-container');
  container.appendChild(toast);

  // 5. 触发显示动画（延迟10ms确保DOM已更新）
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // 6. 自动关闭
  const timer = setTimeout(() => {
    closeToast(toast);
  }, duration);

  // 7. 点击关闭按钮或Toast本身关闭
  toast.addEventListener('click', (e) => {
    // 防止事件冒泡重复触发
    if (e.target.closest('.toast-close') || e.currentTarget === e.target) {
      clearTimeout(timer);
      closeToast(toast);
    }
  });
}

/**
 * 关闭Toast并移除元素
 * @param {HTMLElement} toast - Toast元素
 */
function closeToast(toast) {
  toast.classList.remove('show');
  // 等待动画结束后移除DOM
  setTimeout(() => {
    toast.remove();
  }, 300);
}