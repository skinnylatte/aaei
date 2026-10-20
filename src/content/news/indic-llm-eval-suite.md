---
title: "AI4Bharat and NVIDIA release an evaluation suite for Indian languages, and 2.8 trillion tokens to train on"
date: 2026-10-20
type: review
summary: "Indic-LLM-Eval-Suite gathers benchmarks for 22 Indian languages and checks its translations with native speakers. Its audit found errors in benchmarks people already rely on."
source: https://ai4bharat.github.io/indic-llm-eval-suite-blog/
sourceLabel: AI4Bharat and NVIDIA, October 2026
next: bodhan-indic-language-endpoints
---

A model that solves a maths problem in English may not solve the same problem in Bengali, Kannada or Odia. A model that knows world history may not know Indian history. Until now, anyone trying to measure that has had to track down a dozen separate benchmarks, each set up differently, many of them a generation behind the models they're testing.

AI4Bharat at IIT Madras and NVIDIA released two things this month to change that:

- **[Indic-LLM-Eval-Suite](https://ai4bharat.github.io/indic-llm-eval-suite-blog/)**, an open, growing collection of benchmarks for Indian languages, with the code to run them and the method used to build them.
- **[Nemotron-pretraining-Indic-v1](https://huggingface.co/blog/nvidia/scaling-indic-pretraining)**, about 2.8 trillion tokens of training data across the 22 languages in India's Constitution, along with the pipeline that generated it.

The authors' line is one we agree with: "We cannot meaningfully improve what we cannot reliably measure."

## What's in the suite

The first release covers eight kinds of skill: general chat, instruction following, maths, STEM, commonsense reasoning, knowledge, code and translation. It mixes two kinds of benchmark:

- **Benchmarks built for India**, such as MILU for India-centric knowledge, IndicIFEval for instruction following, Sarvam AI's IndiVibe and Indic-Translate-Bench, and BharatGen's BhashaBench.
- **English benchmarks translated with care**, such as GSM8K, GPQA, AIME 2026 and SWE-bench, for skills that mean the same thing in any language.

Everything runs through NVIDIA's NeMo-Gym, so a model builder can run the whole suite under one setup and get results others can reproduce.

## Translation is where it goes wrong

The team found that machine-translating a benchmark, even with the best systems, doesn't give you a benchmark you can trust. Mistranslate one condition in a maths problem and the right answer changes, but the answer key doesn't. An instruction to use particular words or letters may not survive translation at all. When that happens, the model gets marked wrong for the benchmark's mistake.

So they built a four-step pipeline:

1. **Translate with the benchmark in mind**, with instructions written for each benchmark so the task and how it's scored are kept intact.
2. **Check automatically** for changes in meaning, language errors and broken constraints.
3. **Fix only what's flagged**, then check again.
4. **Have native speakers review it.** Every item that still fails gets a human review, and 20% of the items that pass get spot-checked too.

Even translations that passed the automated checks still had errors. And the problem wasn't limited to translated benchmarks. Their audit of MILU found incomplete questions, missing figures and wrong translations, now fixed in MILU-1.5. In IndicIFEval, some constraints were being checked wrongly or quietly ignored, now fixed in IndicIFEval-1.5.

## What the first results show

The team tested ten open-weight models, from Nemotron, Sarvam, Gemma, Qwen, Gnani and others. No single model came out best at everything. Gemma-4-31B-it had the best average rank in STEM, code, translation, and instruction following and chat. Nemotron-3.5 Super-120B led on knowledge. The gaps can be enormous: on Indic-Translate-Bench, scores for English-to-Indian-language translation ran from under 3 to over 81, depending on the model.

## The training data, and its limits

The companion corpus is mostly English source documents (web text, maths, code, question-and-answer material) translated into Indian languages. Twelve languages also get romanized versions, because that's how many people actually type Hindi, Tamil or Urdu. For ten of the languages, translation is done by Indic Translate from [Bodhan AI](/news/bodhan-indic-language-endpoints/).

NVIDIA added 10 billion Indic tokens to Nemotron 3.5 Super's training, drawn from this corpus mixed with text originally written in Indian languages. Scores on five Indic knowledge and reasoning benchmarks rose by about 5 to 10 percentage points.

The authors are open about the limits. Translated text "does not replace text originally written in Indian languages or guarantee coverage of local knowledge and culture." For twelve of the languages, the model that translates is also the model that judges the translation. And the ten-language workflow still needs more native-speaker review.

## Why we are watching it

This is the argument we make to every team we work with, now backed by evidence from one of the strongest Indian-language research groups. Translating an English test set isn't enough. If benchmarks people already trust contain broken questions and silent scoring bugs, then a score is only as good as the people who checked the test.

Two things stand out for evaluators:

- **Check that the benchmark is right before you trust what it says about the model.** A low score in Odia might be the model's fault, or the translation's. Native-speaker review is what tells you which.
- **Safety isn't covered yet.** The team names multilingual safety, code-mixing and transliteration as directions for future work. Those are exactly where we find harms that English testing misses, and where Indian users will meet them first.

The suite is open to contributions, especially benchmarks for under-represented Indian languages that come with a documented method and reproducible scoring. If you're building one, the team [wants to hear from you](https://ai4bharat.github.io/indic-llm-eval-suite-blog/).
