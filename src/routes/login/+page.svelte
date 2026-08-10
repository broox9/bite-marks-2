<script lang="ts">
  import { Input, SubmitButton } from "$components/ui";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { authClient } from "$lib/auth-client";

  let email = $state("");
  let password = $state("");
  let errorMessage = $state("");
  let pending = $state(false);
  let mode = $state<"login" | "register">("login");

  const oauthErrorMessage = $derived.by(() => {
    const code = page.url.searchParams.get("oauth");
    if (code === "error" || code === "failed")
      return "Google sign-in did not complete. Try again.";
    if (code === "invalid")
      return "Sign-in link was incomplete. Start again from the login page.";
    return "";
  });

  const displayError = $derived(errorMessage || oauthErrorMessage);

  async function handleSubmit(event: Event) {
    event.preventDefault();
    errorMessage = "";
    pending = true;
    try {
      if (mode === "login") {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) {
          errorMessage = result.error.message ?? "Login failed.";
          return;
        }
      } else {
        const result = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0] || "User",
        });
        if (result.error) {
          errorMessage = result.error.message ?? "Registration failed.";
          return;
        }
      }
      await goto("/list");
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : "Authentication failed.";
    } finally {
      pending = false;
    }
  }

  async function handleGoogle() {
    errorMessage = "";
    pending = true;
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/list",
      });
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : "Google sign-in failed.";
      pending = false;
    }
  }
</script>

<section class="container">
  <form onsubmit={handleSubmit}>
    <strong>{mode === "login" ? "Login" : "Create account"}</strong>
    {#if displayError}
      <p class="oauth-error" role="alert">{displayError}</p>
    {/if}
    <label for="email">
      <span>Email</span>
      <Input
        id="email"
        type="email"
        value={email}
        oninput={(e: Event) => {
          email = (e.currentTarget as HTMLInputElement).value;
        }}
        placeholder="email"
        required
        autocomplete="email"
      />
    </label>

    <label for="password">
      <span>Password</span>
      <Input
        id="password"
        type="password"
        value={password}
        oninput={(e: Event) => {
          password = (e.currentTarget as HTMLInputElement).value;
        }}
        placeholder="password"
        required
        autocomplete={mode === "login" ? "current-password" : "new-password"}
      />
    </label>

    <div class="form-action">
      <SubmitButton data-type="login" data-width="full" disabled={pending}>
        {pending ? "Please wait…" : mode === "login" ? "Login" : "Sign up"}
      </SubmitButton>
    </div>

    <p class="toggle-mode">
      {#if mode === "login"}
        No account?
        <button type="button" onclick={() => (mode = "register")}>Sign up</button>
      {:else}
        Already have an account?
        <button type="button" onclick={() => (mode = "login")}>Login</button>
      {/if}
    </p>

    <p class="oauth-divider"><span>or</span></p>
    <div class="oauth-action">
      <button
        class="google-signin"
        type="button"
        onclick={handleGoogle}
        disabled={pending}
      >
        Continue with Google
      </button>
    </div>
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

  form {
    display: flex;
    box-sizing: border-box;
    max-width: 400px;
    margin: 0 auto;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    --field-width: min(100%, 20rem);
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

  .toggle-mode {
    font-size: 0.9rem;
    color: var(--color-muted, #666);
  }

  .toggle-mode button {
    border: none;
    background: none;
    color: var(--cta-dark-super, #2563eb);
    text-decoration: underline;
    cursor: pointer;
    font: inherit;
    padding: 0;
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
    content: "";
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
    font: inherit;
    cursor: pointer;
  }

  .google-signin:hover:not(:disabled) {
    filter: brightness(0.97);
  }

  .google-signin:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
