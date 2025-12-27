 document.addEventListener('DOMContentLoaded', function() {
      // 获取DOM元素
      const passwordInput = document.getElementById('new-password');
      const confirmPasswordInput = document.getElementById('confirm-password');
      const passwordStrengthBar = document.getElementById('password-strength-bar');
      const passwordStrengthText = document.getElementById('password-strength-text');
      const passwordHints = document.getElementById('password-hints');
      const passwordMatchMessage = document.getElementById('password-match-message');
      const submitButton = document.getElementById('submit-button');
      const statusMessage = document.getElementById('status-message');
      const messageContent = document.getElementById('message-content');
      const togglePasswordButtons = document.querySelectorAll('.toggle-password');

      // 密码强度检查
      passwordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        let strength = 0;
        let strengthText = '未输入';
        let strengthColor = 'bg-neutral-400';

        // 更新密码提示
        if (password.length > 0) {
          passwordHints.classList.remove('hidden');
        } else {
          passwordHints.classList.add('hidden');
        }

        // 密码长度检查
        if (password.length >= 8) {
          document.getElementById('hint-length').className = 'fa fa-check-circle text-secondary mr-1';
          strength += 1;
        } else {
          document.getElementById('hint-length').className = 'fa fa-circle-o text-neutral-400 mr-1';
        }

        // 大写字母检查
        if (/[A-Z]/.test(password)) {
          document.getElementById('hint-uppercase').className = 'fa fa-check-circle text-secondary mr-1';
          strength += 1;
        } else {
          document.getElementById('hint-uppercase').className = 'fa fa-circle-o text-neutral-400 mr-1';
        }

        // 小写字母检查
        if (/[a-z]/.test(password)) {
          document.getElementById('hint-lowercase').className = 'fa fa-check-circle text-secondary mr-1';
          strength += 1;
        } else {
          document.getElementById('hint-lowercase').className = 'fa fa-circle-o text-neutral-400 mr-1';
        }

        // 数字检查
        if (/[0-9]/.test(password)) {
          document.getElementById('hint-number').className = 'fa fa-check-circle text-secondary mr-1';
          strength += 1;
        } else {
          document.getElementById('hint-number').className = 'fa fa-circle-o text-neutral-400 mr-1';
        }

        // 特殊字符检查
        if (/[^A-Za-z0-9]/.test(password)) {
          document.getElementById('hint-special').className = 'fa fa-check-circle text-secondary mr-1';
          strength += 1;
        } else {
          document.getElementById('hint-special').className = 'fa fa-circle-o text-neutral-400 mr-1';
        }

        // 更新强度条和文本
        switch (strength) {
          case 0:
            strengthText = '未输入';
            strengthColor = 'bg-neutral-400';
            passwordStrengthBar.style.width = '0%';
            break;
          case 1:
            strengthText = '非常弱';
            strengthColor = 'bg-danger';
            passwordStrengthBar.style.width = '20%';
            break;
          case 2:
            strengthText = '弱';
            strengthColor = 'bg-warning';
            passwordStrengthBar.style.width = '40%';
            break;
          case 3:
            strengthText = '中等';
            strengthColor = 'bg-warning/70';
            passwordStrengthBar.style.width = '60%';
            break;
          case 4:
            strengthText = '强';
            strengthColor = 'bg-secondary/70';
            passwordStrengthBar.style.width = '80%';
            break;
          case 5:
            strengthText = '非常强';
            strengthColor = 'bg-secondary';
            passwordStrengthBar.style.width = '100%';
            break;
        }

        // 移除所有颜色类并添加新的
        passwordStrengthBar.className = passwordStrengthBar.className.replace(/bg-\w+/g, '');
        passwordStrengthBar.classList.add('password-strength-bar', strengthColor);
        passwordStrengthText.textContent = strengthText;

        // 更新颜色
        switch (strengthText) {
          case '非常弱':
            passwordStrengthText.className = 'text-danger';
            break;
          case '弱':
            passwordStrengthText.className = 'text-warning';
            break;
          case '中等':
            passwordStrengthText.className = 'text-warning/70';
            break;
          case '强':
            passwordStrengthText.className = 'text-secondary/70';
            break;
          case '非常强':
            passwordStrengthText.className = 'text-secondary';
            break;
          default:
            passwordStrengthText.className = 'text-neutral-500';
        }

        // 检查两次输入的密码是否匹配
        checkPasswordMatch();
      });

      // 确认密码检查
      confirmPasswordInput.addEventListener('input', checkPasswordMatch);

      function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (confirmPassword.length > 0) {
          if (password === confirmPassword) {
            passwordMatchMessage.textContent = '密码匹配';
            passwordMatchMessage.className = 'text-secondary text-sm mt-1';
            passwordMatchMessage.classList.remove('hidden');
            submitButton.disabled = false;
            submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
          } else {
            passwordMatchMessage.textContent = '两次输入的密码不匹配';
            passwordMatchMessage.className = 'text-danger text-sm mt-1';
            passwordMatchMessage.classList.remove('hidden');
            submitButton.disabled = true;
            submitButton.classList.add('opacity-50', 'cursor-not-allowed');
          }
        } else {
          passwordMatchMessage.classList.add('hidden');
        }
      }

      // 切换密码可见性
      togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
          const input = this.previousElementSibling;
          const icon = this.querySelector('i');

          if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
          } else {
            input.type = 'password';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
          }
        });
      });

      // 表单提交处理
      document.getElementById('password-change-form').addEventListener('submit', function(e) {
  e.preventDefault();

  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fa fa-spinner fa-spin mr-2"></i> 正在修改...';

  const oldPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;

  fetch('/change_password/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRFToken': getCSRFToken()
    },
    body: new URLSearchParams({
      old_password: oldPassword,
      new_password: newPassword
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      messageContent.innerHTML = `
        <div class="flex items-start">
          <i class="fa fa-check-circle text-2xl text-secondary mr-3"></i>
          <div>
            <h3 class="text-sm font-medium text-secondary">密码修改成功</h3>
            <p class="mt-2 text-sm text-neutral-600">即将跳转到登录页面...</p>
          </div>
        </div>
      `;
      messageContent.className = 'p-4 rounded-lg border-l-4 border-secondary bg-secondary/5';
      statusMessage.classList.remove('hidden');
      setTimeout(() => window.location.href = '/login/', 3000);
    } else {
      showError(data.message || '密码修改失败，请重试。');
    }
  })
  .catch(() => {
    showError('网络错误，请稍后重试');
  })
  .finally(() => {
    submitButton.disabled = false;
    submitButton.innerHTML = '<span>确认修改</span><i class="fa fa-arrow-right ml-2"></i>';
  });
});

    });

function getCSRFToken() {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue || '';
}
