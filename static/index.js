document.addEventListener('DOMContentLoaded', () => {
  // DOM元素
  const navBtns = document.querySelectorAll('.nav-btn');
  const contentSections = document.querySelectorAll('.content-section');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userMenu = document.getElementById('user-menu');
  const startTrainingBtn = document.getElementById('start-training');
  const trainingStatus = document.getElementById('training-status');
  const trainingProgress = document.getElementById('training-progress');
  const trainingMessage = document.getElementById('training-message');
  const startPredictionBtn = document.getElementById('start-prediction');
  const warningAlert = document.getElementById('warning-alert');
  const closeAlert = document.getElementById('close-alert');
  const trainDataInput = document.getElementById('train-data');
  const fileList = document.getElementById('file-list');
  const filesContainer = document.getElementById('files-container');
  const predictionChartCtx = document.getElementById('prediction-chart-canvas').getContext('2d');
  const modelSelect = document.getElementById('model-select');
  const warningThresholda = Number(document.getElementById('warning-threshold').value);
  const fileInput = document.getElementById('predict-data');
  const filePreview = document.getElementById('file-preview');
  const fileName = document.getElementById('file-name');
  const fileSize = document.getElementById('file-size');
  const fileIcon = document.getElementById('file-icon');
  const removeFileBtn = document.getElementById('remove-file');

  // 维护文件列表，解决 input.files 只读且无法修改问题
  let currentFiles = [];
  Chart.register(window['chartjs-plugin-annotation']);
  const warningThreshold = warningThresholda;  // 预警阈值，单位 %


  let predictionChart = new Chart(predictionChartCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: '实际值',
        data: [],
        borderColor: '#165DFF',
        backgroundColor: 'rgba(22, 93, 255, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1
      },
      {
        label: '预测值',
        data: [],
        borderColor: '#FF7D00',
        backgroundColor: 'rgba(255, 125, 0, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.1
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: '电池容量预测结果' },
      tooltip: { mode: 'index', intersect: false }
      // ⚠️这里 plugins 里面就不含 annotation 了
    },
    scales: {
      x: { title: { display: true, text: '循环（cycle）' } },
      y: {
        title: { display: true, text: '电池容量 (%)' },
        min: 0, max: 100
      }
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false }
  }
});


  fetch('http://localhost:8001/models/')
    .then(res => res.json())
    .then(models => {
      const modelSelect = document.getElementById('model-select');
      modelSelect.innerHTML = '<option value="">-- 请选择训练好的模型 --</option>';
      models.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        modelSelect.appendChild(opt);
      });
    });

  // 导航切换
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');

      navBtns.forEach(b => {
        b.classList.remove('active', 'text-primary', 'border-b-2', 'border-primary');
        b.classList.add('text-neutral');
      });
      btn.classList.add('active', 'text-primary', 'border-b-2', 'border-primary');
      btn.classList.remove('text-neutral');

      contentSections.forEach(section => section.classList.add('hidden'));
      document.getElementById(target).classList.remove('hidden');

      mobileMenu.classList.add('hidden');
      userMenu.classList.add('hidden');
    });
  });

  // 移动菜单切换
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    userMenu.classList.add('hidden');
  });

  // 用户菜单切换
  userMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userMenu.classList.toggle('hidden');
    mobileMenu.classList.add('hidden');
  });

  // 点击其他地方关闭用户菜单
  document.addEventListener('click', () => userMenu.classList.add('hidden'));

  // 文件选择处理
  trainDataInput.addEventListener('change', (e) => {
    currentFiles = Array.from(e.target.files);
    updateFileList();
  });

  // 更新文件列表显示
  function updateFileList() {
    if (currentFiles.length === 0) {
      fileList.classList.add('hidden');
      trainDataInput.value = '';
      return;
    }
    fileList.classList.remove('hidden');
    filesContainer.innerHTML = '';
    currentFiles.forEach((file, idx) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'flex items-center justify-between p-2 bg-light rounded-md';
      fileItem.innerHTML = `
        <div class="flex items-center">
          <i class="fa fa-file-text-o text-primary mr-2"></i>
          <span class="text-sm truncate max-w-[80%]">${file.name}</span>
        </div>
        <button type="button" class="text-neutral hover:text-danger transition-colors delete-file" data-index="${idx}">
          <i class="fa fa-times"></i>
        </button>
      `;
      filesContainer.appendChild(fileItem);
    });
  }

  // 删除文件事件委托
  filesContainer.addEventListener('click', (e) => {
    if (e.target.closest('.delete-file')) {
      const idx = parseInt(e.target.closest('.delete-file').getAttribute('data-index'));
      currentFiles.splice(idx, 1);
      updateFileList();
    }
  });

  // 开始训练按钮事件
  startTrainingBtn.addEventListener('click', () => {
    if (!currentFiles || currentFiles.length < 2) {
      showToast('请至少上传两个文件（最后一个作为测试集）','error');
      return;
    }

    const lookBack = parseInt(document.getElementById('input-length').value, 10);
    const T = parseInt(document.getElementById('predict-length').value, 10);
    const rate = parseFloat(document.getElementById('learning-rate').value);
    const modelName = document.getElementById('model-name').value.trim();

    if (!modelName) {
      showToast('请填写模型名称','error');
      return;
    }
    if (isNaN(lookBack) || lookBack < 1) {
      showToast('输入步长必须是大于0的整数','error');
      return;
    }
    if (isNaN(T) || T < 1) {
      showToast('预测步长必须是大于0的整数','error');
      return;
    }
    if (isNaN(rate) || rate <= 0) {
      showToast('学习率必须是正数','error');
      return;
    }

    const formData = new FormData();
    formData.append('name', modelName);
    formData.append('look_back', lookBack);
    formData.append('T', T);
    formData.append('rate', rate);

    currentFiles.forEach(file => {
      formData.append('files', file);
    });

    startTrainingBtn.disabled = true;
    startTrainingBtn.innerHTML = `<i class="fa fa-spinner fa-spin mr-2"></i>训练中...`;

    fetch('http://localhost:8001/train/', {
      method: 'POST',
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        showToast(`训练开始: ${data.message || '开始'}`,'success');
        startPollingTrainStatus(modelName);
      })
      .catch(err => {
        console.error(err);
        showToast('训练失败，请查看控制台或服务器日志','error');
      })
  });

  // 训练状态轮询函数
  function startPollingTrainStatus(modelName) {
    trainingStatus.classList.remove('hidden');
    trainingProgress.style.width = '0%';
    trainingMessage.textContent = '初始化训练环境...';

    const totalEpochs = 300;
    const pollInterval = 1000;

    const poller = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:8001/train_status/');
        if (!res.ok) throw new Error('无法获取训练状态');
        const status = await res.json();

        let progressPercent = (status.epoch / totalEpochs) * 100;
        if (progressPercent > 100) progressPercent = 100;

        trainingProgress.style.width = progressPercent + '%';

        if (status.status === 'running') {
          if (progressPercent < 10) {
            trainingMessage.textContent = '初始化训练环境...';
          } else if (progressPercent < 30) {
            trainingMessage.textContent = '数据预处理完成，开始训练...';
          } else {
            trainingMessage.textContent = `训练中... Epoch ${status.epoch} / ${totalEpochs}`;
          }
        } else if (status.status === 'finished') {
          trainingMessage.textContent = '训练完成！模型已保存';


          const option = document.createElement('option');
          option.value = modelName.toLowerCase().replace(/\s+/g, '_');
          option.textContent = modelName;
          modelSelect.appendChild(option);

          clearInterval(poller);
          setTimeout(() => trainingStatus.classList.add('hidden'), 3000);
          startTrainingBtn.disabled = false;
          startTrainingBtn.innerHTML = `<i class="fa fa-play mr-2"></i>开始训练`;
        } else if (status.status === 'error') {
          trainingMessage.textContent = `训练失败：${status.error_msg}`;
          clearInterval(poller);
        }
      } catch (err) {
        trainingMessage.textContent = '获取训练状态失败，稍后重试...';
        console.error(err);
        clearInterval(poller);
      }
    }, pollInterval);
  }



  // 监听文件选择事件
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      // 显示文件预览区域
      filePreview.classList.remove('hidden');

      // 设置文件名和大小
      fileName.textContent = file.name;
      fileSize.textContent = formatFileSize(file.size);

      // 根据文件类型更改图标
      updateFileIcon(file.name);

      // 为移除文件按钮添加事件监听
      removeFileBtn.addEventListener('click', function() {
        // 重置文件输入
        fileInput.value = '';
        // 隐藏预览区域
        filePreview.classList.add('hidden');
      });
    }
  });

  // 根据文件扩展名更新图标
  function updateFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();

    // 重置图标类
    fileIcon.className = 'fa text-xl text-primary mr-3';

    // 根据文件类型添加不同的图标
    switch(ext) {
      case 'csv':
        fileIcon.classList.add('fa-file-text-o');
        break;
      case 'xls':
      case 'xlsx':
        fileIcon.classList.add('fa-file-excel-o');
        break;
      default:
        fileIcon.classList.add('fa-file-o');
    }
  }

  // 格式化文件大小显示
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  document.getElementById('start-prediction').addEventListener('click', async () => {
  const modelSelect = document.getElementById('model-select');
  const predictDataInput = document.getElementById('predict-data');
  const warningThreshold = parseFloat(document.getElementById('warning-threshold').value);
  const lookBack = parseInt(document.getElementById('input-length').value, 10);
  const T = parseInt(document.getElementById('predict-length').value, 10);

  if (!modelSelect.value) {
    showToast('请选择训练好的模型');
    return;
  }

  if (!predictDataInput.files.length) {
    showToast('请上传预测数据');
    return;
  }

  if (isNaN(warningThreshold) || warningThreshold < 0 || warningThreshold > 100) {
    showToast('请输入有效的预警阈值（0~100）','error');
    return;
  }

  if (isNaN(lookBack) || lookBack <= 0) {
    showToast('请填写有效的输入步长');
    return;
  }

  if (isNaN(T) || T <= 0) {
    showToast('请填写有效的预测步长');
    return;
  }

  const file = predictDataInput.files[0];

  const formData = new FormData();
  formData.append('model_name', modelSelect.value);
  formData.append('file', file);
  formData.append('threshold', warningThreshold);
  formData.append('look_back', lookBack);
  formData.append('T', T);

  // 设置按钮状态为加载中
  const btn = document.getElementById('start-prediction');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa fa-spinner fa-spin mr-2"></i>预测中...`;

  try {
    const response = await fetch('http://localhost:8001/predict/', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.error) {
      showToast(`预测失败：${data.error}`,'error');
      console.error(data.error);
      return;
    }

    const actual = data.actual.map(x => x[0] * 100);
    const predict = data.predict.map(x => x[0] * 100);

    const labels = Array.from({ length: actual.length }, (_, i) => i.toString());

    predictionChart.options.plugins.annotation.annotations.warningLine = {
      type: 'line',
      yMin: warningThreshold,
      yMax: warningThreshold,
      borderColor: 'red',
      borderWidth: 2,
      borderDash: [6, 6],
      label: {
      content: '预警线',
      enabled: true,
      position: 'start',
      backgroundColor: 'rgba(255, 0, 0, 0.7)',
      color: '#fff',
      font: { size: 12 }
      }
    };

    predictionChart.update();
    // 更新图表数据
    predictionChart.data.labels = labels;
    predictionChart.data.datasets[0].data = actual;
    predictionChart.data.datasets[1].data = predict;
    predictionChart.update();

    // 更新指标
    document.getElementById('rmse-value').textContent = data.rmse.toFixed(4);
    document.getElementById('mae-value').textContent = data.mae.toFixed(4);
    document.getElementById('r2-value').textContent = data.r2.toFixed(4);

    // 是否触发预警
    if (data.warning) {
      document.getElementById('warning-alert').classList.remove('translate-y-20', 'opacity-0');
    }

    // 自动跳转到预测图表
    document.querySelector('[data-target="prediction-chart"]').click();

    showToast('预测完成！','success');

  } catch (error) {
    showToast('发生错误，请查看控制台','error');
    console.error(error);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa fa-line-chart mr-2"></i>开始预测`;
  }
});


  // 关闭预警通知
  closeAlert.addEventListener('click', () => {
    warningAlert.classList.add('translate-y-20', 'opacity-0');
  });
});

