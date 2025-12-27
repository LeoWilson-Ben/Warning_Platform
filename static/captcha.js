document.addEventListener("DOMContentLoaded", () => {
  const sendCodeBtn = document.getElementById("sendCodeBtn");
  const emailInput = document.getElementById("email");

  if (sendCodeBtn) {
    sendCodeBtn.addEventListener("click", () => {
      const email = emailInput.value.trim();
      if (!email || !email.includes("@")) {
        showToast("请输入有效的邮箱！",'error');
        return;
      }

      // 禁用按钮并显示发送中
      sendCodeBtn.disabled = true;
      sendCodeBtn.textContent = "发送中...";

      // 发 GET 请求
      fetch(`/captcha?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.code === 200) {
            showToast("验证码已发送！",'success');
            startCountdown(sendCodeBtn, 60); // 开始倒计时
          } else {
            showToast(data.message || "发送失败！",'info');
            resetButton();
          }
        })
        .catch((err) => {
          console.error("请求失败：", err);
          showToast("发送出错，请稍后重试！",'error');
          resetButton();
        });
    });
  }

  function startCountdown(button, seconds) {
    let remaining = seconds;
    button.disabled = true;
    button.textContent = `重新发送（${remaining}s）`;

    const timer = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(timer);
        resetButton();
      } else {
        button.textContent = `重新发送（${remaining}s）`;
      }
    }, 1000);
  }

  function resetButton() {
    sendCodeBtn.disabled = false;
    sendCodeBtn.textContent = "发送验证码";
  }

  function getCSRFToken() {
    const cookies = document.cookie.split("; ");
    const token = cookies.find(row => row.startsWith("csrftoken="));
    return token ? token.split("=")[1] : "";
  }
});
