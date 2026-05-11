<script lang="ts">
  import { loginAction } from '$lib/adapters/primary/remote-handlers/login.remote'
  import { Input, SubmitButton } from '$components/ui'
  import { page } from '$app/state';

  let loggedInUser = $state<any | null>(null)

  const oauthErrorMessage = $derived.by(() => {
    const code = page.url.searchParams.get('oauth');
    if (code === 'error' || code === 'failed') return 'Google sign-in did not complete. Try again.';
    if (code === 'invalid') return 'Sign-in link was incomplete. Start again from the login page.';
    return '';
  });
</script>


<section class="container">
  <form {...loginAction}>
      <strong>
          {loggedInUser ? `Logged in as ${loggedInUser.name}` : 'Login'}
      </strong>
    {#if oauthErrorMessage}
      <p class="oauth-error" role="alert">{oauthErrorMessage}</p>
    {/if}
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

  <p class="oauth-divider"><span>or</span></p>
  <div class="oauth-action">
    <a class="google-signin" href="/auth/google">Continue with Google</a>
  </div>

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

  .oauth-error {
    color: var(--color-danger, #b42318);
    font-size: 0.9rem;
    margin: 0;
    max-width: var(--field-width);
    margin-inline: auto;
  }

  .oauth-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    max-width: var(--field-width);
    margin: 1rem auto 0.75rem;
    color: var(--color-muted, #666);
    font-size: 0.85rem;
  }

  .oauth-divider::before,
  .oauth-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--color-border, #ccc);
  }

  .oauth-action {
    max-width: var(--field-width);
    margin: 0 auto 1.5rem;
  }

  .google-signin {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    padding: 0.65rem 1rem;
    border: 1px solid var(--color-border, #ccc);
    border-radius: 0.375rem;
    text-decoration: none;
    font-weight: 600;
    color: inherit;
    background: var(--color-surface, #fff);
  }

  .google-signin:hover {
    filter: brightness(0.97);
  }
</style>
