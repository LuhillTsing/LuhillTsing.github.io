function toggleDarkMode() {
  const body = document.body;
  const isDarkMode = body.classList.contains('dark-mode');

  if (isDarkMode) {
      // 切换到白天模式
      body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
  } else {
      // 切换到黑夜模式
      body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
  }
}

// 页面加载时根据 localStorage 的设置应用主题
window.onload = () => {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
      document.body.classList.add('dark-mode');
  }
};