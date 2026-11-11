# StaffHub — Employee Management System

StaffHub is a static, employee-first prototype for viewing a limited employee profile, checking leave balances, submitting and tracking leave requests, and reading internal announcements. It uses plain HTML, CSS, and vanilla JavaScript with no framework, package installation, build step, CDN, or external assets.

## Project structure

```text
staffhub/
  index.html
  login.html
  portal.html
  404.html
  css/
    style.css
  js/
    main.js
    login.js
    portal.js
    password_strength_helper.js
  vercel.json
  README.md
```

## Run locally

Open `index.html` in a browser, or serve the folder with a local static server. For example, from inside `staffhub/`:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`. The prototype uses a non-sensitive `sessionStorage` flag to demonstrate the login-to-portal flow. A validly formatted email and any non-empty password continue to the demo portal; no credential is checked or stored. Leave requests are held only in the current page and disappear when it is reloaded or logged out.

## Security notes

- Hiding a button or page in the browser is **not a security control**. Frontend code and browser storage can be inspected or changed by a user. The portal's `sessionStorage` flag only demonstrates navigation and must never be treated as authentication or authorization.
- The future backend must enforce server-side role-based access control (RBAC) on every request, verify that employees can access only their own records, hash passwords with a modern password-hashing algorithm, require HTTPS, validate and normalize input server-side, protect state-changing requests against CSRF, and write appropriate audit logs.
- The login form uses browser-side format checks for usability, not as a security boundary. Production authentication must use a generic credential-failure response and appropriate rate limiting.
- User-entered leave reasons are inserted with `textContent`, not `innerHTML`, to reduce cross-site scripting (XSS) risk in this prototype. Server-side output encoding is still required later.
- Login email and leave-reason inputs are trimmed and bounded; invalid required fields, formats, and reason lengths receive visible field messages.
- The optional supporting-document picker accepts PDF, JPG, and PNG extensions up to 5 MB. Files are not uploaded or persisted. Extension and size checks are only client-side screening and do not verify file contents.
- `password_strength_helper.js` exposes the supplied `checkPasswordStrength(password)` function. The login demo shows its result while typing; the password itself is never stored. This feedback is not authentication or a substitute for server-side password controls.
- Logout removes the prototype access flag and resets temporary form, filter, dialog, and in-memory request state.
- The leave form collects only type, dates, and a short optional reason. Employees are told not to include medical details. The interface does not expose salary, national ID, bank details, or other employees' records.
- `noindex` is a crawler hint, not access control. The Vercel response headers add a restrictive Content Security Policy, MIME-sniffing protection, clickjacking protection, and a no-referrer policy.

### Threats considered

- **IDOR:** a future server must authorize each employee-record and leave-request identifier against the authenticated user.
- **Privilege escalation:** role checks must be performed by the backend; an employee must not gain HR or administrator actions by editing the UI or requests.
- **XSS:** user-provided text is rendered as text, not parsed markup; future server-rendered or stored content must also be encoded.
- **Credential stuffing:** production login should use rate limiting, monitoring, and suitable account protections; credentials are not processed by this prototype.

## Prototype limitations

There is no backend, database, real authentication, role enforcement, or server-side leave submission. The displayed employee, balances, history, and announcements are fictional sample data. Do not enter real credentials or sensitive personal information.

## Security activity test cases

| Feature | Test input or action | Expected result | Actual result |
| --- | --- | --- | --- |
| Login validation | Submit with an invalid/empty email and an empty password | Inline field messages appear; no navigation occurs | Source checks confirm required-field and format checks; browser submission not automated here |
| Leave validation | Submit without a leave type or dates; enter a one-character reason | Required fields and minimum reason length are reported; no request is added | Source checks confirm required fields and the minimum reason rule; browser submission not automated here |
| XSS-safe rendering | Submit `<img src=x onerror=alert(1)>` as the reason | The text appears literally in history; no image handler or script executes | Renderer uses `textContent`; script execution was not browser-tested here |
| File selection | Choose `notes.txt`, then a PDF larger than 5 MB | Both selections are rejected and a specific error appears | Source checks confirm extension/size rejection and clearing; picker interaction not browser-tested here |
| Password feedback | Enter `short`, `Abcdef1!`, and `StrongPassphrase123!` | Feedback reports Weak, Moderate, and Strong respectively | Verified with the supplied helper in Node.js |

Browser screenshots of the login validation and password-feedback states, the leave validation/file rejection state, and the rendered XSS test case still need to be captured for submission. Client-side checks are usability and demonstration controls only; they do not replace backend validation, authorization, upload inspection, or authentication.