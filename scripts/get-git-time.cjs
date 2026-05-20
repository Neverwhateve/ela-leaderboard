#!/usr/bin/env node

const { execSync } = require('child_process');
const { writeFileSync } = require('fs');
const { join } = require('path');

const projectRoot = join(__dirname, '..');
const outputFile = join(projectRoot, 'src/git-time.json');

try {
  // 获取最后一次提交的时间
  const gitTime = execSync('git log -1 --format=%ci', { encoding: 'utf-8' }).trim();
  
  // 获取最后一次提交的哈希（可选）
  const gitHash = execSync('git log -1 --format=%h', { encoding: 'utf-8' }).trim();

  const date = new Date(gitTime);
  
  // 格式化日期
  const formattedDate = date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const output = {
    date: formattedDate,
    hash: gitHash,
    raw: gitTime
  };
  
  writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log('✅ Git 时间已更新:', formattedDate);
} catch (error) {
  console.error('❌ 获取 Git 时间失败:', error.message);
  // 如果失败，使用当前时间作为 fallback
  const fallbackDate = new Date().toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const output = {
    date: fallbackDate,
    hash: 'N/A',
    raw: new Date().toISOString()
  };
  
  writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log('⚠️  使用当前时间作为 fallback');
}
