# Mark Jowell Paltep — Portfolio

A responsive personal portfolio for Mark Jowell Paltep, an IT student and aspiring web developer. The site is built with semantic HTML, CSS, and vanilla JavaScript, with no third-party runtime dependencies.

## Highlights

- Responsive Home, About, Projects, Skills, Education & Training, and Contact sections
- Animated DCIB wordmark and interactive navigation, with reduced-motion support
- Circular profile portrait with a hover-revealed hacker-mask variation
- Animated snake cursor trail on pointer-capable screens
- Local technology icons and project screenshots
- Featured DCIB X 4AM modding-platform project

## Run locally

Requirements: Node.js 18 or newer and npm.

```sh
npm install
npm run dev
```

The development server listens on port 3000 by default. Set `PORT` to choose another port.

## Build and preview

```sh
npm run build
npm run preview
```

The production build is written to `dist/`. The preview server serves the built site on port 4173 by default; set `PORT` to use another port. The generated `dist/` folder is excluded from Git and can be deployed to a static host.

## Content and contact form

Update profile, skill, education, and training data in `src/data.js`; page rendering and interactions live in `src/main.js`. The contact form is demo-only: it validates in the browser but does not send or store submissions. Add a trusted form service before using it to receive messages.
