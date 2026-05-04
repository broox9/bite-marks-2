<script lang="ts">
  // import { account, ID } from '$lib/infrastructure/database/appwrite.client';
  import  { storeGetCurrentUser, storeSetCurrentUser } from '$lib/adapters/primary/stores/user.store.svelte';
  import { loginAction } from '$lib/adapters/primary/remote-handlers/login.remote'
  import { Input, SubmitButton } from '$components/ui'

  let loggedInUser = $state<any | null>(null)
</script>


<section class="container">
  <form {...loginAction}>
      <strong>
          {loggedInUser ? `Logged in as ${loggedInUser.name}` : 'Login'}
      </strong>
    <label for="email">
      <span>Email</span>
      <Input {...loginAction.fields.email.as('text')} placeholder="email" />
    </label>

    <label for="password">
      <span>Password</span>
      <Input {...loginAction.fields.password.as('password')} placeholder="password" />
    </label>

    <div class="form-action">
      <SubmitButton data-type="login" data-width="full">Login</SubmitButton>
    </div>
    <!-- <SubmitButton data-type="register">Register</SubmitButton> -->
  </form>

  <div class="text-center">
    <em>just looking for <a href="/all-spots">all the spots?</a></em>
  </div>
</section>



<style>

  .container {
    max-width: 30rem;
    margin-inline: auto;
    text-align: center;
  }

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
    --field-width: min(100%, 20rem);
    /*border: 1px solid #ccc;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);*/
  }


  label {
    display: flex;
    flex-direction: column;
    width: var(--field-width);
    margin-inline: auto;

    span {
      display: none;
      margin-bottom: 0.5rem;
    }
  }

  .form-action {
    width: var(--field-width);
    margin-inline: auto;
  }
</style>
