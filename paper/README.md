# PMA Conference Paper (Draft)

**File:** `pma_conference_paper.tex`  
**Target:** ~6-page IEEE conference format  
**Date:** 2026-08-19

## Compile

```bash
# Debian/Ubuntu
sudo apt install texlive-latex-recommended texlive-fonts-recommended \
  texlive-latex-extra texlive-pictures

pdflatex pma_conference_paper.tex
pdflatex pma_conference_paper.tex   # second pass for refs
```

Or use Overleaf: upload `pma_conference_paper.tex` and set compiler to pdfLaTeX.

## Before you finalize

1. Replace author names, affiliation, emails.
2. Replace **pilot metrics** in Section V / Table I with your measured numbers (they are placeholders to accelerate writing).
3. Confirm video stack wording (mediasoup vs any Zego leftovers in older API docs).
4. Add real related-work citations for your venue.
5. Run iThenticate yourself; paraphrase any overlapping abstract/intro text.

## What is grounded in the real codebase

- NestJS + hbs doctor portal + Flutter patient app split
- HCNSEC triage JSON schema & temperature 0.2
- Health progress severity formula (HIGH=3, MEDIUM=2, LOW=1) and IMPROVING/WORSENING/STABLE
- SSLCommerz payments, Redis prompt cache, MySQL, Docker Compose
- Whisper-tiny → consultation formatter → PDF → Google Drive
- SHA-256 + Polygon (ethers) prescription verify dual-check
- Doctor dashboard: earnings, minutes, consultation counts
