---
title: "Reasoning in the user's language: new research from Cohere Labs"
date: 2026-09-11
type: review
summary: "Most reasoning models think in English whatever language you ask in. A small open model from Cohere Labs reasons in the prompt's language over 93% of the time across 60 languages, at little cost to accuracy."
source: https://arxiv.org/abs/2609.10445
sourceLabel: Cohere Labs, arXiv, 9 September 2026
---

Ask a reasoning model a question in Korean, Swahili or Malay, and it will usually do its thinking in English before answering in your language. [Building Multilingual Bridges](https://arxiv.org/abs/2609.10445), new research from Cohere Labs, sets out to change that. The authors call it **L2 reasoning**: reasoning in the language of the user's prompt.

The work is led by Mehrnaz Mofakhami, Ananya Sahu, Alejandro Rodríguez Salamanca, Daniel D'souza, Alexandre Bérard, Thomas Euyang, Marzieh Fadaee and Julia Kreutzer.

## Why it matters

The paper gives three reasons English-only reasoning is a problem:

- **Meaning gets lost.** Switching to English mid-task risks losing the intent, nuance or framing of the original question.
- **Local knowledge lives in local languages.** Cultural knowledge about a region shows up more often in the language spoken there, so questions about local terms, customs or notions of harm may be answered better in that language.
- **Only English speakers can check the reasoning.** If the trace is in English, people who don't read English can't inspect it. That matters most in high-stakes areas like healthcare.

## What they built

Tiny Aya L2-Thinker is a 3.35-billion-parameter open model trained to reason in 45 languages, including Chinese, Malay, Tamil, Arabic, Swahili and Zulu. Across 60 languages on six benchmarks, covering maths, commonsense, instruction following, open-ended writing and cultural reasoning, it reasons in the prompt's language more than 93% of the time.

## What they found

- **Asking isn't enough.** Telling a model to "think in the same language as the prompt" at inference time helped less than training for it, and forcing the language cost accuracy, by about 12 points on two benchmarks for one comparison model.
- **The accuracy cost is small.** Reasoning in the user's language cost at most two to three points on five of six tasks. Competition-level maths was the exception.
- **It holds up in lower-resource languages.** The model stayed near 94% in-language on the least-resourced languages tested, while a much larger model's rate collapsed from 72% to 5%.
- **A little ordinary multilingual data goes a long way.** Adding 10% of non-reasoning multilingual instruction data lifted in-language reasoning on unseen languages from 46% to 89% on one maths benchmark, and accuracy from 49% to 67%.
- **More languages help, not hurt.** Training on more languages improved in-language reasoning for languages the model never saw reasoning data for, without hurting the others.
- **Long traces were a warning sign.** In comparison models, long reasoning often meant the model was stuck repeating itself, not thinking harder.

The model weights and the multilingual reasoning data are released openly.

## What it means for testing

The authors are clear about the limits. The training traces are machine-translated from English, which can anchor reasoning to English templates. They didn't run human evaluations, so the scores measure which language the model reasons in, not whether the reasoning is any good. And the behaviour depends on a trigger phrase; without it, the model may fall back to English.

Those limits are where evaluators come in. A model that answers in Malay but reasons in English can look fine from the outside. When you test multilingual systems, check what language the reasoning is in as well as the answer, and get native speakers to read the traces, not just score the outputs. It's the same lesson as [ROK-FORTRESS](/news/rok-fortress-language-and-context/): translating English material is a starting point, not the finish line.
