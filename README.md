# DeveloperOS

A fresh MVP scaffold for DeveloperOS.

> Note: This repository was initialized fresh. The previously referenced build
> artifacts (`dist/`) and commit `348aba5` were not recoverable in the build
> environment, so the project was started from a clean baseline.

## Getting started

```bash
npm install
npm run build
npm start
```

## Project layout

```
.
├── src/            # Application source
│   └── index.ts    # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

| Script          | Description                     |
| --------------- | ------------------------------- |
| `npm run build` | Compile TypeScript to `dist/`   |
| `npm start`     | Run the compiled entry point    |
| `npm run dev`   | Run directly via ts-node        |
