/** @type {import('tailwindcss').Config} */

/*En la v4 no se usa este fichero*/
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],

    plugins: [],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#0056D2",
                    50: "#EAF1FC",
                    100: "#CDDFF7",
                    500: "#0056D2",
                    600: "#004AB8",
                    700: "#003C94",
                },
                secondary: {
                    DEFAULT: "#1E293B",
                },
                tertiary: {
                    DEFAULT: "#00E5FF",
                },
                neutral: {
                    DEFAULT: "#6F749E",
                    light: "#E5E7F0",
                },
            },
            fontFamily: {
                heading: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
                sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
            },
        },
    },
}
