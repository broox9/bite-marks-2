<script lang="ts">
  // import { account, ID } from '$lib/infrastructure/database/appwrite.client';
  import  { storeGetCurrentUser, storeSetCurrentUser } from '$lib/adapters/primary/stores/user.store.svelte';
  import { loginAction } from '$lib/adapters/primary/remote-handlers/login.remote'
  // import { loginAction } from './temp.remote';
  // import type { Session } from 'appwrite';

  let loggedInUser = $state<any | null>(null)

  console.log('[bs] loginAction', loginAction)

  // async function login(email: string, password: string) {
  //   // const user = await account.createEmailPasswordSession(email, password);
  //   const session = await loginAction({email, password});
  //   loggedInUser = session;
  // }

  // async function register(email: string, password: string) {
  //   await account.create(ID.unique(), email, password);
  // }

  // async function submit(e: SubmitEvent) {
  //   e.preventDefault();
  //   const formData = new FormData(e.target as HTMLFormElement);
  //   const email = formData.get('email') as string;
  //   const password = formData.get('password') as string;
  //   const type = (e.submitter as HTMLButtonElement).dataset.type;
  //   if (type === 'login') {
  //     await login(email, password);
  //   } else if (type === 'register') {
  //     await register(email, password);
  //   }
  // }

  // async function logout() {
  //   await account.deleteSession('current');
  //   loggedInUser = null;
  // }

  // $effect(() => {
  //   storeGetCurrentUser()
  //   .then(user => {
  //     console.log('[bs] Account User', user);
  //     storeSetCurrentUser(user);
  //     loggedInUser = user;
  //   })
  //   .catch(console.error)
  // });

</script>

<p>
    {loggedInUser ? `Logged in as ${loggedInUser.name}` : 'Not logged in'}
</p>



<form {...loginAction}>

  <label for="email">
    <span>Email</span>
    <!-- <input type="email" placeholder="Email" name="email" required /> -->
     <input {...loginAction.fields.email.as('text')} />
  </label>

  <label for="password">
    <span>Password</span>
    <!-- <input type="password" placeholder="Password" name="password" required /> -->
    <input {...loginAction.fields.password.as('password')} />
  </label>

  <button type="submit" data-type="login">Login</button>
  <!-- <button type="submit" data-type="register">Register</button> -->
</form>

<em>just looking for <a href="/all-spots">all the spots?</a></em>


<style>

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

form {
    display: flex;
    box-sizing: border-box;
    max-width: 400px;
    margin: 0 auto;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }


  label {
    display: block;

    span {
      display: block;
      margin-bottom: 0.5rem;
    }
  }


  /* button {
   padding: 1rem 0.5rem;
   border: none;
   border-radius: 0.25rem;
   background-color: #007bff;
   color: #fff;
   cursor: pointer;
   font-weight: bold;
   transition: background-color 0.4s ease;
  } */

  /* button:hover {
    background-color: #0056b3;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    font-size: 1rem;
    background-color: light-dark(#efefef, #222);
    color: light-dark(#222, #fefefe);
  } */
</style>
