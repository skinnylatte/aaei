---
title: "NeoMME: a small multilingual encoder that reads text and images together"
date: 2026-09-03
type: field
summary: "H Company has released NeoMME, open 260M and 800M encoders that handle multilingual text and document images in one model, with a retriever that searches page screenshots instead of extracted text."
source: https://arxiv.org/abs/2609.01657
sourceLabel: H Company, technical report on arXiv
---

H Company has released [NeoMME](https://arxiv.org/abs/2609.01657), a family of multilingual, multimodal encoders, announced on the Hugging Face blog by Tony Wu and Aurélien Lac. The models come in two sizes, 260 million and 800 million parameters, and all checkpoints are open under the Apache 2.0 licence.

## What's different

Most visual document search systems are built on generative vision-language models: a separately trained vision model, a connector, and a text-generating model on top. NeoMME drops all three. A single Transformer reads text and raw image patches together, and it was trained from scratch rather than assembled from existing models. Its tokenizer was also trained from scratch, on multilingual text, code, maths and image transcripts.

## Searching pages, not text

The release includes **NeoMME-Retriever**, tuned to find the right page in a collection of documents. It ranks screenshots of pages rather than text pulled out of PDFs, so layout, tables, charts and fonts all count, and there is no OCR step to go wrong.

- **Accurate for its size.** On the ViDoRe v3 benchmark, the 260M model scored 0.523, within 0.002 of a model about 14 times larger. The 800M model scored 0.556.
- **Fast.** On one NVIDIA L40S GPU, the 260M model encodes about 51 high-resolution pages a second, roughly twice as fast as ColModernVBERT, a similar-sized model.
- **Small indexes.** Compression cut the stored size of each page from about 1.5 MB to 6 kB, 255 times smaller, while keeping more than 95% of retrieval quality.

You can [try it in a demo](https://huggingface.co/spaces/tonywu71/neomme-retriever-demo), or start from the [260M](https://huggingface.co/Hcompany/NeoMME-260M) and [800M](https://huggingface.co/Hcompany/NeoMME-800M) models.

## Why we are watching it

Small, open, multilingual models make it cheaper for teams to build document search and retrieval-augmented systems in their own languages, including over scanned forms and PDFs where text extraction is often unreliable. That makes the next question an evaluation one: the release reports overall benchmark scores, but not how retrieval holds up language by language or script by script. Before relying on it for a ministry's or a hospital's documents, test it on pages in the languages and scripts they actually use.
