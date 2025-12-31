/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0a0a0c",
                surface: "#121218",
                primary: {
                    DEFAULT: "#9333ea",
                    glow: "#a855f7",
                },
                accent: "#c084fc",
            },
            boxShadow: {
                'neon': '0 0 15px rgba(147, 51, 234, 0.4)',
                'neon-strong': '0 0 25px rgba(147, 51, 234, 0.6)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
        },
    },
    plugins: [],
}
