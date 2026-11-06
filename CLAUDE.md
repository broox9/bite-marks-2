# Project instructions

Follow the shared project instructions in @AGENTS.md.

## Pull request naming

Name every pull request and its source branch using `<type>/<issue-number>-<short-description>`.

- Use an appropriate lowercase type, such as `feat`, `fix`, `refactor`, `docs`, `test`, or `chore`.
- Preserve the issue identifier's capitalization, such as `BRO-10`.
- Write a concise, lowercase, hyphen-separated description.
- Example: `feat/BRO-10-save-location`.

## Commit messages

Format every commit message as follows, with a blank line between the subject and body:

```text
<type>[<area of code>]: <issue-number> <short description>

<longer description>
```

- Use an appropriate lowercase type and a concise, lowercase, hyphen-separated code area.
- Preserve the issue identifier's capitalization, such as `BRO-10`.
- Use the body to explain the change and its purpose.

Example:

```text
feat[location-service]: BRO-10 saving location

allowing a user to save multiple locations as a basis of search for spots
```
