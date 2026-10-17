---
title: "Myna-Hokkien: talk to it in Hokkien, and it talks back"
date: 2026-08-11
type: field
place: Singapore
summary: "SUTD's iNLP Lab has released an open speech-to-speech model for Singapore Hokkien, a language that mainstream speech assistants largely leave out."
source: https://inlp-lab.github.io/Myna-Hokkien/
sourceLabel: Myna-Hokkien project page, iNLP Lab, SUTD
---

The [iNLP Lab](https://isakzhang.github.io/group.html) at the Singapore University of Technology and Design has released [Myna-Hokkien](https://inlp-lab.github.io/Myna-Hokkien/), an open model you can speak to in Hokkien and that answers in Hokkien. It goes straight from speech to speech, with no separate transcription, language model and text-to-speech steps chained together.

Singapore Hokkien has never had a standard written form in everyday use. It is passed down through families and hawker stalls, which makes it exactly the kind of language speech AI should be built for. Yet, as the team points out, it is largely missing from today's major speech assistants, open or closed.

## What it does

Myna-Hokkien answers spoken questions in natural, colloquial Singapore Hokkien. The project page has examples of it explaining how to say "happy birthday", whether one fish is *tiâu* or *bóe*, how to fry long beans with egg, and which neighbourhood to look in for a cheap haircut. It also responds to tone: told "my mood is very low today", it answers with concern. It accepts typed English or Chinese too, and still replies in spoken Hokkien.

On that same low-mood prompt, the team shows four general-purpose speech models falling short: one fails to answer, one replies in Mandarin, one produces garbled speech, and one refuses in English.

- **Built on:** Qwen3-Omni-30B-A3B-Instruct, with 35 billion parameters, 3 billion active at a time
- **In and out:** speech or text in; text and speech out, in a single voice for now
- **Licence:** Apache 2.0, with the [model on Hugging Face](https://huggingface.co/iNLP-Lab/Myna-Hokkien)
- **Team:** Matthew Christopher Pohadi, Ryner Tan and Wenxuan Zhang

It is the first of a planned Myna family, with more Chinese dialects to come, lighter versions for modest hardware, and tasks beyond question answering.

## Why we are watching it

Hokkien is a test of whether speech AI works for the people who actually live in a place, not just its official languages.

The team is upfront that this is a research prototype. Coverage, prosody and expressiveness are still being worked on, and they are asking Hokkien speakers to try it and tell them what's wrong. That is the right next step. The comparison on the project page is one illustrative prompt, and the real evaluation is the one the team plans: Hokkien speakers of different ages and backgrounds, testing it on how they actually talk, including the everyday mixing with other languages that is common in Singapore.
