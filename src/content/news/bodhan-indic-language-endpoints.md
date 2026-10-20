---
title: "Bodhan AI opens its Indian-language models, priced in paise"
date: 2026-10-17
type: field
summary: "Bodhan AI has released open weights for speech, OCR, translation and text-to-speech models in Indian languages, and hosted versions priced low enough for government schools."
source: https://console.bodhan.ai
sourceLabel: Bodhan AI console
---

An hour of Indian-language classroom audio transcribed for ₹6. A 300-page textbook digitised for ₹60. That is the pitch behind this week's release from Bodhan AI.

The speech, vision and translation models built by researchers at Bodhan and [AI4Bharat](https://ai4bharat.iitm.ac.in/) for Indian languages are now [open weights on Hugging Face](https://lnkd.in/gj4s8gTP), for anyone with the GPUs to run them. For everyone else, the same models are live as hosted, pay-as-you-go endpoints on the [Bodhan console](https://console.bodhan.ai):

| Endpoint | What it does | Price |
|---|---|---|
| IndicTranscribe | Speech to text | 10 paise per minute |
| IndicOCR | Reading text from page images | 20 paise per page |
| IndicTranslate | Translation | 20 paise per 10,000 output tokens |
| IndicSpeak | Text to speech | ₹6 per 10,000 input characters |

## Why so cheap

The team's argument is that language infrastructure only matters once it is cheap enough to stop thinking about, the way UPI made digital payments too small to notice. "A tutor that costs ten cents per student session will never reach a government school. One that costs a few paise can." The team credits its inference partners at Sarvam AI, and the Bodhan engineers in Chennai who built the gateway, metering and routing.

They are inviting builders in education, health, agriculture and governance to use it. [Model blogs and benchmarks](https://lnkd.in/gMFiCr6U) are published alongside the release.

## Why we are watching it

When transcription costs a few paise a minute, it can go into every classroom, clinic and helpline, and so can its mistakes. Cheap speech and OCR models need testing on the speech and documents they will actually meet: children's voices, regional accents and dialects, code-mixed speech like Hinglish and Tanglish, handwritten and low-quality scans. Price decides whether a model reaches a government school. Evaluation decides whether it should.
