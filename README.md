# model playground

## TLDR

Easily compare different LLM and provider outputs by quality, speed, and cost.

## Problem

With fast innovations in foundation models, it's hard to figure out which of the newest models and providers I should be using (ex: should I use Claude 3 Opus instead of GPT4? is the prompt simple enough to run a cheaper open source model?)

## Solution

This tool helps you run the same prompt on multiple different models and providers to get a basic sense of how responses might differ and the comparative speed and cost of each query.

## Setup

`npm i` installs the necessary packages and `npm run dev` runs the app locally. Note this project is built on top of [Convex](https://www.convex.dev/) and running locally or deploying it would require an account there.