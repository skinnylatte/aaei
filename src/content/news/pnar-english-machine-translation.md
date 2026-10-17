---
title: "Pnar–English machine translation reaches ICNLSP 2026"
date: 2026-08-09
type: review
place: Meghalaya
summary: "MWire Labs builds the first benchmark for translating Pnar, a language of Meghalaya with no public machine translation, and finds that data quality matters more than quantity."
source: https://aclanthology.org/2026.icnlsp-1.27/
sourceLabel: ICNLSP 2026, ACL Anthology
image: ../../img/2026_nlp_pnar.jpg
imageAlt: "Poster announcing the paper When Silver Isn't Enough: Data Quality Effects on Pnar-English Machine Translation, accepted at ICNLSP 2026, the International Conference on Natural Language and Speech Processing, 25–26 September 2026, University of Trento, Italy. Beside it is the paper's first page."
---

What happens when an under-resourced language reaches the global NLP stage?

Pnar is spoken mainly in the Jaintia Hills of Meghalaya, in Northeast India. Until now there has been almost no machine translation research for it, and no publicly available translation systems or parallel text. [When Silver Isn't Enough: Data Quality Effects on Pnar–English Machine Translation](https://aclanthology.org/2026.icnlsp-1.27/) has been accepted at ICNLSP 2026, the International Conference on Natural Language and Speech Processing, at the University of Trento on 25–26 September. It sets the first benchmark for translating between Pnar and English.

The work is led by MWire Labs Fellows Riya Tekcham and Fitha Asma Sulfeekhar, with Badal Nyalang, and supported by Emmi Grace. MWire Labs [announced it on LinkedIn](https://www.linkedin.com/feed/update/urn:li:share:7491943718657101824/).

## What they found

The authors fine-tuned two large multilingual translation models, NLLB-200 and mBART-50, on different mixes of data: about 4,800 "gold" sentence pairs translated by paid native translators, about 48,500 "silver" pairs from Pnar news text with machine-generated English, and data borrowed from Khasi, a closely related language.

- **Quality beat quantity.** Across the experiments, better data mattered more than more data. The best results came from combining gold and silver data, rather than from either alone.
- **A close relative isn't a shortcut.** Adding Khasi data preserved meaning but made the Pnar output read less well.
- **Native speakers checked the output.** Two native Pnar speakers rated 50 translations from the best system at 4.25 out of 5 for accuracy and 4.53 for fluency, with strong agreement between them.

The best model, a fine-tuned NLLB-200, is [open on Hugging Face](https://huggingface.co/MWirelabs/pnar-mt) under a CC BY 4.0 licence.

## Why it matters

"For us, this is about making sure languages from Northeast India are not only spoken, but represented in the technologies shaping the future of language and AI," the team writes.

It is also what evaluation for low-resource languages should look like. Before you can test whether a system works in a language, someone has to build the benchmark, and that means native speakers judging the output, not just automatic scores. The Khasi result is a useful warning too: a related language can help a model keep the meaning while still producing text a native speaker wouldn't write.
