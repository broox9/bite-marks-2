<script lang="ts">
  // import { account, ID } from '$lib/infrastructure/database/appwrite.client';
  import  { storeGetCurrentUser, storeSetCurrentUser } from '$lib/adapters/primary/stores/user.store.svelte';
  import { loginAction } from '$lib/adapters/primary/remote-handlers/login.remote'

  let loggedInUser = $state<any | null>(null)
</script>

<div class="text-center mt-4">
  <strong>
      {loggedInUser ? `Logged in as ${loggedInUser.name}` : 'Login'}
  </strong>
</div>


<form {...loginAction}>
  <label for="email">
    <span>Email</span>
     <input {...loginAction.fields.email.as('text')} placeholder="email" />
  </label>

  <label for="password">
    <span>Password</span>
    <input {...loginAction.fields.password.as('password')} placeholder="password" />
  </label>

  <button type="submit" data-type="login">Login</button>
  <!-- <button type="submit" data-type="register">Register</button> -->
</form>

<div class="text-center">
  <em>just looking for <a href="/all-spots">all the spots?</a></em>
</div>



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
    /*border: 1px solid #ccc;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);*/
  }


  label {
    display: block;

    span {
      display: none;
      margin-bottom: 0.5rem;
    }
  }


   button {
    width: 100%;
  }
</style>
