import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				ocean: {
					light: '#D3E4FD',
					medium: '#33C3F0',
					dark: '#0EA5E9',
				},
				coral: '#FF719A',
				sand: '#FEF7CD',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'bubble-float': {
					'0%': { 
						transform: 'translateY(100%)',
						opacity: '0' 
					},
					'50%': { 
						opacity: '0.8' 
					},
					'100%': { 
						transform: 'translateY(-100vh)',
						opacity: '0' 
					}
				},
				'wave': {
					'0%': { transform: 'translateX(0)' },
					'50%': { transform: 'translateX(-25%)' },
					'100%': { transform: 'translateX(-50%)' }
				},
				'swim': {
					'0%, 100%': { transform: 'translateX(0)' },
					'50%': { transform: 'translateX(10px)' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				twinkle: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
				'spin-slow': {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' },
				},
				'bounce-slow': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' },
				},
				'pulse-slow': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' },
				},
				'slide-up': {
					from: { 
						opacity: '0',
						transform: 'translateY(20px)',
					},
					to: { 
						opacity: '1',
						transform: 'translateY(0)',
					},
				},
				'slide-down': {
					from: { 
						opacity: '0',
						transform: 'translateY(-20px)',
					},
					to: { 
						opacity: '1',
						transform: 'translateY(0)',
					},
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'bubble-float-1': 'bubble-float 15s ease-in infinite',
				'bubble-float-2': 'bubble-float 12s ease-in infinite',
				'bubble-float-3': 'bubble-float 18s ease-in infinite',
				'wave': 'wave 15s linear infinite',
				'swim': 'swim 3s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'twinkle': 'twinkle 2s ease-in-out infinite',
				'spin-slow': 'spin-slow 8s linear infinite',
				'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
				'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
				'slide-up': 'slide-up 0.5s ease-out forwards',
				'slide-down': 'slide-down 0.5s ease-out forwards',
				'fade-in': 'fade-in 0.5s ease-out forwards',
			},
			backgroundImage: {
				'ocean-gradient': 'linear-gradient(180deg, #D3E4FD 0%, #33C3F0 50%, #0EA5E9 100%)',
			},
			scale: {
				'102': '1.02',
				'105': '1.05',
				'110': '1.10',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
