---
title: "HealMed: how medical AI holds up outside English"
date: 2026-08-22
type: review
summary: "A new expert-reviewed benchmark tests 14 models on medical questions in nine languages. Performance fell most in Swahili and Zulu, medical specialisation didn't help, and translation quality alone could move the scores."
source: https://arxiv.org/abs/2608.19981
sourceLabel: HealMed Research Team, arXiv, 20 August 2026
---

Medical language models are almost always benchmarked in English. [HealMed](https://arxiv.org/abs/2608.19981) asks how well they do once you step outside it.

The benchmark comes from the HealMed Research Team, led from the University of Tokyo with collaborators including Yale, Stanford and Korea University. The [dataset is on Hugging Face](https://huggingface.co/datasets/li-lab/HealMed).

## How it was built

- **Nine languages:** English, German, Spanish, Portuguese, Japanese, Chinese, Thai, Swahili and Zulu, with 1,000 examples in each, drawn from nine existing medical datasets.
- **Three task formats:** multiple-choice questions, natural language inference (does one clinical statement follow from another?) and open-ended questions.
- **Expert review throughout:** 23 physicians and medical experts across nine countries and regions worked on it over two years. Every translation was scored and revised by two experts fluent in both English and the target language.
- **Both versions kept:** the original machine translation and the expert-reviewed version, so the effect of expert review can be measured directly.

They tested 14 models: five proprietary models, six open-source general-purpose models and three models built for medicine.

## What they found

**The gap is real, and it is concentrated.** On average, models scored lower in every translated language than in English. In German, Spanish and Portuguese the drop was two to four points; in Japanese, Chinese and Thai about six. In Swahili it was 15 points, and in Zulu 29. In open-ended answers, the share of poor responses rose from 10% in English to 47% in Swahili and 60% in Zulu, with problems in medical terminology in half to two-thirds of them.

**The strongest proprietary models were the most stable.** The five proprietary models had both the highest accuracy and the smallest gaps between higher- and lower-resource languages, between two and six points.

**Medical specialisation didn't buy multilingual robustness.** The three medical models had gaps of 14 to 21 points. And similar overall scores can hide very different gaps: two open-source models scored about 65% overall, but one lost 27 points in lower-resource languages and the other 10.

**Translation quality moves the scores.** Expert revision raised measured performance in some languages and lowered it in others, by around four to six points on average in Thai, Swahili and Zulu. On open-ended questions, the expert-reviewed version scored lower in 18 of 24 language and dataset combinations, which the authors suggest may mean the AI judge was more at home with the literal wording of machine translation.

**AI judges don't replace clinicians.** Checked against medical experts, the AI judge agreed closely in Thai but scored consistently lower in Chinese and Japanese. Agreement on individual answers was strong in Thai and weak in Japanese.

**Models don't always reason in the language they answer in.** One medical model reasoned in Japanese for Japanese questions and in Chinese for Chinese ones, but switched to English for every Thai question it showed reasoning for, even when it answered in Thai.

**Good translation follows local clinical habit.** Thai clinicians keep many English medical terms, because there is often no settled Thai equivalent. Japanese clinicians prefer Japanese terms, but keep English for things like CT, MRI and blood tests. Changing a translated term back to English isn't necessarily fixing a mistake.

## What it means for testing

HealMed is single-turn and modest in size, and the authors note that human evaluation covered only a few languages. But its lessons apply well beyond medicine:

1. **Average scores hide the languages that fail.** Report results language by language, especially for lower-resource ones.
2. **A translated benchmark measures the translation too.** If you can't separate translation errors from model errors, you don't know what your score means.
3. **Check your AI judge in each language.** One that agrees with experts in Thai may not in Japanese.
4. **Native-speaking experts aren't optional.** In medicine, that means clinicians who know how their colleagues actually talk.

It echoes the [Cohere Labs research on in-language reasoning](/news/in-language-reasoning-tiny-aya/) and [ROK-FORTRESS](/news/rok-fortress-language-and-context/): translating English material is where multilingual evaluation starts, not where it ends.
