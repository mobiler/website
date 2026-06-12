---
title: Quickstart
description: Install Mobiler, scaffold an app, and run it on the web, iOS and Android.
sidebar:
  order: 0
---

Mobiler is a Rust CLI plus a set of libraries. You write your app once in Rust; the CLI scaffolds the
native iOS / Android / web shells around it.

## Install the CLI

```sh
cargo install mobiler
```

## Scaffold an app

```sh
mobiler new my-app
cd my-app
```

You get a mobile-first project: a `shared` Rust crate (your `MobilerApp` — `Model`, `Msg`, `update`,
`input`, `view`) plus generated **iOS**, **Android** and **web** shells that compile your core to each
platform.

## Run it

iOS and Android are the native targets; the web build (Leptos + WebAssembly) shares most of the UI and
is the fastest loop for day-to-day iteration — though not every screen is a pixel-for-pixel match.

```sh
# iOS (needs Xcode)
mobiler build ios

# Android (needs the Android SDK/NDK)
mobiler build android

# Web — fastest dev loop, opens in your browser
mobiler dev web
```

## Add a capability

Capabilities are called from your core through `cx`. Add a plugin-backed one with the CLI:

```sh
mobiler plugin add sqlite
```

```rust
cx.plugin("sqlite", "exec", create_table_sql, |_| Msg::Ready);
```

Browse everything available in the [capabilities reference](/reference/capabilities/).

## Next: build something real

The [**guide**](/guide/) builds **Saldo** — a multilingual, SQLite-backed money manager — from an
empty scaffold all the way to a store-ready app, one working chapter at a time.
