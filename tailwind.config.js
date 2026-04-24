/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 动物森友会风格颜色
        primary: '#19c8b9',
        primaryHover: '#3dd4c6',
        primaryActive: '#11a89b',
        primaryBg: '#e6f9f6',
        success: '#6fba2c',
        successHover: '#85cc45',
        successActive: '#5a9e1e',
        warning: '#f5c31c',
        warningHover: '#f7d04a',
        warningActive: '#dba90e',
        error: '#e05a5a',
        errorHover: '#e87878',
        errorActive: '#c94444',
        text: '#794f27',
        textSecondary: '#9f927d',
        textDisabled: '#c4b89e',
        border: '#aaa69d',
        borderHover: '#827157',
        bg: '#f8f8f0',
        bgSecondary: '#f0e8d8',
        bgDisabled: '#f0ece2',
        // 保留原有颜色作为补充
        acnhGreen: '#4ade80',
        acnhBlue: '#60a5fa',
        acnhYellow: '#fbbf24',
        acnhPink: '#f472b6',
        acnhPurple: '#a78bfa',
        acnhBrown: '#92400e',
        acnhLight: '#f0f9ff',
        acnhDark: '#1e40af'
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        acnh: ['Nunito', 'Zen Maru Gothic', 'M PLUS Rounded 1c', 'Smiley Sans', 'HarmonyOS Sans SC', 'MiSans', '-apple-system', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif']
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        }
      },
      boxShadow: {
        'acnh-sm': '0 2px 4px 0 rgba(61, 52, 40, 0.06)',
        'acnh': '0 3px 10px 0 rgba(61, 52, 40, 0.1)',
        'acnh-lg': '0 8px 24px 0 rgba(61, 52, 40, 0.14)'
      },
      borderRadius: {
        'acnh-sm': '12px',
        'acnh': '18px',
        'acnh-lg': '24px'
      }
    },
  },
  plugins: [],
}