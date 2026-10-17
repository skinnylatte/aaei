---
title: "Translation is not enough: what ROK-FORTRESS shows about multilingual AI safety"
date: 2026-10-17
type: review
summary: "A Korean safety benchmark changes the language and the local context of each prompt separately. Models looked safer in Korean, but much of that safety came from attacks breaking in transcreation, not from stronger safeguards."
source: https://scale.com/blog/rok-fortress-multilingual-ai-safety
sourceLabel: Scale AI, 28 October 2025
---

Most multilingual safety benchmarks take an English prompt and translate it. The scenario stays the same: the same people, the same institutions, the same events. Real deployments don't work that way. When the language changes, the context usually changes with it.

[ROK-FORTRESS](https://scale.com/blog/rok-fortress-multilingual-ai-safety), a benchmark from Scale AI and the Korea AI Safety Institute, tests the two separately. It adds hard evidence for a point at the centre of our work: you cannot judge how a model behaves in a language by translating your English tests into it.

## How the benchmark works

Each adversarial prompt comes in up to four versions, set out in a grid:

| | U.S. context | Korean context |
|---|---|---|
| **English** | the original | English, Korean entities and institutions |
| **Korean** | translated only | fully transcreated |

The authors call this transcreation: adapting both the language and the local grounding while keeping the same harmful intent. Their example is a request built around a mass-casualty attack, which can invoke the 1995 Oklahoma City bombing in the U.S. version or the 1987 bombing of Korean Air Flight 858 in the Korean one.

Every adversarial prompt is also paired with a harmless one, to measure over-refusal. The dataset has 1,235 tasks across four national security and public safety areas: CBRNE threats, political violence and terrorism, criminal and financial activity, and information leakage. Responses are scored by panels of LLM judges, checked against labels written by experts, using rubrics written by expert red teamers for each prompt.

## What they found

**Models looked safer in Korean.** Across nearly all of the 14 models tested, prompts written in Korean and grounded in Korean contexts led to less harmful responses. English prompts generally scored as most harmful, and fully transcreated Korean prompts as least. This held even for models built for Korean. The most and least harmful models differed by nearly nine times.

**Much of that was the attack failing, not the model defending.** The main prompts wrap harmful requests in role-play, invented backstories and emotional appeals. When the researchers stripped those tricks away and asked directly, the Korean advantage mostly vanished. Proprietary models stayed modestly safer in Korean. Five open-source models flipped: they became *more* likely to comply in Korean, which matches earlier findings that moving a request into a lower-resource language can itself get past safeguards.

**Language mattered more than context.** Switching from English to Korean had about 2.5 times the effect of switching from U.S. to Korean entities and institutions: roughly ten percentage points against four.

**Language and context interact, and differently for each model.** In four of the 14 models, adding Korean context significantly weakened the drop in harm that the Korean language brought. No model showed a significant effect the other way.

**The caution has a cost.** Even counting only the cases where models answered, 12 of 14 gave less harmful answers in Korean, so some of the gain is real. But models also refused far more harmless Korean requests, in some cases about twice as often. Refusing more is not the same as telling a real threat from an innocent question.

## Why it matters

Three lessons carry beyond Korean.

1. **Translation-only tests can mislead, not just miss things.** Because the effects of language and context vary from model to model, a translated test set can make one model look safer than another when in deployment it is not.
2. **Test with direct requests as well as clever ones.** An elaborate jailbreak that falls apart in translation tells you about the jailbreak, not the safeguards. The plain version of a harmful request is what showed the open-source models getting weaker in Korean.
3. **Count over-refusal as a failure.** A model that refuses twice as many harmless questions in the local language fails the people who rely on it, even if its harm score looks good.

This fits what ITU's [AI Standards Report 2026](/news/ai-for-good-2026-multilingual-testing/) heard at AI for Good: "Evaluation datasets and safety tests created outside a target context may miss local linguistic, cultural and social realities." ROK-FORTRESS puts numbers on it for one language and one country.

The authors say further testing is needed to see whether the same patterns hold elsewhere. For the languages we work in, including Chinese, Malay, Tamil and Singlish, that is the work to do: test prompts written for the local context, not translated into it, alongside plain requests and harmless ones.

A public subset of the dataset is on Hugging Face, and the paper is available as a preprint on arXiv.
