// import type { Session } from 'appwrite';
import { account } from "$lib/the_clean/infrastructure/database/appwrite.client";


let user = $state<unknown | null>(null)

export const storeGetCurrentUser = async() => {
  if (user) return user
  try {
    user = await account.get()
  } catch (e) {
    // console.log('[bs] USER::STORE cannot find user', e)
    // throw('no user found')
  } finally {
    return user
  }
}

export const storeSetCurrentUser = (incomingUser: unknown) => {
  user = incomingUser
}

export const storeDeleteUser = async () => {
  // user = null
  const result = await account.deleteSession('current').then(() => {
    console.log('User deleted');
    storeSetCurrentUser(null)
  })
}