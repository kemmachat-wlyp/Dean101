import './globals.css'
import { cookies } from 'next/headers'
import Navigation from './components/Navigation'

async function getUser() {
  const cookieStore = cookies()
  const username = cookieStore.get('username')?.value
  return username === 'admin' ? { username } : null
}

export const metadata = {
  title: 'Vintage Inventory System',
  description: 'Inventory management system for vintage clothing shop',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  
  return (
    <html lang="en">
      <body className="app-shell">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  document.documentElement.dataset.theme = savedTheme || systemTheme;
                } catch (e) {}
              })();
            `,
          }}
        />
        {user && <Navigation />}
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  )
}
