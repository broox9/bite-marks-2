import { account } from "$lib/the_clean/infrastructure/database/appwrite.client";

export const getCurrentUserAdapter = async () => {
  try {
    const user = await account.get()
    return user
  } catch (error) {
    console.error(error)
    return null
  }
}
  