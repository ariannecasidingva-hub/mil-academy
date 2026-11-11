# MIL Academy — Media & Information Literacy Class Website

A professional, self-contained static website for teaching Media and Information Literacy.

## Features

- **Courses** — Four structured courses with module overviews (Foundations, Evaluating Information, AI & Deepfakes, Digital Citizenship)
- **Video Library** — Embedded YouTube videos from Crash Course Media Literacy, UNESCO, and Center for Civic Education
- **Cheating-resistant Quizzes** — Three quizzes with:
  - Randomized question order
  - Randomized answer choices
  - One question at a time
  - No going back
  - Continuous timer with auto-submit
  - Mild deterrents (disabled right-click / copy during quiz)
  - Instant score + answer review at the end

## How to Use

1. Open `index.html` in a modern browser, **or**
2. Serve the folder with any static file server, e.g.:

```bash
# Python
python -m http.server 8080

# Node (if you have npx)
npx serve .
```

Then visit `http://localhost:8080`.

## Customization

- Edit course descriptions in `courses.html`
- Add/remove video embeds in `videos.html`
- Expand or modify questions in `js/quiz-data.js`
- Adjust branding, colors (Tailwind config in each HTML file), or copy as needed

## Notes on Academic Integrity

These quizzes raise the bar against casual cheating but cannot fully prevent determined students from looking up answers or collaborating. For graded high-stakes use, combine with proctoring, oral assessments, or in-class administration.

## Credits

Video content belongs to the original creators and is embedded for educational purposes.
