# Agents.md — Monopoly Game Project

## Overview

This project is a Monopoly-inspired multiplayer board game designed to evolve from a **local-first prototype** into a **fully cloud-hosted, real-time multiplayer system** using AWS serverless infrastructure.

The guiding principle is:

> Start simple, stay clean, and design as if the cloud already exists.

All code should be written in a way that makes the transition from local simulation → distributed cloud system straightforward and low-friction.

---

## Architecture Vision

### Phase 1 — Local Development (Current)

- Single-machine or same-browser multiplayer simulation
- No AWS dependencies
- Mock services replace backend infrastructure
- Game state fully managed in-memory (TypeScript)
- Deterministic game engine logic

**Tech Stack:**

- Next.js (frontend)
- TypeScript (shared game engine)
- React hooks / context or Zustand (state)
- Pure functions for game logic

---

### Phase 2 — Cloud Transition (Planned)

The system will migrate to a fully serverless real-time architecture:

#### Core Infrastructure

- **AWS API Gateway WebSocket API**
  - Real-time bidirectional communication
  - Player actions streamed as events

- **AWS Lambda (TypeScript)**
  - Stateless game logic handlers
  - Event-driven game state transitions

- **DynamoDB**
  - Persistent game state storage
  - Single table design preferred for scalability

- **AWS Cognito**
  - Player authentication and identity

- **S3 + CloudFront**
  - Frontend hosting and distribution

- **AWS CDK**
  - Infrastructure as code (fully reproducible environments)

- **CloudWatch**
  - Logging, debugging, and observability

---

## Core Design Philosophy

### 1. Game Engine Must Be Pure

All core game logic must be:

- Pure functions
- Deterministic
- Free of side effects
- Independent of UI or backend

```ts
nextState = reduceGameState(currentState, action);
```
