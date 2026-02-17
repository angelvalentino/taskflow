# TaskFlow – Minimalist Productivity, Maximum Focus

![Taskflow app screenshot](./docs/assets/images/taskflow-screenshot-1.png)

## 📋 About

[TaskFlow](https://taskflowapp.net/) is a deployed minimalistic-focused productivity web application with a modular architecture designed to help users stay focused, organized, and distraction-free. Built as a custom single page application using vanilla JavaScript with an object oriented MVC architecture, it delivers a smooth and responsive user experience. 

The frontend is bundled with Webpack and Babel while interacting with a secure RESTful API built in pure PHP with composer, following a OOP MVC approach. The API is protected with JWT authentication and configured to handle CORS for secure cross-origin requests. Access control is enforced using Redis based rate limiting, while data persistence is managed separately with MySQL to ensure reliable storage. The interface is clean, accessible, and intuitive, supporting task management, reminders, and progress tracking. All designed with simplicity and usability in mind.

The source code for the API has been set to private for increased security purposes. Notwithstanding, [documentation is available here](#-further-documentation), explaining the architecture, functionality, and security hardening.

### 📱 Progressive Web App (PWA) Support

TaskFlow supports basic Progressive Web App (PWA) features with a `manifest.json` file. Modern browsers allow users to add websites to their phone’s home screen using the “Add to Home Screen” option, and TaskFlow works seamlessly with this. When launched from the home screen, the app shows a proper icon and is optimized for mobile devices. Although it currently runs inside the browser, future updates will add full native-like PWA support for an even smoother app experience.


### 🌟 Acknowledgements

This project draws inspiration from several sources that helped shape its development:

- The **API and JWT structure** was inspired by *APIs in PHP: From Basic to Advanced* by Dave Hollingworth. His channel and documentation also helped me configure Composer.
- The **vanilla SPA (Single Page Application) design** was inspired by *Build a Single Page Application with JavaScript (No Frameworks)* by dcode. While the final router is completely different from his, I learned about the vanilla SPA concept from him.
- The overall project, including its **UI and UX**, was designed mostly by me. However, the **quote machine UI** design was inspired by a project from FreeCodeCamp.

<br>

## 🚀 Features

- ✅ **Clean Task Management:** Streamline your task organization with a distraction-free interface designed for maximum efficiency and focus.
- 🧠 **Enhanced Task Manager View:** An intuitive and powerful layout for organizing, reviewing, and managing your tasks with ease.
- ⏱️ **Pomodoro Timer:** A comprehensive and accessible time management component built around the Pomodoro technique, designed to boost productivity through structured work-rest intervals.
- 💬 **Daily Motivation:** A dynamic motivational quote machine, delivering a rotating selection of quotes to inspire and motivate you throughout the day.
- 🗂️ **Offline or Online:** Effortlessly access your tasks offline via local storage or sync them when you're online, ensuring continuous management no matter your connection.
- 🔒 **Security First:** All connections are secured with HTTPS (A+ SSL Labs grade), utilizing secure JWT authentication and industry-standard practices for server hardening and encryption.
- 📱 **Responsive, Dynamic Interface Across All Devices:** The app is fully responsive, dynamically adjusting to desktops, tablets, mobiles, smartwatches, and any other device, with media queries and styled using pure vanilla CSS.
- 🌍 **Accessibility Focus:** Designed with inclusivity in mind, the app emphasizes accessibility to ensure it can be used by everyone. While the broad range of themes may pose minor challenges for some colorblind users, future updates aim to introduce a dedicated colorblind-friendly theme pack.  
- 🗂️ **vanilla-aria-modals Implementation:** My [modal handler](https://www.npmjs.com/package/vanilla-aria-modals) utility ensures consistent ARIA behavior, keyboard navigation, modal stacking, and focus management across menus and scenes. 
- ⚡ **Optimized Performance:** Achieved a full score in Google’s Lighthouse audit under standard conditions, ensuring top-tier performance, accessibility, best practices, and SEO. Performance may slightly vary (e.g., 97–99) when logged in or on mobile due to dynamic content and runtime features.
- 🏷️ **404 Page:** Custom-built not found page for handling invalid routes, providing a smooth and user-friendly experience even when users land on non-existent URLs.
- 🏗️ **Robust Object-Oriented MVC Architecture:** Both the client-side SPA and the backend API are built using a modular, object-oriented MVC design, ensuring clean separation of concerns, maintainability, and scalability across the entire stack.
- 🧩 **Reusable Components:** Key components such as modals and prompts are designed to be reusable across multiple views.

### 🛰️ API

Built in pure modern PHP with Composer using an object-oriented MVC architecture, the API handles secure JWT authentication, rate limiting with Redis, and communicates with a MySQL database for reliable data storage.

#### 🛡️ Features and Security

- Secure JWT-based authentication and token refresh with robust token management  
- Rate limiting powered by Redis to prevent abuse and mitigate brute-force attacks  
- CORS support with IP and device ID validation, plus strict input sanitization to enhance security  
- Modular, maintainable MVC architecture with Composer autoloader for professional, clean structure  
- MySQL database integration using prepared statements for SQL injection prevention, hosted separately from the API in an isolated environment  
- Thorough user input validation and JSON escaping to prevent XSS and other injection attacks  
- Deployed on a hardened Linux server with SSH-only access, Fail2Ban, and strict file permissions. It uses HTTPS with an A+ SSL Labs rating for secure communication. Log rotation is configured for API logs, and Apache serves the API from the public folder with `.htaccess` for URL rewriting and added security.

Despite best efforts and adherence to industry best practices, no web application can guarantee 100% security due to inherent platform limitations and constantly evolving threats; ongoing vigilance and improvements remain essential.

### 📊 Audit and Security Scores

Below are the actual audit and security test results demonstrating the app’s performance and integrity. Lighthouse scores are shown for both unauthenticated (anonymous) and authenticated users. These benchmarks validate the app’s speed, accessibility, and best practices under different conditions.

![Taskflow app Chrome lightouse full score screenshot](./docs/assets/images/lighthouse-score.jpg)

![Taskflow app Chrome lightouse full score screenshot](./docs/assets/images/lighthouse-score-auth.jpg)

![Taskflow app screenshot SSL labs full A+ score screenshot](./docs/assets/images/ssl-labs-score.jpg)

<br>

## 🧱 Core Features

- **Vanilla JavaScript SPA**, built from scratch with:
  - Modular MVC structure (models, views, controllers, and services)
  - Custom routing system and client-side navigation
  - Token-based auth management with automatic refresh
  - Device fingerprinting and fetch interception for security
  - Pomodoro timer, task management, quote engine, and theme rotation
  - Custom component-based UI (e.g., modals, user menu, loaders)
  - Optimized Lighthouse Scores with a full score across performance, accessibility, best practices, and SEO
  - HTTPS, ensuring secure and encrypted communication across the entire application
- **Secure RESTful API** written in **pure PHP**, featuring:
  - JWT-based Authentication and Refresh Tokens
  - CORS protection and strict request validation
  - Redis-backed rate limiting and IP/device rotation detection
  - Prepared statements and HTML escaping to prevent SQL injection and XSS
  - Environment-based configuration and maintenance mode
  - Structured routing with controller-based handlers
  - Centralized error/audit logging and graceful failure responses
- **MySQL Database**, normalized for clean relational task and user data handling:
  - Entities:
    - users: Stores user credentials and metadata.
    - refresh_tokens: Stores refresh tokens and their expiration times.
    - tasks: Stores tasks with due dates, descriptions, and completion statuses, with relationships to users.
    - quotes: Stores motivational quotes.
    - user_logs: Tracks user actions (inserts, updates, deletes) for auditing purposes.
  - Encrypted MySQL connections using an SSL certificate to ensure secure, encrypted communication between the application and the database.
  - The database layer is fully separated from the API and client for better modularity, maintainability, and scalability.
- **Webpack + Babel**, for ES6+ support and bundling optimization
- **PHPMailer** integration for password recovery and transactional emails
- **Deployed API on Hardened Linux Server**:
  - SSH-only access, Fail2Ban, strict file permissions
  - HTTPS with an A+ SSL Labs grade, ensuring secure and encrypted communication across the entire application.
  - Log Rotation properly configured for API logs to ensure efficient log management
  - API configured with Apache to be served from the public folder, using `.htaccess` for URL rewriting and enhanced security

<br>

## 📁 Further Documentation

Full architecture, API details, database design, and core components are available in the `docs/` directory:

- [architecture.md](./docs/architecture.md) – Full breakdown of the app structure and modules.
- [api.md](./docs/api.md) – REST API endpoints and usage.
- [design.md](./docs/design.md) – App scope and database schema and rationale.

[Walkthrough Video](https://www.youtube.com/watch?v=iwnIOa8g1bs) – Overview of Project Goals, Key Challenges, and Key Takeaways

<br>

## 🌱 TaskFlow: Evolution, Features and Limitations

### From Portfolio to Scalable Solution

TaskFlow began as a portfolio project and grew into a full productivity app. Its goal is to make digital work simpler with a task-focused design. Built with care, the app follows best practices and focuses on security and user experience.

### Current Limitations

TaskFlow began as a portfolio project and, while it's fully functional and production-ready, it currently faces a few limitations:

- **Email Sending Limit:** The app relies on the Mailgun free tier, which restricts email delivery to **100 emails per day**. This may affect notification-heavy use cases unless upgraded to a paid plan.

- **Request Cancellation:** The app uses asynchronous API calls and allows clients to abort requests. However, the backend still processes those requests. Using WebSockets could enable real-time cancellation detection, but at the cost of added complexity.

### Accessibility (a11y)

- **Inclusive Design**: TaskFlow is built with the goal of making the app accessible to all users, including those with disabilities. The interface is designed to be intuitive and easy to navigate, with continuous improvement in mind.
- **Keyboard Navigation**: TaskFlow is fully optimized for keyboard navigation, allowing users to interact with the app without relying on a mouse or touch input.
- **ARIA Support**: ARIA (Accessible Rich Internet Applications) attributes are used only when necessary, to enhance accessibility without cluttering the markup, ensuring an optimized experience for screen readers and assistive technologies.
- **Semantic HTML**: The app utilizes semantic HTML elements, not only for SEO benefits but also to improve the user experience, making it easier for assistive technology to interpret the content structure correctly.
- **Colorblind-Friendly**: The app’s theme handler offers multiple color schemes to cater to different preferences. However, I'm aware that it may not work well for users with colorblindness. Future updates will focus on adding color schemes that are more accessible and better aligned with accessibility standards.

### Architecture Overview

- **Scalable Architecture**: The app is built with a modular design, including a dedicated MySQL database and an API hosted on a secure Linux server.
- **Transactional Emails**: TaskFlow supports key transactional emails such as account registration and password recovery, though the free tier limits email volume.
- **Scalability**: The system is built to scale, enabling easy future expansions and feature additions as needed.
- **Lightweight Custom SPA**: TaskFlow features a vanilla custom SPA that is lightweight and, like the rest of the project, does not rely on heavy libraries. It uses only essential development libraries, such as Webpack and Babel.
- **Optimized Client Build**: The client-side code is fully compiled and optimized using Babel and Webpack, ensuring modern JavaScript compatibility, enhanced performance, and faster load times.
- **Secure API**: The API is secured with modern security practices, including CORS, rate limiting, and JWT-based authentication. It is hosted on a modern, well-maintained server, ensuring data protection and preventing unauthorized access.

### Security First

TaskFlow is designed with strong security measures to protect user data. However, no app is completely secure, and ongoing vigilance and improvements are essential due to the constantly evolving nature of cybersecurity.

### Built for Growth

TaskFlow features a modular design that allows it to scale as user needs grow. It is more than just a productivity application, it showcases clean architecture, efficient user experience design, and scalable backend practices.

<br>

## 🖼️ Additional Images

![Taskflow app screenshot](./docs/assets/images/app-screenshot-1.png)

![Taskflow app screenshot](./docs/assets/images/app-screenshot-2.png)

![Taskflow app screenshot](./docs/assets/images/app-screenshot-3.png)

![Taskflow app screenshot](./docs/assets/images/app-screenshot-4.png)

![Taskflow app screenshot](./docs/assets/images/app-screenshot-5.png)

![Taskflow app screenshot](./docs/assets/images/app-screenshot-6.png)

<br>

## 🚧 Possible Future Improvements

These improvements are planned possibilities and may evolve based on feedback and priorities.

- Refactor the client-side codebase to use **TypeScript** with strict typing, improving code reliability and providing better IntelliSense support.  
- Add **user management options**, allowing users to delete their accounts, change their email or username, and upload a profile picture.  
- Implement **Progressive Web App (PWA)** functionality to enable offline use, app installation, and improved performance.  
- Enhance user customization by adding a **theme palette picker**, letting users select and save their favorite themes for a personalized experience.  
- Introduce an additional **colorblind-friendly palette** to improve accessibility and ensure the app is inclusive to users with color vision deficiencies.

<br>

## 📬 Contact

Feel free to reach out for feedback, collaboration, or opportunities:

- **GitHub**: [angelvalentino](https://github.com/angelvalentino)  
- **Email**: angelvalentino294@gmail.com

While I deeply value collaboration and community feedback, this project serves as a personal showcase of my software development and engineering skills. For that reason, I personally implement all features and improvements.

That said, I welcome **issues**, **suggestions**, and **feedback** considering **pull requests for bugs or non-feature enhancements** on a case-by-case basis.

If the project evolves into a team-led initiative or a paid service in the future, collaboration may become a more active part of its development. Until then, thank you for your support and interest!