import { Html, Head, Main, NextScript } from 'next/document';

// Runs before first paint, so there is no flash of the wrong theme.
// Every new visit opens in DARK mode. A light-mode toggle only lasts for the
// current browser session (sessionStorage), and the old permanent
// localStorage 'theme' value from earlier versions is cleared.
const bootScript = `
(function () {
  var theme = 'dark';
  try {
    localStorage.removeItem('theme');
    if (sessionStorage.getItem('bs-theme') === 'light') theme = 'light';
  } catch (e) {}
  document.documentElement.dataset.theme = theme;
  if ('IntersectionObserver' in window) document.documentElement.classList.add('reveal-ready');
})();
`;

export default function Document() {
	return (
		<Html lang="en" data-theme="dark">
			<Head>
				<link rel="icon" href="/favicon.ico" />
				<meta name="theme-color" content="#0c0a08" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Manrope:wght@400;500;600;700;800&display=swap"
				/>
				<link rel="preconnect" href="https://covers.openlibrary.org" />
				<link rel="preconnect" href="https://images.unsplash.com" />
				<script dangerouslySetInnerHTML={{ __html: bootScript }} />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
