import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function getUser() {
  const cookieStore = cookies()
  const username = cookieStore.get('username')?.value
  return username === 'admin' ? { username } : null
}

export default async function Home() {
  const user = await getUser()
  
  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}