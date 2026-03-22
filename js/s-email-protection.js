/**
 * 邮箱保护脚本 - 防止邮箱地址被爬虫收集
 * 版本: 1.0.0
 * 使用说明:
 * 1. 将本文件保存到 /source/js/email-protection.js
 * 2. 在主题布局文件中引用: <script src="/js/email-protection.js"></script>
 * 3. 修改HTML中的邮箱链接，使用以下格式之一:
 *    - data-email: "user#domain.com" (使用#替代@)
 *    - data-email-b64: "dXNlckBkb21haW4uY29t" (Base64编码)
 */

(function() {
  'use strict';
  
  // 配置选项
  const config = {
    debug: false,           // 调试模式
    autoInit: true,         // 自动初始化
    protectionLevel: 'high' // 保护级别: 'low', 'medium', 'high'
  };
  
  // 邮箱解码函数 - 处理 # 替代 @ 的情况
  function decodeEmail(encoded) {
    if (!encoded) return '';
    return encoded.replace(/#/g, '@');
  }
  
  // Base64解码函数
  function decodeBase64(str) {
    try {
      return atob(str);
    } catch (e) {
      console.error('Base64解码失败:', e);
      return '';
    }
  }
  
  // ROT13解码函数 - 额外保护层
  function decodeROT13(str) {
    return str.replace(/[a-zA-Z]/g, function(c) {
      return String.fromCharCode(
        (c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26
      );
    });
  }
  
  // 邮箱验证函数
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // 处理单个邮箱元素
  function processEmailElement(element) {
    const emailAttr = element.dataset.email;
    const b64Attr = element.dataset.emailB64;
    const rot13Attr = element.dataset.emailRot13;
    
    let email = '';
    
    // 根据保护级别选择解码方式
    if (rot13Attr && config.protectionLevel === 'high') {
      email = decodeROT13(rot13Attr);
    } else if (b64Attr) {
      email = decodeBase64(b64Attr);
    } else if (emailAttr) {
      email = decodeEmail(emailAttr);
    }
    
    // 验证邮箱格式
    if (email && validateEmail(email)) {
      // 设置链接
      element.href = 'mailto:' + email;
      
      // 如果元素没有文本内容，设置邮箱地址为文本
      if (!element.textContent.trim() || element.textContent === element.href) {
        element.textContent = email;
      }
      
      // 添加title属性（可选）
      element.title = '发送邮件至 ' + email;
      
      // 移除data属性，防止二次处理
      delete element.dataset.email;
      delete element.dataset.emailB64;
      delete element.dataset.emailRot13;
      
      if (config.debug) {
        console.log('已处理邮箱:', email, '元素:', element);
      }
      
      return true;
    } else if (email) {
      console.warn('邮箱格式无效:', email, '元素:', element);
    }
    
    return false;
  }
  
  // 初始化函数
  function init() {
    if (!document || !document.querySelectorAll) {
      console.error('浏览器不支持querySelectorAll');
      return;
    }
    
    // 查找所有需要处理的邮箱元素
    const emailSelectors = [
      'a[data-email]',
      'a[data-email-b64]',
      'a[data-email-rot13]',
      'span[data-email]',
      'span[data-email-b64]',
      'span[data-email-rot13]'
    ];
    
    let processedCount = 0;
    let totalCount = 0;
    
    emailSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      totalCount += elements.length;
      
      elements.forEach(element => {
        if (processEmailElement(element)) {
          processedCount++;
        }
      });
    });
    
    if (config.debug) {
      console.log(`邮箱保护脚本初始化完成，找到 ${totalCount} 个邮箱元素，成功处理 ${processedCount} 个`);
    }
  }
  
  // 手动初始化函数
  window.emailProtection = {
    init: init,
    config: config,
    decodeEmail: decodeEmail,
    decodeBase64: decodeBase64,
    decodeROT13: decodeROT13
  };
  
  // 自动初始化
  if (config.autoInit) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
  
})();