# Personal Webpage

This portfolio is currently maintained as a small static website. Keep development focused on the existing files:

- `index.html`
- `css/style.css`
- `projects/vesta.html`
- `js/universe.js`

Do not create a React/Vite project at this stage.

## Future migration plan

If the site grows enough to need a component-based structure, migrate to a React/Vite layout with files such as:

- `src/components/Navbar.jsx`
- `src/components/SectionTitle.jsx`
- `src/components/Timeline.jsx`
- `src/pages/Home.jsx`
- `src/pages/Vesta.jsx`
- `src/pages/Mission.jsx`
- `src/pages/Science.jsx`

Start that migration only when one or more of these conditions are met:

1. The number of project pages increases significantly.
2. The site needs complex animations.
3. The site needs reusable components.
4. The site needs charts, an interactive timeline, or 3D models.
