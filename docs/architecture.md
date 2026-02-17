# Architecture Overview

This document provides an overview of the system architecture, describing the **SPA (Single Page Application)** frontend, the **PHP-based API backend**, and the **MySQL database schema**.

Simple high-level flow of interaction illustrated below:
```
[ Vanilla JS SPA (Client) ] ⇄ [ Pure PHP RESTful API (Backend) ] ⇄  [ MySQL (Database) ]
```

<br>

## Frontend (SPA) Architecture

![Fronted project structure diagram](./assets/images/frontend-project-structure-diagram.jpg)

The frontend is a vanilla JavaScript SPA (Single Page Application) with custom logic for routing and UI component handling. To authenticate requests with the backend, the frontend sends a Bearer token with each API request. This token ensures the user is authenticated, allowing the backend to process the request and return the appropriate JSON response.

### Using Views with custom vanilla SPA MVC Architecture

Views are generated when a route is dispatched. Each view can contain various components, ranging from global ones to more specific ones. For example, the DashboardPage may include TaskManager, which is specific to the dashboard and stored within the same folder. Additionally, views can incorporate logic for modals that use global components, such as a ConfirmModal.

- **DashboardPage**: Main user dashboard.
- **EnhancedTaskView**: Extends from dashboard, focused on managing tasks.
- **RegisterPage, LoginPage**: User authentication pages.
- **RecoverPage, ResetPasswordPage**: Password recovery and reset.
- **NotFoundPage**: Fallback for undefined routes.

### Using Componets with custom vanilla SPA MVC Architecture

In the custom system which has been build the vanilla SPA upon, the **Model-View-Controller (MVC)** architecture is used to manage the application logic. Components are solely responsible for rendering HTML content. These components are designed to be simple, reusable building blocks that focus purely on presenting the user interface (UI). Any dynamic behavior, such as data manipulation or user interaction logic, is handled outside of the component itself. The maximum level of dynamic behavior within a component is limited to conditional rendering, such as the header that renders the user menu based on the user's authenticated status.

Also, depending on the specificity of the components, they can be either local or global. For example, we can have task manager components that are specific to the dashboard, and in the same folder, we can have a global component like a confirmation modal, which can be used wherever needed.

#### Task Manager Component Example:

For example for the dashboard page, the **TaskManager** component is required. Which at the same time serves as a container for other related subcomponents, such as: TaskManagerTabs, TaskManagerDashboard, AddTaskPrompt or SearchTaskPrompt.

Together, these subcomponents create a cohesive and consistent dashboard interface for the user. The **TaskManager** is a modular, reusable element that can be seamlessly integrated into different views or pages across the application.

#### Benefits of This Approach:

- **Modular Design:** Since components are independent, they can be easily reused and updated without affecting other parts of the system.
- **Flexibility:** Changes or updates to one component do not disrupt the application’s overall logic structure. You can replace or enhance individual components as needed.
- **Separation of Concerns:** By isolating dynamic behavior to services, controllers, models or views, the components remain simple and focused on rendering, making the codebase easier to maintain and understand.

This strategy allows for a more scalable and maintainable application, where the UI components remain clean and focused on presentation while other layers handle the application's logic.

### Key Concepts and Services

#### Services

Centralizes shared logic such as API communication, authentication, and utility functions to keep controllers and models clean and focused. These services enhance reusability, streamline resource handling, and help maintain a consistent and smooth user experience. Below is a summary of each service:

