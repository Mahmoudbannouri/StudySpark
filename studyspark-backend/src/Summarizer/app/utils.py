from textstat import flesch_reading_ease, text_standard
from langdetect import detect
from textblob import TextBlob

def extract_metrics(text: str, chunks: list) -> dict:
    blob = TextBlob(text)
    return {
        "wordCount": len(text.split()),
        "readabilityScore": flesch_reading_ease(text),
        "readingLevel": text_standard(text),
        "language": detect(text),
        "sentiment": {
            "polarity": blob.sentiment.polarity,
            "subjectivity": blob.sentiment.subjectivity
        },
        "chunksUsed": len(chunks),
        "keywords": blob.noun_phrases[:5],
        "aiModel": "facebook/bart-large-cnn"
    }