- [vanilla-aria-modals](https://www.npmjs.com/package/vanilla-aria-modals): Manages the modal lifecycle by ensuring accessibility, focus management, and event handling. This includes functionality such as focus trapping, closing on Escape key press, and registering modals as a stack for better active modal management.
- **Auth**: Manages user authentication and session validation via tokens stored in localStorage.
- **AuthFormHandler**: Handles form validation for authentication-related forms, including real-time feedback, password matching, and form submission control.
- **DeviceIdentifier**: Generates and manages a unique device identifier (UUID) for each device, ensuring consistency across sessions.
**FetchHandler**: Manages API requests, handling authentication tokens, error responses, retries, and token refresh requests to the token handler. It also controls what is included in the request headers, such as adding the Bearer JWT, Content-Type, or device ID.
- **LoadHandler**: Optimizes image loading and preloading, ensuring smooth transitions and managing global loaders such as the page loader.
- **ThemeHandler**: Manages dynamic theme changes, supporting theme transitions with background image preloading.
- **TokenHandler**: Handles coordinated token refresh operations, ensuring only one token refresh request is active at a time, avoiding race conditions.
- **Utils**: Provides various helper functions for form handling, error rendering, random index generation, and sound control used throughout the client.

#### Controllers

Manage user interactions by handling events, performing basic validation, processing input, and coordinating between models and views.

- LoginController  
- RegisterController  
- TaskManagerController  
- (Additional controllers as needed)

#### Models

Handle application data, including fetching, storing, and processing logic. Also responsible for complex business rules.

- UserModel  
- TaskModel  
- (Other models as needed)

#### Views

Responsible for rendering the UI based on the application state, updating the DOM in response to changes in the models and actions triggered by controllers.

- TaskManagerView  
- QuoteMachineView  
- (Other views as needed)

### Routing

The **Router** service handles navigation in the single-page application (SPA), ensuring only one view is active at a time. It maps routes such as `/login`, `/register`, and `/tasks` to their respective views and initializes the appropriate controllers and models. It also ensures smooth transitions by cleaning up lingering processes, such as aborting fetch requests, clearing intervals, and resetting modals.

### Authentication Flow and Security

Most security measures are handled on the backend, but the client also takes steps to ensure a secure experience. It trims and sanitizes user input before sending it to the server. Unauthorized users are redirected from restricted views, and error handling displays backend issues in a user-friendly way.

On the backend, JWT tokens are used for authentication. The Auth and TokenHandler services manage the tokens to ensure secure requests. Each API request includes a Bearer access token along with a unique device ID, which helps track user behavior and supports rate-limiting. For each request, we check if the access token needs to be refreshed, ensuring that the token is renewed every 5 minutes. If the user remains inactive for 5 days, the refresh token expires, logging them out to maintain security.

While the client ensures clean data is sent to the server, the backend implements core security measures like rate-limiting, input validation, and IP/device validation to protect the system.

<br>

## Backend API Architecture

![Fronted project structure diagram](./assets/images/backend-project-structure-diagram.jpg)

The backend is a RESTful API written in pure PHP using OOP principles, following an MVC architecture mirroring the client. It handles JWT authentication, rate limiting with Redis, and secure refresh token flow. Redis is used to implement IP and device ID rate limits, as well as rotation detection, effectively blocking most brute force attempts and abuse. The database is a secure, normalized MySQL instance that is completely separated from the API and communicates via encrypted SSL.

For a complete list of endpoints and usage details, see the [full API documentation](./api.md).

### Key Concepts and Services

#### Services

The backend API relies on a set of services to handle authentication, error management, email notifications, rate limiting, and more. These services ensure secure operations, smooth user interactions, and effective management of API-related tasks. Below is a summary of each service:

- **Auth**: Handles user authentication, including the creation and validation of access and refresh tokens. It uses JWT for secure session management and token-based authentication.
- **AuthFormValidation**: Validates user input during registration and authentication, ensuring data meets the required criteria before account creation or password changes.
- **ErrorHandler**: Manages error handling and logging to the server. Capturing exceptions and ensuring appropriate error responses are sent to users while maintaining detailed logs for auditing purposes.
- **InitApiUtils**: Provides utility functions to initialize and manage API components, including database connections, device authentication, rate-limiting, and origin validation based on environment configurations.
- **JWTCodec**: Responsible for encoding and decoding JWT tokens, ensuring secure token creation and validation using HMAC with the HS256 algorithm.
**Mailer**: Sends email notifications, including password reset requests, password change confirmations, and welcome emails. It uses PHPMailer alongside Mailgun on port 2525 for secure email delivery. Currently, it operates on a free tier, which limits usage to 100 emails per day, making it the app's only bottleneck.
- **RateLimiter**: Manages request frequency, ensuring that rate limits are not exceeded to prevent abuse. It handles both device and IP rotation detection.
- **Responder**: Centralizes response logic for various HTTP status codes and messages, providing consistent and structured responses to API clients for success or error scenarios.

#### Controllers

Controllers act as the glue between incoming requests, gateways, and other services. They handle incoming requests, perform basic validation, and return the appropriate JSON responses.

- RegisterController
- LoginController
- LogoutController
- (Additional controllers as needed)

#### Gateways

Gateways manage interactions with the database, performing the basic CRUD operations required by the application.

- UserGateway
- TaskGateway
- (Other gateways as needed)

#### Models

Models handle complex validation, business logic, and advanced operations. At present, models are not in use as they are not required for the current application logic. However, as the system evolves, they can be added to manage more complex logic handling.

- UserModel
- TaskModel
- (Other models as needed)

#### Middleware

Middleware functions act as a bridge between the incoming request and the controller. They can be used for various purposes such as request validation, authentication, rate limiting, error handling, and more. Below are the key middleware components used in the API:

- **ErrorHandler:** Handles errors and exceptions globally.
- **InitApiUtils:** Provides utility functions to initialize and manage API components
- **RateLimiter:** Manages request frequency.
- **Authentication Middleware:** Verifies the validity of the JWT access token and ensures the user is authenticated before allowing access to protected routes.
- **CORS Middleware:** Handles Cross-Origin Resource Sharing (CORS) by setting appropriate headers and allowing preflight requests, ensuring smooth API communication with the client.
- **Maintenance Mode:** Checks for the existence of a maintenance flag and responds with a 503 Service Unavailable if the application is under maintenance.

### Routing and Controller Mapping

The API uses a simple vanilla router to determine which API request to process and which controller method to handle it. Each route corresponds to a specific controller action:

- `/register`: Registers a new user.
- `/login`: Logs a user in and generates JWT tokens.
- `/logout`: Logs a user out.
- `/refresh`: Updates and sends back new auth tokens.
- `/recover-password`: Sends a remember password email.
- `/reset-password`: Resets user password.
- `/tasks`: Retrieves or modifies tasks.
- `/tasks/{id}`: Retrieves or modifies specified task.
- `/quotes`: Fetches inspirational quotes.

Each controller processes requests, handles authentication (via JWT tokens), and interacts with the database through the appropriate gateway.

### Authentication Flow and Security

The backend API uses various security measures to protect the system. CORS is configured to allow only authorized domains, and errors are logged while sending generic 500 responses to clients for security. Sensitive data, such as API keys and other secrets, is managed using vlucas/phpdotenv with a .env file, ensuring production and development settings are kept separate.

A bash script controls maintenance mode, triggering a 503 response when necessary. The API validates the IP and device ID before rate-limiting, which also includes IP and device ID rotation detection. The database connection is secured with SSL encryption, and prepared statements are used to prevent SQL injection. JSON responses are properly escaped to prevent XSS attacks.

Token-based authentication ensures that only users with valid tokens can access protected endpoints. Extensive checks for IP and device ID validation ensure that requests are legitimate, rejecting unauthorized ones. Additionally, a cron job is set up on the server to automatically clear expired access tokens each week using a custom script.

<br>

## Custom JWT Authentication System

This backend uses a lightweight, custom implementation of JWT (JSON Web Token), built in PHP. The JWT handling is implemented via the `JWTCodec` and `Auth` service classes. The codec is based on the implementation by Dave Hollingworth, adapted to fit the specific needs of this project.

### JWT Structure

Each JWT consists of three parts:
1. **Header** – Contains metadata (`typ: JWT`, `alg: HS256`)
2. **Payload** – Custom claims such as user ID, token type, expiry, etc.
3. **Signature** – HMAC-SHA256 signature of the header and payload, signed with a server-side secret key.

Example payloads:
```json
{
  "sub": 1,
  "username": "johndoe",
  "exp": 1715176400,
  "type": "access"
}
```

### Encoding & Decoding

The `JWTCodec` class handles:

- **Encoding**: Converts a payload array into a signed JWT string.
- **Decoding**: Validates the token structure, checks its signature, and ensures it hasn't expired.

All encoding uses `base64url` format to ensure URL-safe output. Tokens are signed using `hash_hmac('sha256', ...)` and a secret key.

### Token Types

| Type            | Purpose                              | Expiry        |
|-----------------|--------------------------------------|---------------|
| `access`        | Used to access protected routes      | 5 minutes     |
| `refresh`       | Used to request new access tokens    | 5 days        |
| `reset-password`| Used for password reset via email    | 10 minutes    |

Token type is embedded in the payload (`type`) and checked during validation to ensure it is being used in the correct context.

### Validation and Security

- Tokens are validated using `hash_equals()` to prevent timing attacks.
- Expired or tampered tokens throw dedicated exceptions:
  - `InvalidSignatureException`
  - `TokenExpiredException`
- Only tokens with the correct `type` claim are accepted for each use case.
- Access Tokens: Stateless and are never stored in the database. The client holds onto them for the duration of their validity.
- Refresh Tokens: Stored in the database for validation and management purposes (whitelist), allowing the backend to verify whether a refresh token has been revoked or expired.
- All token errors are handled with generic messages to avoid leaking implementation details.
- Audit logs are created for invalid or suspicious token usage, helping detect abuse or attacks.

<br>

## Authentication Overview

The API uses **Bearer Authentication** with **JWT** (JSON Web Tokens) for securing authenticated routes, including a separate token for password reset functionality.

### Token Characteristics:

Each token has at least the following characteristics:
- **Type**: Tokens are assigned a specific type to prevent misuse.
- **Expiration Time**: Tokens have a defined expiration time to limit their validity.
- **Signature**: Tokens are securely signed using a secret key on the server to ensure the integrity of the payload and prevent tampering.

### Authentication Flow

1. **Login**: The user submits credentials, and the backend generates two JWTs: an **access token** (valid for 5 minutes) and a **refresh token** (valid for 5 days).
2. **Authenticated Requests**: The client includes the access token in the `Authorization` header (`Authorization: Bearer <token>`) to access protected routes.
3. **Refresh Token**: When the access token expires, the client can send the refresh token to the `/refresh` route to obtain a new access token and refresh token.
4. **Logout**: The client sends a request to `/logout` with the current refresh token. The backend invalidates the token, and the client clears their tokens.
5. **Password Recovery**: If a user forgets their password, they can request a reset link. The system sends an email with a JWT-secured link valid for 10 minutes to reset the password.

The `/quotes` route is the only route that doesn't require authentication.

<br>

## Database Schema

The database is built using **MySQL** with the following tables and relationships. For a deeper explanation of schema decisions and relationships, see the [design document](./design.md).

![TaskFlow app MySQL database entity relationship diagram](assets/images/taskflow-mysql-db-er-diagram.jpg)


### Entities

#### users

- Stores user information such as username, password hash, and email.
- **Primary key**: `id`

#### refresh_tokens

- Stores refresh tokens to allow session persistence across requests.
- **Primary key**: `token_hash`

#### tasks

- Stores user tasks with information like due date, title, description, and completion status.
- **Foreign key**: `user_id` references `users(id)`

#### quotes

- Stores inspirational quotes.
- **Primary key**: `id`

#### user_logs

- Logs user account changes (inserts, updates, deletes) for auditing purposes.
- **Primary key**: `id`

  ##### Triggers
  
  - **log_user_inserts**: Logs new user insertions.
  - **log_user_updates**: Logs user information updates.
  - **log_user_deletes**: Logs user deletions.